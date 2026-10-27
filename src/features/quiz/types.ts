import type { ScoreKind } from "@/lib/scoring";

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

export type GeneProfile = {
	id_mau_gen: number;
	ten_mau: string;
	ma_hex: string;
	ten_ma_gen: string;
	tu_khoa: string[];
	y_nghia: string;
	linh_vuc: string;
	ky_nang: string;
	thu_tu: number;
};

export type RankingItem = {
	id_mau_gen: number;
	ten_mau: string;
	diem: number;
};

export type QuizResultData = {
	id_ket_qua: number;
	mssv: string;
	ho_ten: string;
	loai_ket_qua: ScoreKind;
	top_mau_gen_ids: number[];
	bang_xep_hang: RankingItem[];
	genes: GeneProfile[];
	cho_lam_lai: boolean;
	created_at: string;
};
