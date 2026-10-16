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
