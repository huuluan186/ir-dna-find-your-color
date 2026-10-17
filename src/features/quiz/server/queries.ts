import "server-only";
import { getDb } from "@/lib/db";
import type { QuizQuestion } from "../types";

// Lấy bộ câu hỏi đang bật cùng các phương án chưa xoá, sắp theo thứ tự hiển thị.
// Tuyệt đối không lấy bảng diem_dap_an để trình duyệt không biết phương án thuộc mã gen nào.
export async function getActiveQuiz(): Promise<QuizQuestion[]> {
	const { data, error } = await getDb()
		.from("cau_hoi")
		.select("id_cau_hoi, noi_dung, thu_tu, dap_an(id_dap_an, noi_dung, thu_tu, is_deleted)")
		.eq("dang_bat", true)
		.eq("is_deleted", false)
		.order("thu_tu", { ascending: true })
		.order("id_cau_hoi", { ascending: true });
	if (error) throw error;

	return data.map(({ dap_an, ...question }) => ({
		...question,
		dap_an: dap_an
			.filter((option) => !option.is_deleted)
			.sort((a, b) => a.thu_tu - b.thu_tu || a.id_dap_an - b.id_dap_an)
			.map(({ id_dap_an, noi_dung, thu_tu }) => ({ id_dap_an, noi_dung, thu_tu })),
	}));
}
