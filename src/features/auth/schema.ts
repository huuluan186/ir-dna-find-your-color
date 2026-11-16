import { z } from "zod";

// Gộp khoảng trắng thừa và viết hoa chữ đầu mỗi từ
export function normalizeName(value: string) {
	return value
		.trim()
		.replace(/\s+/g, " ")
		.toLocaleLowerCase("vi")
		.replace(/(^|\s)\p{L}/gu, (match) => match.toLocaleUpperCase("vi"));
}

export const adminLoginSchema = z.object({
	password: z.string().min(1).max(200),
});
