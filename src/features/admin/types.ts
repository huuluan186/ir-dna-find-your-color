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
