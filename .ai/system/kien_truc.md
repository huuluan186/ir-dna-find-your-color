# KIẾN TRÚC HỆ THỐNG - IR DNA – FIND YOUR COLOR

Một ứng dụng Next.js duy nhất (giao diện + backend) chạy trên Vercel, dữ liệu trên Supabase Postgres. Trình duyệt **không bao giờ** gọi CSDL trực tiếp và **không bao giờ** nhận điểm của đáp án.

**Tên kiến trúc:** Modular Monolith full-stack chạy serverless, tổ chức theo **Vertical Slice Architecture** (mỗi tính năng một lát cắt `server/` + `client/` + `schema.ts`). Dữ liệu server do **TanStack Query** quản lý (SSR prefetch + hydrate), CSDL là Supabase (BaaS).

---

## 1. SƠ ĐỒ TỔNG THỂ

```mermaid
flowchart TB
	subgraph Client["Trình duyệt"]
		SV["Điện thoại sinh viên<br/>quét QR tại Trạm 2"]
		AD["Máy nhóm tổ chức<br/>trang /admin"]
	end

	subgraph Vercel["Vercel - Next.js app"]
		direction TB
		subgraph UI["Giao diện: React + Mantine + Motion + Howler + TanStack Query"]
			P1["/ Màn chào + đăng ký / đăng nhập"]
			P2["/quiz Làm bài"]
			P3["/result Kết quả"]
			P4["/admin/* Quản trị"]
		end
		subgraph SRV["Server: Route Handlers /api/* (Vertical Slice)"]
			F1["features/auth<br/>phiên SV, phiên admin"]
			F2["features/quiz<br/>lấy đề (bỏ điểm), nộp bài"]
			F3["lib/scoring.ts<br/>CHẤM ĐIỂM (hàm thuần)"]
			F4["features/admin<br/>CRUD màu, câu hỏi, thống kê, CSV"]
		end
		MW["middleware.ts<br/>chặn /admin, /quiz, /result"]
	end

	DB[("Supabase Postgres<br/>7 bảng, RLS chặn mọi truy cập công khai")]

	SV -- HTTPS --> MW
	AD -- HTTPS --> MW
	MW --> UI
	UI --> SRV
	F2 --> F3
	SRV -- "service role key<br/>(chỉ ở server)" --> DB
```

**Nguyên tắc:**
- Một giao diện responsive cho mọi thiết bị: điện thoại iOS/Android là chính, desktop và tablet dùng được đầy đủ (giao diện sinh viên nằm trong khung ~480px ở giữa màn hình lớn).
- Mọi truy cập CSDL đi qua `src/lib/db.ts` bằng service role key (biến môi trường Vercel). RLS bật trên mọi bảng, không có policy cho `anon`.
- Chấm điểm chạy trên server. Client chỉ gửi danh sách `id_dap_an` đã chọn.
- Backend chỉ là route handler trong `src/app/api/`, không dùng Server Actions.
- Một repo, một lần deploy. Không có server riêng phải bật/tắt.

## 2. LUỒNG SINH VIÊN

```mermaid
sequenceDiagram
	autonumber
	actor SV as Sinh viên
	participant App as Next.js (server)
	participant DB as Supabase

	SV->>App: Mở link (quét QR) → /
	SV->>App: Nhập mã SV
	App->>DB: Tìm sinh_vien theo mssv
	alt Đã có
		App-->>SV: "Chào Nguyễn Văn A" → xác nhận
	else Chưa có
		SV->>App: Nhập họ tên
		App->>DB: Thêm sinh_vien
	end
	App-->>SV: Cookie phiên (ký bằng SESSION_SECRET)
	SV->>App: Vào /quiz
	App->>DB: Lấy cau_hoi + dap_an đang bật (cache)
	App-->>SV: Bộ đề KHÔNG kèm điểm
	Note over SV: Làm 12 câu. Đáp án giữ tạm trên máy,<br/>chưa gửi; rớt mạng giữa chừng vẫn làm tiếp được
	SV->>App: Nộp danh sách id_dap_an
	App->>DB: Lấy diem_dap_an + mau_gen
	App->>App: scoring.ts: mỗi đáp án +1 cho gen của nó → gen điểm cao nhất (có thể hoà)
	App->>DB: Lưu 1 dòng vào ket_qua
	App-->>SV: /result: gen nổi bật (hoặc DNA kết hợp / đồng hạng / đa sắc)
```

## 3. TRANG VÀ QUYỀN TRUY CẬP

| Đường dẫn | Ai dùng | Cần phiên | Nội dung |
| :--- | :--- | :--- | :--- |
| `/` | Sinh viên | Không | Màn chào, nhập mã SV, họ tên nếu là lần đầu |
| `/quiz` | Sinh viên | Phiên SV | Mỗi câu một màn, tiến độ "Câu 3/12", bắt buộc chọn mới qua câu, câu cuối có nút "Xem kết quả IR DNA" |
| `/result` | Sinh viên | Phiên SV | Hoạt ảnh giải mã → gen nổi bật (hoặc DNA kết hợp / đồng hạng / đa sắc), mỗi gen: tên, màu, 3 từ khoá, mô tả, lĩnh vực gợi ý, kỹ năng phát triển; điểm 6 gen; thông điệp chung; lưu ý tham khảo; làm lại |
| `/admin/login` | Nhóm | Không | Mật khẩu chung `ADMIN_PASSWORD` |
| `/admin/mau-gen` | Nhóm | Phiên admin | Sửa 6 mã gen: nội dung và mã màu (chọn bằng `ColorInput`/color picker của Mantine) |
| `/admin/cau-hoi` | Nhóm | Phiên admin | Câu hỏi, 4 đáp án, mỗi đáp án chọn đúng 1 gen (+1); cảnh báo khi số lần xuất hiện của 6 gen lệch nhau (chuẩn: 8 lần mỗi gen) |
| `/admin/ket-qua` | Nhóm | Phiên admin | Danh sách kết quả, biểu đồ tỉ lệ màu, xuất CSV |
| `/admin/qr` | Nhóm | Phiên admin | Mã QR của link app, tải PNG/SVG để in |

## 4. THUẬT TOÁN CHẤM ĐIỂM (`src/lib/scoring.ts`)

Theo đúng tài liệu nội dung của nhóm tổ chức (`docs/noi-dung-web.md` mục IV–V). Hàm thuần, không gọi CSDL:

```ts
score(input: {
	colorIds: number[]; // 6 gen
	questions: { id: number; options: { id: number; colorId: number }[] }[]; // mỗi phương án gán đúng 1 gen
	selected: number[]; // id_dap_an, mỗi câu đúng 1 đáp án
}) => {
	points: { colorId: number; points: number }[]; // giảm dần, tổng luôn = số câu (12)
	topColorIds: number[]; // mọi gen đạt điểm cao nhất
	kind: "don" | "ket_hop" | "dong_hang" | "da_sac";
}
```

1. **Cộng điểm:** mỗi đáp án đã chọn cộng **1 điểm** cho gen của nó. Không có điểm trừ, không có phần trăm.
2. **Gen nổi bật:** mọi gen có điểm bằng điểm cao nhất. **Không phá hoà**, không trộn màu.
3. **Loại kết quả:** 1 gen → `don` (mã gen nổi bật); 2 gen → `ket_hop` ("DNA kết hợp", VD Gen Đỏ × Gen Cam); 3–5 gen → `dong_hang` (hiện tất cả); cả 6 gen bằng điểm → `da_sac` ("DNA đa sắc", kèm câu thông báo trong tài liệu nội dung).
4. **Kiểm tra đầu vào:** mỗi câu đúng 1 đáp án, id đáp án phải thuộc đề; sai thì báo lỗi để route trả 400.

Tự kiểm tra (không viết unit test) bằng script tạm theo checklist mục VIII của tài liệu nội dung: 1 gen thắng, hoà 2, hoà 3 trở lên, hoà cả 6 (mỗi gen 2 điểm). Ví dụ trong tài liệu: Đỏ 3, Cam 3, Vàng 2, Xanh lá 1, Xanh dương 2, Tím 1 → `ket_hop` Đỏ × Cam.

## 5. LUỒNG DỮ LIỆU (TANSTACK QUERY + SSR)

```mermaid
flowchart LR
	subgraph Server["Server (Next.js)"]
		PG["page.tsx (RSC)<br/>prefetchQuery"]
		Q["features/*/server/queries.ts"]
		API["app/api/* route handler<br/>Zod + ghi CSDL"]
	end
	DB[("Supabase")]
	subgraph Browser["Trình duyệt"]
		HB["HydrationBoundary<br/>nhận cache đã dehydrate"]
		UQ["useQuery<br/>features/*/client/hooks.ts"]
		UM["useMutation<br/>retry + invalidateQueries"]
	end

	PG --> Q --> DB
	PG -- "dehydrate" --> HB --> UQ
	UQ -- "refetch / staleTime" --> API
	UM --> API --> DB
	UM -. "invalidateQueries" .-> UQ
```

| Quy ước | Nội dung |
| :--- | :--- |
| Cache | Chỉ dữ liệu server. UI state ở `useReducer`/`useState` + `sessionStorage` |
| Prefetch | `page.tsx` gọi thẳng `features/*/server/queries.ts`, không tự gọi HTTP |
| Query key | Tập trung ở `src/constants/query-keys.ts` |
| Mặc định | `staleTime` 60 giây, `retry` 2 |

Áp dụng theo tính năng:
- **Nộp bài:** `useMutation` `retry: 3` có backoff; đáp án vẫn giữ trên máy nên rớt mạng không mất bài.
- **Bộ đề:** `staleTime: Infinity`, tải một lần (đã bỏ điểm).
- **Admin:** thêm/sửa/xoá xong `invalidateQueries`; trang kết quả `refetchInterval: 15s`; kéo thả thứ tự câu hỏi dùng optimistic update.
- **Devtools:** `@tanstack/react-query-devtools` chỉ bật khi dev.

## 6. ĐĂNG NHẬP & PHIÊN

| Đối tượng | Đăng nhập | Phiên |
| :--- | :--- | :--- |
| Sinh viên | Mã SV (+ họ tên lần đầu), không mật khẩu | Cookie httpOnly ký JWT (`jose`), 7 ngày |
| Admin | Mật khẩu chung `ADMIN_PASSWORD` | Cookie admin riêng, 12 giờ; giới hạn số lần thử |

Nâng cấp sau (nếu cần): Supabase Auth + đăng nhập Microsoft email trường, không đổi CSDL nội dung.

## 7. CẤU TRÚC THƯ MỤC

```text
ir-dna-find-your-color/
├── .ai/
│   ├── rules/          quy_tac_code.md, nguyen_tac_thiet_ke.md
│   ├── system/         kien_truc.md (file này), thiet_ke_csdl.md
│   └── skills/         design-taste-frontend, minimalist-ui, mantine-form,
│                       mantine-custom-components, git-commit
├── AGENTS.md           điểm vào cho AI (CLAUDE.md, GEMINI.md trỏ về đây)
├── src/
│   ├── app/                                   # page.tsx = Server Component thuần
│   │   ├── layout.tsx                         # Providers (Mantine + QueryClient), font
│   │   ├── page.tsx                           # màn chào + đăng ký/đăng nhập
│   │   ├── quiz/page.tsx
│   │   ├── result/page.tsx
│   │   ├── admin/
│   │   │   ├── login/page.tsx
│   │   │   ├── mau-gen/page.tsx
│   │   │   ├── cau-hoi/page.tsx
│   │   │   ├── ket-qua/page.tsx
│   │   │   └── qr/page.tsx
│   │   └── api/
│   │       ├── auth/student/route.ts, auth/admin/route.ts
│   │       ├── quiz/route.ts, quiz/submit/route.ts
│   │       └── admin/colors/, questions/, results/, export/   # route.ts
│   ├── components/                            # "use client"
│   │   ├── student/   WelcomeForm, QuestionCard, DnaProgress, DecodeAnimation,
│   │   │              ResultHero, ColorRanking, SoundToggle
│   │   ├── admin/     ColorEditor, QuestionEditor, BalanceWarning, ResultsTable,
│   │   │              ColorChart, QrPanel
│   │   └── shared/    Providers, StudentFrame (khung ~480px), Disclaimer
│   ├── features/                              # mỗi tính năng một lát cắt
│   │   ├── auth/  server/ (queries.ts, mutations.ts), client/ (api.ts, hooks.ts), schema.ts
│   │   ├── quiz/  server/ (lấy đề bỏ điểm, nộp bài), client/, schema.ts
│   │   └── admin/ server/, client/, schema.ts
│   ├── lib/
│   │   ├── scoring.ts           # chấm điểm (hàm thuần)
│   │   ├── db.ts                # Supabase client, chỉ server ("server-only")
│   │   ├── session.ts           # ký/đọc cookie SV và admin
│   │   ├── query-client.ts      # QueryClient (server: mỗi request, client: 1 bản)
│   │   └── sound.ts             # Howler (nhạc nền) + ZzFX (hiệu ứng), xem am_thanh.md
│   ├── constants/  routes.ts, api-endpoints.ts, query-keys.ts, assets.ts, app.ts
│   ├── mock-data/  quiz.ts      # dữ liệu mẫu (prototype): 6 màu, 10 câu, điểm
│   ├── theme.ts                 # theme Mantine: màu, font, bo góc
│   └── middleware.ts            # chặn trang theo phiên
├── supabase/
│   ├── migrations/0001_init.sql
├── public/  sounds/ (mp3 CC0), icons/
├── .env.example  .prettierrc  package.json  next.config.ts
└── README.md
```

## 8. CÔNG NGHỆ

| Nhóm | Thư viện | Phiên bản (npm, 13/10/2026) |
| :--- | :--- | :--- |
| Nền tảng | Next.js (App Router) + TypeScript, React | 16.4, 19.3 |
| Giao diện | Mantine (`core`, `hooks`, `form`, `notifications`, `charts`), `@tabler/icons-react` | 9.7 |
| Chuyển động | Motion, canvas-confetti | 14.1, 1.9 |
| Âm thanh | Howler.js (nhạc nền) + ZzFX (hiệu ứng tạo bằng code) | 2.2 / 1.4 |
| CSDL | `@supabase/supabase-js` | 2.117 |
| Dữ liệu server | `@tanstack/react-query` (+ devtools khi dev) | 5.104 |
| Kiểm tra dữ liệu | Zod | 4.6 |
| Phiên | jose | 6.2 |
| QR | qrcode.react | 4.2 |

## 9. BIẾN MÔI TRƯỜNG

| Biến | Nguồn |
| :--- | :--- |
| `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | Vercel tự điền khi gắn Supabase (Storage), hoặc Supabase → Settings → API |
| `SESSION_SECRET` | Chuỗi ngẫu nhiên ≥ 32 ký tự |
| `ADMIN_PASSWORD` | Nhóm tự đặt |
| `NEXT_PUBLIC_APP_URL` | Link chính thức, dùng để sinh mã QR |
