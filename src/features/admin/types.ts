// Dữ liệu trả cho trang quản trị. Dùng chung cho server (truy vấn) và client (hiển thị).

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
