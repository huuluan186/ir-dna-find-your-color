# TIẾN ĐỘ & BÀN GIAO - IR DNA – FIND YOUR COLOR

File này để một AI (hoặc người) mới vào dự án nắm nhanh: dự án là gì, đã làm tới đâu, việc gì tiếp theo. **Cập nhật file này mỗi khi xong một bước.** Cập nhật lần cuối: 14/10/2026.

Đọc theo thứ tự: `AGENTS.md` → `.ai/rules/quy_tac_code.md` → file này → `.ai/system/kien_truc.md` → `.ai/system/thiet_ke_csdl.md`.

---

## 1. DỰ ÁN LÀ GÌ

Web app trắc nghiệm cho **Trạm 2 "FIND YOUR COLOR"** của triển lãm **IDENTITY (WHO WE ARE) – IR DNA**, môn Nhập môn Quan hệ quốc tế, HUFLIT. Sinh viên quét mã QR tại trạm, làm bài trắc nghiệm trên điện thoại, nhận **mã gen màu sắc** nổi bật (1 trong 6 gen), rồi sang Trạm 3 tìm hiểu lĩnh vực nghề nghiệp. Nhóm tổ chức có trang `/admin` để sửa nội dung, xem thống kê, xuất CSV, in mã QR.

- Kết quả chỉ mang tính tham khảo, không phải công cụ đánh giá tâm lý (phải có dòng lưu ý này trên trang kết quả).
- Công nghệ: Next.js 16 (App Router) + React 19 + TypeScript, Mantine 9, TanStack Query 5, Supabase Postgres, deploy Vercel. Chi tiết ở `kien_truc.md` mục 8.

**Nội dung thật từ nhóm tổ chức** nằm trong `docs/` (chưa commit, tên file có dấu cách):
- `docs/Ndung_Web cho bé KVy (1).md`: **bộ 12 câu hỏi chính thức, bảng gán mã gen, quy tắc tính điểm, nội dung 6 gen hiển thị trên trang kết quả, checklist trước triển lãm.** Đây là nguồn sự thật cho nội dung và luật chấm.
- `docs/Kịch bản_DNA_Đánh Đổi.pdf`: kịch bản tổng thể 4 trạm của triển lãm (bối cảnh, không có yêu cầu kỹ thuật).

## 2. QUY ƯỚC LÀM VIỆC VỚI HUU (CHỦ DỰ ÁN)

- Làm **thẳng trên `main`**, commit 1 dòng đúng chuẩn `quy_tac_code.md` mục 1, stage từng file, push thẳng `main`, **không tạo nhánh, không tạo PR** (luật nhánh/PR trong `quy_tac_code.md` tạm không áp dụng).
- **Không tự chạy `npm run dev`** hay mở server; Huu tự chạy. Được chạy lệnh một lần rồi thoát (`tsc`, `next build`, `eslint`, `prettier`).
- **Không viết unit test**, không cài Vitest. Muốn kiểm tra logic thì viết script tạm, chạy (`node --experimental-strip-types`), xong xoá, không commit.
- Làm **từng bước nhỏ**, xong một bước thì báo kết quả rồi dừng, chờ Huu chọn bước tiếp.
- Trả lời Huu bằng tiếng Việt.

## 3. ĐÃ LÀM XONG

| Phần | File | Ghi chú |
| :--- | :--- | :--- |
| Khung dự án | `package.json`, `next.config.ts`, `postcss.config.mjs`, `.prettierrc`, `eslint.config.mjs` | Prettier 1 TAB. PostCSS preset Mantine |
| Theme, font, Providers | `src/theme.ts`, `src/app/layout.tsx`, `src/components/shared/Providers.tsx` | Màu chính `dna` (#1E4FA3), Be Vietnam Pro, QueryClient + devtools khi dev |
| Khung giao diện sinh viên | `src/components/shared/StudentFrame.tsx` + `.module.css` | Toàn màn hình trên điện thoại, thẻ 480px ở giữa từ 768px |
| Màn chào tạm | `src/app/page.tsx` | Chỉ có tiêu đề, chưa có form |
| Hằng số | `src/constants/` (`routes`, `api-endpoints`, `query-keys`, `assets`, `app`) | Đã khai báo sẵn đường dẫn cho mọi trang/API dự kiến |
| QueryClient | `src/lib/query-client.ts` | Server tạo mới mỗi request, trình duyệt dùng một bản |
| CSDL | `supabase/migrations/0001_init.sql` | 7 bảng, bật RLS. **Chưa chạy trên Supabase thật** (chưa có khoá trong `.env`) |
| Dữ liệu mẫu | `src/mock-data/quiz.ts` | 6 màu + 10 câu **tự bịa** (prototype), điểm 1–5 nhiều màu. **Đã lỗi thời**, xem mục 4 |
| Chấm điểm | `src/lib/scoring.ts` | Làm theo `kien_truc.md` mục 4 (phần trăm, phá hoà, trộn màu riêng). **Lệch với luật chấm thật**, xem mục 4 |

Build `next build` chạy qua, `tsc` không lỗi (14/10/2026).

**Thư viện chưa cài** (có trong `kien_truc.md` mục 8 nhưng chưa có trong `package.json`): `@mantine/form`, `@mantine/notifications`, `@mantine/charts` + `recharts`, `motion`, `canvas-confetti`, `howler`, `@supabase/supabase-js`, `zod`, `jose`, `server-only`, `qrcode.react`; dev: `@types/howler`, `@types/canvas-confetti`. Cài khi bước nào cần tới, hỏi Huu trước.

## 4. ⚠️ NỘI DUNG THẬT MÂU THUẪN VỚI THIẾT KẾ HIỆN TẠI (PHẢI XỬ LÝ TRƯỚC)

Tài liệu `kien_truc.md`, `thiet_ke_csdl.md`, mock-data và `scoring.ts` được viết **trước** khi có file nội dung thật. So với `docs/Ndung_Web cho bé KVy (1).md`:

| # | Thiết kế hiện tại | Nội dung thật yêu cầu |
| :---: | :--- | :--- |
| 1 | 8–10 câu | **12 câu**, mỗi câu 4 phương án, 3–5 phút |
| 2 | Mỗi đáp án cộng 1–5 điểm cho 1–3 màu (admin: chính +3, phụ +1) | **Mỗi phương án gán đúng 1 gen, cộng 1 điểm.** Tổng điểm 6 gen luôn = 12 |
| 3 | Phần trăm = điểm / điểm tối đa, xếp hạng, phá hoà theo câu gần cuối, trộn màu riêng 2 màu đầu | **Gen điểm cao nhất thắng. Không phá hoà.** 2 gen hoà: "DNA kết hợp" (VD Gen Đỏ × Gen Cam). ≥3 gen hoà: hiện tất cả. Cả 6 bằng nhau (2 điểm mỗi gen): "DNA đa sắc" + câu thông báo riêng |
| 4 | 6 màu tự đặt: Lam/Ngoại giao, Vàng/Truyền thông, Tím/Chiến lược, Cam/Kinh tế đối ngoại, Xanh lá/Phát triển bền vững, Đỏ/Lãnh đạo | 6 gen thật: **Đỏ – Người dẫn dắt, Cam – Người kết nối, Vàng – Người truyền cảm hứng, Xanh lá – Người kiến tạo, Xanh dương – Người phân tích, Tím – Người sáng tạo chiến lược**. Chưa có mã hex chính thức |
| 5 | `mau_gen` có `y_nghia`, `linh_vuc` | Mỗi gen cần: tên, màu, **3 từ khoá** (VD "Chủ động · Quyết đoán · Dám thử thách"), mô tả, **lĩnh vực gợi ý**, **kỹ năng phát triển** → cần migration `0002` thêm cột (VD `tu_khoa`, `ky_nang`) |
| 6 | `ket_qua` có 1 `id_mau_chinh` + `ma_hex_rieng` | Kết quả có thể **nhiều gen đồng hạng** → cần lưu danh sách gen cao nhất (VD `jsonb`), xem lại `ma_hex_rieng` |
| 7 | Nhập mã SV (+ họ tên) trước khi làm bài | Tài liệu chỉ nói: trang mở đầu có nút **"Bắt đầu khám phá"**, không nhắc đăng nhập. Hỏi Huu có giữ bước nhập mã SV không |
| 8 | Thanh tiến độ dạng chuỗi DNA | Có thanh tiến trình kiểu **"Câu 3/12"**, bắt buộc chọn đáp án mới qua câu, cuối bài nút **"Xem kết quả IR DNA"** |
| 9 | Không xáo đáp án | Nếu xáo thứ tự phương án thì gen phải đi theo phương án, không theo chữ A/B/C/D |

Câu chốt cuối trang kết quả và câu thông báo "DNA đa sắc" lấy nguyên văn trong file nội dung.

**Cần Huu quyết** trước khi sửa: (a) có giữ màu riêng/phần trăm như phần trang trí phụ không; (b) có giữ nhập mã SV không; (c) mã hex 6 gen lấy ở đâu.

## 5. VIỆC TIẾP THEO (ĐỀ XUẤT THEO THỨ TỰ)

1. **Chốt mâu thuẫn ở mục 4 với Huu**, sửa `kien_truc.md` mục 2–4 và `thiet_ke_csdl.md` cho khớp nội dung thật.
2. **Thay mock-data** `src/mock-data/quiz.ts` bằng 12 câu + 6 gen thật từ file nội dung (vẫn để ở mock-data, gắn badge "P" cho tới khi có CSDL thật). Mỗi đáp án `diem: { [gen]: 1 }`.
3. **Viết lại `src/lib/scoring.ts`** theo luật thật: đếm điểm 6 gen, trả về danh sách gen cao nhất + loại kết quả (`don` / `ket_hop` / `dong_hang` / `da_sac`). Tự kiểm bằng script tạm theo checklist mục VIII của file nội dung (1 gen thắng, hoà 2, hoà 3+, hoà cả 6).
4. **Migration `0002`** (nếu cần) cho cột mới của `mau_gen` và `ket_qua`. Chưa chạy được trên Supabase vì chưa có khoá.
5. **Giao diện sinh viên** đọc mock-data: màn chào (+ form mã SV nếu giữ) → màn làm bài từng câu (`QuestionCard`, tiến độ "Câu x/12", phím 1–4/A–D) → màn chờ giải mã → màn kết quả (1 gen / kết hợp / đồng hạng / đa sắc). Đọc `.ai/skills/design-taste-frontend/SKILL.md` trước. Cài `motion`, `howler`, `canvas-confetti` ở bước này.
6. **Backend**: `src/lib/db.ts`, `src/lib/session.ts`, route `api/quiz` (bỏ điểm khỏi đề), `api/quiz/submit` (gọi `scoring.ts`, lưu `ket_qua`), `api/auth/student`. Cần Huu tạo project Supabase và điền `.env.local`.
7. **Trang admin**: đăng nhập mật khẩu chung, sửa gen, sửa câu hỏi, bảng kết quả + biểu đồ + CSV, trang QR.
8. Deploy Vercel, tạo và quét thử QR, chạy checklist mục VIII của file nội dung.

## 6. TRẠNG THÁI GIT LÚC BÀN GIAO

- `package-lock.json` hiện báo đã sửa nhưng nội dung JSON giống hệt bản đã commit (chỉ khác thụt lề). Không cần commit riêng; lần `npm i` tới sẽ ghi lại.
- `docs/` chưa commit. Hỏi Huu có muốn đưa vào git không.
