export const APP = {
	NAME: "IR DNA – Find Your Color",
	SHORT_NAME: "IR DNA",
	DESCRIPTION: "Trạm 2 triển lãm IDENTITY – IR DNA: giải mã gen màu sắc của bạn.",
	// Khung giao diện sinh viên trên màn hình lớn (xem quy_tac_code.md mục 4)
	STUDENT_MAX_WIDTH: 480,
} as const;

// Phiên đăng nhập sinh viên (cookie httpOnly ký JWT, xem kien_truc.md mục 6)
export const SESSION = {
	STUDENT_COOKIE: "ir-dna-student",
	STUDENT_MAX_AGE_SECONDS: 7 * 24 * 60 * 60,
} as const;

// Khoá localStorage của trình duyệt
export const STORAGE_KEYS = {
	LOCALE: "ir-dna-locale",
} as const;

// Luật nhập mã SV và họ tên, bám theo cột bảng sinh_vien
export const STUDENT_INPUT = {
	MSSV_PATTERN: /^[0-9]{6,15}$/,
	MSSV_MAX_LENGTH: 15,
	HO_TEN_MAX_LENGTH: 100,
} as const;

// Nhãn phương án theo thứ tự A, B, C, D (phím tắt A–D)
export const OPTION_LETTERS: readonly string[] = ["A", "B", "C", "D"];
