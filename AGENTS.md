# AGENTS.md: ĐIỂM VÀO DUY NHẤT CHO MỌI AI CODING

Đây là file luật gốc của dự án **IR DNA – Find Your Color**, app trắc nghiệm mã gen màu sắc cho Trạm 2 của triển lãm IDENTITY – IR DNA (Quan hệ quốc tế, HUFLIT).
Mọi AI (Claude Code, Codex, Cursor, Copilot, Gemini...) **phải đọc file này trước khi làm bất kỳ việc gì**, rồi đọc tiếp các tài liệu trong bảng "Làm việc gì thì đọc gì" (mục 0 của `.ai/rules/quy_tac_code.md`) **mà không cần người dùng nhắc**.

`CLAUDE.md`, `GEMINI.md` chỉ là lối tắt trỏ về đây. **Không viết luật vào các file đó.** Muốn thêm hoặc sửa luật thì sửa `.ai/rules/quy_tac_code.md`.

---

## 1. BƯỚC BẮT BUỘC TRƯỚC KHI VIẾT CODE

1. Đọc toàn bộ **`.ai/rules/quy_tac_code.md`**: luật Git, commit, nhánh, PR, frontend, backend, CSDL.
2. Xác định việc đang làm thuộc nhóm nào trong bảng 0.2, đọc đủ các file của nhóm đó.
3. Nếu tài liệu mâu thuẫn với code: **code + `supabase/migrations/` là sự thật**, báo lại người dùng để sửa tài liệu.

## 2. LUẬT CỐT LÕI (TÓM TẮT)

- Commit 1 dòng: `<prefix>(<scope>): <tiếng Việt có dấu>`. **Không dùng `chore:`**, việc lặt vặt dùng `commit:`.
- **Không dùng `git add .`**, stage từng file. Nhánh dùng `feature/`, không dùng `feat/`.
- Đổi CSDL: thêm file migration mới, PR riêng từ nhánh `database/...`.
- Không viết unit test, trừ thuật toán chấm điểm `src/lib/scoring.ts`.
- Frontend: 1 TAB, Mantine, `page.tsx` không có `"use client"`/`"use server"`, không hardcode đường dẫn (dùng `src/constants/`).
- Client không gọi Supabase trực tiếp; không trả lỗi nội bộ về client.
