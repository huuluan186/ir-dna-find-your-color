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

// Quản lý câu hỏi trắc nghiệm
export const questionOptionSchema = z.object({
	id_dap_an: z.number().optional(),
	noi_dung: z
		.string()
		.trim()
		.min(1, "Vui lòng nhập nội dung phương án")
		.max(300, "Tối đa 300 ký tự"),
	thu_tu: z.number().int().min(1).max(10).default(1),
	id_mau_gen: z.number().int({ message: "Vui lòng chọn mã gen liên kết" }),
});

export const saveQuestionSchema = z.object({
	noi_dung: z.string().trim().min(1, "Vui lòng nhập nội dung câu hỏi").max(500, "Tối đa 500 ký tự"),
	thu_tu: z.number().int().min(1, "Thứ tự phải lớn hơn 0").default(1),
	dang_bat: z.boolean().default(true),
	dap_an: z
		.array(questionOptionSchema)
		.min(2, "Câu hỏi phải có ít nhất 2 phương án")
		.max(6, "Tối đa 6 phương án")
		.refine(
			(opts) => {
				const geneIds = opts.map((o) => o.id_mau_gen);
				return new Set(geneIds).size === geneIds.length;
			},
			{
				message:
					"Các phương án trong câu hỏi phải thuộc các mã gen khác nhau (không được trùng mã gen)",
				path: ["dap_an"],
			}
		),
});

export type SaveQuestionInput = z.infer<typeof saveQuestionSchema>;
export type QuestionOptionInput = z.infer<typeof questionOptionSchema>;

// PATCH /api/admin/questions/[id]/status: bật hoặc tắt câu hỏi
export const questionStatusSchema = z.object({ dang_bat: z.boolean() });
export type QuestionStatusInput = z.infer<typeof questionStatusSchema>;
