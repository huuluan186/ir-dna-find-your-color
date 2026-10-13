# IR DNA – Find Your Color

App trắc nghiệm mã gen màu sắc cho Trạm 2 của triển lãm IDENTITY – IR DNA (Quan hệ quốc tế, HUFLIT). Sinh viên quét QR, nhập họ tên và mã SV, trả lời 8–10 câu hỏi và nhận mã gen màu của mình.

- Kiến trúc: [.ai/system/kien_truc.md](.ai/system/kien_truc.md)
- Thiết kế CSDL: [.ai/system/thiet_ke_csdl.md](.ai/system/thiet_ke_csdl.md)
- Quy tắc làm việc (người và AI): [AGENTS.md](AGENTS.md)

## Chạy trên máy

Cần Node.js 22.

```bash
npm install
cp .env.example .env.local   # điền khoá Supabase khi có
npm run dev                  # http://localhost:3000
```

| Lệnh | Việc |
| :--- | :--- |
| `npm run build` | Build bản chạy thật (Vercel chạy lệnh này) |
| `npm run lint` | ESLint |
| `npm run format` | Prettier (1 TAB) |
