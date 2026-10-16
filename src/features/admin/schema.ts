import { z } from "zod";

// PATCH /api/admin/students/[mssv]: khoá (true) hoặc mở (false) tài khoản
export const studentLockSchema = z.object({ bi_khoa: z.boolean() });
