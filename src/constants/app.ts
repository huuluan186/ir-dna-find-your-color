export const APP = {
	NAME: "IR DNA – Find Your Color",
	SHORT_NAME: "IR DNA",
	DESCRIPTION: "Trạm 2 triển lãm IDENTITY – IR DNA: giải mã gen màu sắc của bạn.",
	// Khung giao diện sinh viên trên màn hình lớn (xem quy_tac_code.md mục 4)
	STUDENT_MAX_WIDTH: 480,
	// Múi giờ cố định cho next-intl để server và trình duyệt định dạng ngày giờ giống nhau
	TIME_ZONE: "Asia/Ho_Chi_Minh",
} as const;

// Phiên đăng nhập sinh viên và admin (cookie httpOnly ký JWT, xem kien_truc.md mục 6)
export const SESSION = {
	STUDENT_COOKIE: "ir-dna-student",
	STUDENT_MAX_AGE_SECONDS: 7 * 24 * 60 * 60,
	ADMIN_COOKIE: "ir-dna-admin",
	ADMIN_MAX_AGE_SECONDS: 12 * 60 * 60,
} as const;

// Khoá localStorage của trình duyệt
export const STORAGE_KEYS = {
	LOCALE: "ir-dna-locale",
	MUTED: "ir-dna-muted",
} as const;

// Luật nhập mã SV và họ tên, bám theo cột bảng sinh_vien
export const STUDENT_INPUT = {
	MSSV_PATTERN: /^[0-9]{6,15}$/,
	MSSV_MAX_LENGTH: 15,
	HO_TEN_MAX_LENGTH: 100,
} as const;

// Nhãn phương án theo thứ tự A, B, C, D (phím tắt A–D)
export const OPTION_LETTERS: readonly string[] = ["A", "B", "C", "D"];

// 6 màu mã gen mặc định của triển lãm IR DNA (Đỏ, Cam, Vàng, Xanh lá, Xanh dương, Tím)
export const DNA_COLORS: readonly string[] = [
	"#E53935",
	"#FB8C00",
	"#FDD835",
	"#43A047",
	"#1E4FA3",
	"#8E24AA",
];

// Giới hạn số lần nhập sai mật khẩu admin trên mỗi địa chỉ IP
export const ADMIN_LOGIN_LIMIT = {
	MAX_ATTEMPTS: 5,
	WINDOW_SECONDS: 15 * 60,
} as const;

// Bảng dữ liệu trang quản trị: số dòng mỗi trang (người dùng chọn được), mặc định theo thiết bị
export const ADMIN_TABLE = {
	PAGE_SIZE_OPTIONS: [4, 8, 10, 15, 20],
	DEFAULT_PAGE_SIZE: 8,
	DEFAULT_PAGE_SIZE_MOBILE: 4,
	// Trùng breakpoint sm của Mantine (768px)
	MOBILE_QUERY: "(max-width: 48em)",
} as const;
