// Bộ đề trả cho sinh viên làm bài: chỉ chứa câu hỏi và phương án,
// không kèm id_mau_gen hay điểm của đáp án (xem quy_tac_code.md mục 4).

export type QuizOption = {
	id_dap_an: number;
	noi_dung: string;
	thu_tu: number;
};

export type QuizQuestion = {
	id_cau_hoi: number;
	noi_dung: string;
	thu_tu: number;
	dap_an: QuizOption[];
};
