import { z } from "zod";
import { STUDENT_INPUT } from "@/constants/app";

// Luật bám theo cột bảng sinh_vien: mssv CHECK ^[0-9]{6,15}$, ho_ten NOT NULL.
// Bước 1 chỉ gửi mssv; ho_ten chỉ gửi ở bước 2 khi mã SV chưa có trong CSDL.
// Message là mã lỗi; giao diện dịch sang chữ hiển thị (src/messages).

export type LoginErrorCode = "mssv_invalid" | "ho_ten_required" | "ho_ten_too_long";
export type LoginField = "mssv" | "ho_ten";

// Gộp khoảng trắng thừa và viết hoa chữ đầu mỗi từ
function normalizeName(value: string) {
	return value
		.trim()
		.replace(/\s+/g, " ")
		.toLocaleLowerCase("vi")
		.replace(/(^|\s)\p{L}/gu, (match) => match.toLocaleUpperCase("vi"));
}

export const studentLoginSchema = z.object({
	mssv: z.string().trim().regex(STUDENT_INPUT.MSSV_PATTERN, "mssv_invalid"),
	ho_ten: z
		.string()
		.trim()
		.min(1, "ho_ten_required")
		.max(STUDENT_INPUT.HO_TEN_MAX_LENGTH, "ho_ten_too_long")
		.transform(normalizeName)
		.optional(),
});

export type StudentLoginInput = z.input<typeof studentLoginSchema>;
export type StudentLogin = z.output<typeof studentLoginSchema>;

// Dùng chung cho form (client) và route handler (server): trả mã lỗi theo từng ô
export function validateStudentLogin(input: unknown) {
	const parsed = studentLoginSchema.safeParse(input);
	if (parsed.success)
		return { data: parsed.data, errors: {} as Partial<Record<LoginField, LoginErrorCode>> };

	const errors: Partial<Record<LoginField, LoginErrorCode>> = {};
	for (const issue of parsed.error.issues) {
		const field = issue.path[0] as LoginField;
		errors[field] ??= issue.message as LoginErrorCode;
	}
	return { data: undefined, errors };
}

export const adminLoginSchema = z.object({
	password: z.string().min(1).max(200),
});
