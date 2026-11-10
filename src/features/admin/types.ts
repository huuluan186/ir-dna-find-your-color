// Dữ liệu trả cho trang quản trị. Dùng chung cho server (truy vấn) và client (hiển thị).

import type { ScoreKind } from "@/lib/scoring";

export type AdminStudentRow = {
	mssv: string;
	ho_ten: string;
	created_at: string;
	bi_khoa: boolean;
	so_lan_lam: number;
	lan_lam_gan_nhat: string | null;
};

export type AdminStudentDetail = AdminStudentRow & {
	updated_at: string | null;
	khoa_luc: string | null;
};

export type AdminColorRow = {
	id_mau_gen: number;
	ten_mau: string;
	ma_hex: string;
	ten_ma_gen: string;
	tu_khoa: string[];
	y_nghia: string;
	linh_vuc: string;
	ky_nang: string;
	thu_tu: number;
	updated_at: string | null;
};

export type AdminColorDetail = AdminColorRow & {
	created_at: string;
};

export type AdminQuestionOption = {
	id_dap_an: number;
	noi_dung: string;
	thu_tu: number;
	id_mau_gen: number;
	ten_mau: string;
	ma_hex: string;
	ten_ma_gen: string;
};

export type AdminQuestionRow = {
	id_cau_hoi: number;
	noi_dung: string;
	thu_tu: number;
	dang_bat: boolean;
	dap_an: AdminQuestionOption[];
	created_at: string;
	updated_at: string | null;
};

export type AdminQuestionDetail = AdminQuestionRow;

export type AdminQuestionBalance = {
	id_mau_gen: number;
	ten_mau: string;
	ma_hex: string;
	ten_ma_gen: string;
	so_lan: number;
	muc_tieu: number;
};

export type AdminResultRankingItem = {
	id_mau_gen: number;
	ten_mau: string;
	diem: number;
};

export type AdminResultRow = {
	id_ket_qua: number;
	mssv: string;
	ho_ten: string;
	bi_khoa: boolean;
	loai_ket_qua: ScoreKind;
	top_mau_gen_ids: number[];
	bang_xep_hang: AdminResultRankingItem[];
	dap_an_da_chon: number[];
	created_at: string;
	lan_thu: number;
	la_moi_nhat: boolean;
};
