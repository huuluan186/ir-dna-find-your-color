# QUY TẮC PHÁT TRIỂN & TIÊU CHUẨN DỰ ÁN (AI & DEVELOPER RULES)

Tài liệu này là **QUY CHUẨN BẮT BUỘC** cho toàn bộ quá trình viết code, cấu trúc dự án, quản lý Git, Commit và Pull Request của **IR DNA – Find Your Color**: app trắc nghiệm mã gen màu sắc dùng tại Trạm 2 của triển lãm IDENTITY – IR DNA (Quan hệ quốc tế, HUFLIT).
Bộ quy tắc kế thừa từ dự án Project Registration System (PRS), đã lược bỏ phần C# / SQL Server và điều chỉnh cho Next.js + Supabase.

---

## 0. ĐIỀU HƯỚNG: LÀM VIỆC GÌ THÌ ĐỌC GÌ

AI **tự đọc** các file trong cột "Đọc thêm" theo đúng loại việc đang làm, **không chờ người dùng nhắc trong khung chat**. Đọc xong mới bắt đầu viết code. Nếu tài liệu mâu thuẫn với code hiện có thì lấy code và `supabase/migrations/` làm chuẩn, rồi báo lại người dùng để sửa tài liệu.

### 0.1. Bản đồ thư mục

| Thư mục | Nội dung |
| :--- | :--- |
| `.ai/rules/` | Quy tắc code (file này), nguyên tắc thiết kế phần mềm (`nguyen_tac_thiet_ke.md`) |
| `.ai/system/` | Kiến trúc hệ thống (`kien_truc.md`), thiết kế CSDL (`thiet_ke_csdl.md`) |
| `.ai/skills/` | Hướng dẫn chuyên biệt: commit (`git-commit`), Mantine (`mantine-form`, `mantine-custom-components`), giao diện (`design-taste-frontend`, `minimalist-ui`) |
| `src/app/` | Trang (App Router). `page.tsx` là Server Component thuần |
| `src/components/` | Client Component (`"use client"`), chia theo khu vực: `student/`, `admin/`, `shared/` |
| `src/features/` | Logic phía server theo từng tính năng (Server Actions, truy vấn CSDL) |
| `src/lib/` | Tiện ích thuần: chấm điểm, phiên đăng nhập, kết nối CSDL, âm thanh |
| `src/constants/` | `ROUTES`, `API_ENDPOINTS`, `ASSETS`, cấu hình chung |
| `supabase/` | `migrations/` (đánh số tăng dần), `seed.sql` |
| `public/` | Âm thanh, icon, ảnh tĩnh |

### 0.2. Bảng điều hướng theo loại việc

| Khi làm việc này | Đọc thêm (ngoài file này) |
| :--- | :--- |
| Commit, đặt tên nhánh, tạo PR | Mục 1 và 2 của file này, `.ai/skills/git-commit/SKILL.md` |
| Thiết kế kiến trúc, refactor, quản lý state | `.ai/rules/nguyen_tac_thiet_ke.md`, `.ai/system/kien_truc.md` |
| CSDL: bảng, cột, khóa, migration, seed | `.ai/system/thiet_ke_csdl.md`, `supabase/migrations/` (xem số thứ tự file cuối), mục 1.5 |
| Thuật toán chấm điểm | `.ai/system/kien_truc.md` mục 4, `src/lib/scoring.ts` và test đi kèm |
| Frontend: thêm/sửa trang, component | Mục 4 của file này, `src/constants/`, `node_modules/next/dist/docs/` (Next.js bản mới, khác dữ liệu huấn luyện) |
| Frontend: form (`useForm`, validate) | `.ai/skills/mantine-form/SKILL.md` |
| Frontend: component Mantine tuỳ biến, theme, Styles API | `.ai/skills/mantine-custom-components/SKILL.md` |
| Giao diện sinh viên (màn chào, làm bài, kết quả) | `.ai/skills/design-taste-frontend/SKILL.md`, mục 0.3 |
| Giao diện trang quản trị | `.ai/skills/minimalist-ui/SKILL.md`, mục 0.3 |

### 0.3. Khi skill thiết kế mâu thuẫn với luật dự án
Các skill giao diện viết cho nhiều loại dự án nên mặc định gợi ý Tailwind, shadcn/ui, GSAP, font Geist, icon Phosphor. **Luật dự án luôn thắng skill.**

| Skill gợi ý | Dự án IR DNA làm |
| :--- | :--- |
| Tailwind, shadcn/ui, Radix, thư viện UI khác | **Chỉ dùng Mantine.** Chỉnh qua `theme`, prop, Styles API, CSS Modules |
| Icon Phosphor / Radix Icons | `@tabler/icons-react` (đi kèm Mantine), không trộn bộ icon |
| Font Geist/Satoshi | Be Vietnam Pro qua `next/font` (đủ dấu tiếng Việt) |
| Hiệu ứng GSAP, scroll-hijack | Dùng **Motion** (thư viện chuyển động đã chọn). Không cuộn trang dài, mỗi câu hỏi là một màn |
| Animation lặp vô hạn | Chỉ dùng ở màn chờ "giải mã gen" (vài giây). Luôn tôn trọng `prefers-reduced-motion` |
| `"use client"` rải trong file mẫu | Theo mục 4: cấm trong `page.tsx` |
| Thụt lề trong code mẫu | Theo Prettier của dự án (1 TAB) |
| Cấm em-dash, văn phong marketing | Chỉ áp dụng cho chữ hiển thị trên giao diện |

**Giao diện sinh viên** là trải nghiệm triển lãm: được phép sinh động (màu mạnh, chuyển động, âm thanh), dùng `design-taste-frontend` với độ chuyển động cao nhưng mật độ thông tin thấp, thiết kế cho điện thoại 360–430px trước nhưng vẫn đẹp trên desktop (xem mục 4). **Trang quản trị** là công cụ: dùng `minimalist-ui`, chuyển động nhẹ, ưu tiên dễ đọc.

### 0.4. Quy tắc khi thêm tài liệu mới
* Tài liệu kỹ thuật, hướng dẫn cho AI: đặt trong `.ai/`. Không tạo thư mục riêng cho từng công cụ AI (`.claude`, `.cursor`...).
* Thêm file xong phải **thêm 1 dòng vào bảng 0.2**.
* `AGENTS.md`, `CLAUDE.md`, `GEMINI.md` chỉ là lối tắt trỏ về file này, không viết luật ở đó.

---

## 1. QUY TẮC GIT & COMMIT

### 1.1. Cấu trúc Commit Message
```text
<prefix>(<scope>): <mô tả ngắn gọn nội dung thay đổi>
```
* **Prefix & Scope:** tiếng Anh. **Nội dung:** tiếng Việt có dấu, bắt đầu bằng động từ (`thêm`, `sửa`, `đổi`, `xoá`).
* Đúng **1 dòng**, không body: `git commit -m "<prefix>(<scope>): <nội dung>"`.

### 1.2. 12 Prefix hợp lệ (BẮT BUỘC)
**Không dùng `chore:`** trong commit message (chỉ dùng cho tên nhánh). Việc lặt vặt dùng `commit:`.

| Prefix | Ý nghĩa | Ví dụ |
| :--- | :--- | :--- |
| **`add`** | Thêm tính năng, file, dependency mới | `add(quiz): thêm màn làm bài từng câu` |
| **`update`** | Sửa/cập nhật tính năng hoặc UI sẵn có | `update(result): đổi bố cục bảng xếp hạng màu` |
| **`fix`** | Sửa lỗi | `fix(auth): sửa lỗi mất phiên khi quay lại` |
| **`improve`** | Nâng cấp hiệu năng, UX | `improve(quiz): tải trước âm thanh sau khi bấm bắt đầu` |
| **`refactor`** | Tái cấu trúc, không đổi hành vi | `refactor(scoring): tách hàm trộn màu` |
| **`remove`** | Xoá code, file, thư viện thừa | `remove(ui): xoá component thẻ cũ` |
| **`replace`** | Thay thư viện/giải pháp | `replace(sound): đổi Web Audio sang Howler` |
| **`start`** | Khởi tạo khung cho module mới | `start(admin): dựng khung trang quản trị` |
| **`docs`** | Tài liệu, markdown, comment | `docs(ai): thêm thiết kế CSDL` |
| **`resolve`** | Xử lý dứt điểm issue cụ thể | `resolve(#12): khắc phục lỗi hoà điểm` |
| **`build`** | Commit phục vụ build/deploy | `build: release ver 1.0.0` |
| **`commit`** | Việc lặt vặt, cấu hình chung | `commit: cấu hình prettier` |

### 1.3. Quy tắc Đặt tên Nhánh
Cú pháp `<branch-type>/<mô-tả>`. Dùng `feature/` (không dùng `feat/`). Các loại: `feature/`, `fix/`, `update/`, `refactor/`, `prototype/`, `hotfix/`, `chore/`, `docs/`, `database/`.

### 1.4. Kỹ thuật Commit
* **Không dùng `git add .`**, stage từng file.
* Chia commit theo chủ đề; commit tầng dưới (CSDL, `lib/`) trước tầng dùng nó (component, trang).

### 1.5. Quy trình thay đổi CSDL
1. Mỗi thay đổi cấu trúc là **một file migration mới** trong `supabase/migrations/` (đánh số tiếp theo: `0002_...sql`). Không sửa migration đã chạy trên CSDL thật.
2. Làm trên nhánh `database/<mô-tả>`, tạo PR riêng vào `main`, cập nhật `.ai/system/thiet_ke_csdl.md` trong cùng PR.
3. Sau khi merge, chạy migration trên Supabase (SQL Editor) rồi các nhánh tính năng pull `main` về.

---

## 2. QUY TẮC TẠO PULL REQUEST (PR)

### 2.1. Tiêu đề
Ngắn gọn, nêu chức năng chính. Ví dụ: `Màn kết quả: bảng xếp hạng 6 màu và màu riêng`.

### 2.2. Nội dung (BẮT BUỘC đủ 2 phần, tối đa 4000 ký tự)
```markdown
### 1. Miêu tả thay đổi
- **Thêm mới:** [tính năng, component, bảng/cột mới]
- **Chỉnh sửa:** [file/logic đã sửa]
- **Loại bỏ:** [code, thư viện thừa đã dọn]

### 2. Hướng dẫn Test (Step-by-step)
1. Mở link xem thử Vercel của PR trên điện thoại
2. Nhập mã SV `2300001234`, họ tên `Nguyễn Văn A`
3. Làm hết bài, chọn toàn đáp án A
4. **Kết quả mong đợi:** [màu chính, phần trăm, hiệu ứng, âm thanh]
```

---

## 3. LƯU Ý VỀ TESTING
* **Không viết unit test**, trừ thuật toán chấm điểm `src/lib/scoring.ts` (hàm thuần, test bằng Vitest với ví dụ trong `.ai/system/kien_truc.md`).
* Kiểm thử tay trên link xem thử của Vercel: Safari iPhone, Chrome Android, trình duyệt trong Zalo, và một trình duyệt desktop.

---

## 4. QUY TẮC FRONTEND (NEXT.JS + MANTINE)

* **Prettier:** thụt lề **1 TAB** (`useTabs: true`), xem `.prettierrc`.
* **UI:** Mantine. Chuyển động: Motion. Âm thanh: Howler (`src/lib/sound.ts`). Không thêm thư viện UI khác.
* **Directives:** **Cấm `"use client"` và `"use server"` trong `page.tsx`.** `page.tsx` là Server Component thuần; tương tác tách ra Client Component trong `src/components/`. Server Action đặt trong `src/features/<tính-năng>/actions.ts` với `"use server"` ở đầu file.
* **Hằng số:** Không hardcode đường dẫn trang, API, ảnh, âm thanh. Khai báo ở `src/constants/` (`ROUTES`, `API_ENDPOINTS`, `ASSETS`).
* **Chạy trên mọi thiết bị, ưu tiên điện thoại:** phần lớn người dùng là điện thoại (iPhone Safari, Android Chrome, trình duyệt trong Zalo/Messenger), nhưng desktop và tablet cũng phải dùng tốt.
	* Thiết kế 360–430px trước, rồi mở rộng: ≥ 768px giao diện sinh viên nằm giữa trong khung tối đa ~480px (như một thẻ app), trang admin dùng hết bề ngang.
	* Ô nhập cỡ chữ ≥ 16px (`size="md"`), nút cao ≥ 44px, dùng `100dvh` và safe-area, mã SV dùng `inputMode="numeric"`.
	* Trên desktop: hỗ trợ bàn phím (phím 1–4 hoặc A–D chọn đáp án, Enter để tiếp), trạng thái hover và focus rõ ràng.
	* Trình duyệt mục tiêu: Safari iOS 16+, Chrome Android 2 bản gần nhất, Chrome/Edge/Firefox/Safari desktop bản mới. Âm thanh chỉ phát sau khi người dùng chạm/bấm.
* **Bảo mật dữ liệu:** Client không bao giờ gọi Supabase trực tiếp và không nhận điểm của đáp án. Mọi truy vấn qua `src/lib/db.ts` (chỉ chạy phía server).

---

## 5. QUY TẮC BACKEND (NEXT.JS SERVER + SUPABASE)

* **Cấu hình:** biến môi trường trong `.env.local` (máy local) và Vercel (bản chạy thật); mẫu ở `.env.example`. Không commit `.env.local`.
* **Kiểm tra dữ liệu vào:** mọi Server Action và route handler kiểm tra input bằng Zod trước khi chạm CSDL.
* **Đặt tên CSDL (Postgres):** bảng và cột **chữ thường, snake_case, tiếng Việt không dấu** (`mau_gen`, `cau_hoi`, `dap_an`, `diem_dap_an`, `sinh_vien`, `ket_qua`, `cai_dat`). Không dùng chữ hoa vì Postgres buộc phải đặt trong ngoặc kép. Khoá chính dạng `id_<bảng>` (riêng `sinh_vien` dùng `mssv`).
* **Trường audit:** bảng nội dung (`mau_gen`, `cau_hoi`, `dap_an`) có `created_at`, `updated_at`, `is_deleted`, `deleted_at`; xoá là xoá mềm để kết quả cũ không mất tham chiếu.
* **Xử lý lỗi:** không trả thông báo lỗi nội bộ hay stack trace về client. Ghi log bằng `console.error` (hiện trong Vercel Logs), trả thông báo chung "Lỗi hệ thống, vui lòng thử lại sau".
