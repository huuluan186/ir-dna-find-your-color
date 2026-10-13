---
name: git-commit
description: Chia và tạo commit cho repo. Message 1 dòng, prefix tiếng Anh theo danh sách prefix hợp lệ của repo, phần mô tả tiếng Việt có dấu và bắt đầu bằng động từ, commit bằng `git commit -m`, stage tường minh từng file (không `git add .`). Dùng khi người dùng yêu cầu commit, chia commit, viết commit message, hoặc hỏi "commit thế nào".
---

# Commit

> Prefix hợp lệ, quy ước nhánh và quy trình CSDL của IR DNA nằm ở mục 1 của `.ai/rules/quy_tac_code.md`. **Đọc mục đó trước**; nếu lệch với skill này thì `quy_tac_code.md` thắng.
> Chỉ commit khi người dùng đã yêu cầu. **Không tự push** nếu người dùng không nói.

## 1. Định dạng message

```text
<prefix>(<scope>): <mô tả tiếng Việt có dấu, bắt đầu bằng động từ>
```

- Prefix và scope viết tiếng Anh. Mô tả viết tiếng Việt có dấu (trừ khi repo quy định khác).
- Đúng 1 dòng, không viết thân bài.
- **Mô tả bắt đầu bằng động từ**, không bắt đầu bằng danh từ:
  - Đúng: `update(quiz): đổi màu thanh tiến độ DNA`, `fix(auth): sửa lỗi mất phiên khi quay lại`, `add(admin): thêm cảnh báo lệch màu chính`
  - Sai: `update(quiz): màu thanh tiến độ DNA`, `fix(auth): lỗi mất phiên`, `add(admin): cảnh báo lệch màu`
- Prefix chỉ lấy từ danh sách hợp lệ của repo, không tự nghĩ thêm. Xem `git log` để bắt chước scope đã có, nhưng đừng bắt chước commit sai quy ước trong lịch sử.
- Không dùng `chore:` cho commit nếu repo đã có prefix riêng cho việc lặt vặt (thường là `commit:`); `chore` thường chỉ là loại nhánh.

Bộ prefix phổ biến (đối chiếu với repo): `add` · `update` · `fix` · `improve` · `refactor` · `remove` · `replace` · `start` · `docs` · `resolve` · `build` · `commit`.

Phân biệt hay lẫn: `improve` = tốt hơn cho **người dùng** · `refactor` = gọn hơn cho **dev**, không đổi hành vi · `update` = sửa cái đang có, không thêm tính năng mới.

## 2. Commit bằng `git commit -m` MỘT DÒNG

```bash
git commit -m "update(quiz): đổi màu thanh tiến độ DNA"
```

Không dùng `-F` kèm file tạm, không dùng heredoc. Kiểm tra ngay sau khi commit:

```bash
git log -1 --format=%B | cat
```

Dấu tiếng Việt bị lỗi và **chưa push** thì sửa bằng `git commit --amend -m "<message đúng>"`.

## 3. Stage TƯỜNG MINH, tuyệt đối không `git add .`

Cây làm việc thường có nhiều việc dở chưa commit cùng lúc. `git add .` (hay `git add -A`, `git commit -a`) sẽ gom cả việc không liên quan.

```bash
git add src/lib/scoring.ts src/app/quiz/page.tsx .ai/system/kien_truc.md   # liệt kê rõ từng path
git diff --cached --name-status          # soát ĐÚNG những gì đã staged
```

- File mới (untracked, `??`) cũng phải `git add` từng đường dẫn.
- `git status --short` đếm một **thư mục** untracked là 1 mục; dùng `git status --short -uall` để thấy từng file bên trong.
- Không đưa vào git: `.env`, khoá/secret, dữ liệu thật có thông tin cá nhân, file backup/dump, thư mục build. Kiểm tra `.gitignore` của repo.

## 4. Chia commit theo CHỦ ĐỀ, đọc diff chứ đừng suy từ thư mục

**Bắt buộc `git diff -- <file>` từng file trước khi gán nó vào commit nào.** Cùng thư mục chưa chắc cùng việc; một file nằm cạnh nhóm file đang refactor có thể chỉ đổi màu hay định dạng.

Với diff lớn (> 20 file), có thể giao subagent đọc song song theo từng khu vực rồi tự tổng hợp. Hỏi mỗi agent: bản chất thay đổi, có bug/TODO dở/secret không, và **file nào KHÔNG thuộc nhóm đang xét**.

## 5. Thứ tự commit: mỗi commit phải build được

Commit tầng dưới trước tầng tiêu thụ nó: `supabase/migrations/` → `src/lib/`, `src/constants/` → `src/features/*/server` và `src/app/api/` → `src/features/*/client` → `src/components/` → `src/app/**/page.tsx`. Đổi `package.json` thì commit kèm `package-lock.json` trong **cùng** commit. Đổi dữ liệu trả về của route handler thì sửa `features/*/client` và component dùng nó trong cùng PR.

## 6. Kiểm tra trước khi commit

Đổi code thì chạy `npm run lint`, `npm run format:check`, `npm run build`. Dự án không viết unit test, **trừ** `src/lib/scoring.ts`: đổi file đó thì chạy thêm `npx vitest run`. Nếu lệnh chạy lâu, chạy nền rồi chờ thông báo, không poll bằng `sleep`. Chỉ sửa tài liệu thì không cần chạy gì.

## 7. DỪNG và hỏi người dùng khi thấy

- Diff trông như **gõ nhầm/xoá nhầm**, không phải chủ đích.
- **Binary hoặc tài liệu lớn** mới xuất hiện (`.docx`, `.pdf`, ảnh lớn, file dump): hỏi có nên vào git không.
- File có khả năng chứa secret (`.env`, file cấu hình có chuỗi kết nối/mật khẩu, key, dữ liệu thật).
- Diff **lẫn nhiều việc trong CÙNG một file** → hỏi gộp chung 1 commit hay tách hunk bằng `git add -p`. Đừng tự đoán ranh giới.
- Diff nằm ở khu vực mà luật repo giới hạn nhánh được phép sửa (`supabase/migrations/` chỉ sửa trên nhánh `database/...`, xem mục 1.5 `quy_tac_code.md`).

## 8. Sau khi commit

- `git log --oneline -N | cat` để người dùng thấy kết quả (`| cat` tránh pager treo).
- **Đề xuất** lệnh push, không tự chạy: `git push origin <branch>`.
- Lấy tên nhánh bằng `git branch --show-current`, đừng gõ tay.
- Đã push rồi thì **không** `--amend`/force-push để sửa message, trừ khi người dùng yêu cầu rõ.

## 9. Mẫu chia commit tham khảo

```
add(scoring): thêm hàm chấm điểm và test Vitest
add(quiz): thêm route handler lấy đề đã bỏ điểm
add(quiz): thêm màn làm bài từng câu
docs(ai): cập nhật luồng dữ liệu trong kiến trúc
commit: cấu hình prettier
```
