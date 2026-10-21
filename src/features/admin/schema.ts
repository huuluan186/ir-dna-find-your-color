import { z } from "zod";

// PATCH /api/admin/students/[mssv]: khoá (true) hoặc mở (false) tài khoản
export const studentLockSchema = z.object({ bi_khoa: z.boolean() });

// PATCH /api/admin/colors/[id]: sửa thông tin mã gen
export const updateColorSchema = z.object({
	ten_mau: z.string().trim().min(1, "Vui lòng nhập tên màu").max(50, "Tối đa 50 ký tự"),
	ma_hex: z
		.string()
		.trim()
		.regex(/^#[0-9A-Fa-f]{6}$/, "Mã màu phải có định dạng #RRGGBB"),
	ten_ma_gen: z.string().trim().min(1, "Vui lòng nhập tên mã gen").max(100, "Tối đa 100 ký tự"),
	tu_khoa: z
		.array(z.string().trim().min(1, "Từ khoá không được để trống").max(50, "Tối đa 50 ký tự"))
		.max(10, "Tối đa 10 từ khoá"),
	y_nghia: z.string().trim().min(1, "Vui lòng nhập ý nghĩa mã gen").max(1000, "Tối đa 1000 ký tự"),
	linh_vuc: z.string().trim().max(1000, "Tối đa 1000 ký tự").default(""),
	ky_nang: z.string().trim().max(1000, "Tối đa 1000 ký tự").default(""),
});

export type UpdateColorInput = z.infer<typeof updateColorSchema>;
