// Đường dẫn trang. Không viết thẳng chuỗi "/quiz", "/admin/..." trong component.
export const ROUTES = {
	HOME: "/",
	QUIZ: "/quiz",
	RESULT: "/result",
	ADMIN: {
		ROOT: "/admin",
		LOGIN: "/admin/login",
		SINH_VIEN: "/admin/quan-ly-nguoi-dung",
		MAU_GEN: "/admin/mau-gen",
		CAU_HOI: "/admin/cau-hoi",
		KET_QUA: "/admin/ket-qua",
		QR: "/admin/qr",
	},
} as const;

// Thư mục trang thật trong src/app (tên nội bộ, KHÔNG đổi). Muốn đổi URL thì chỉ sửa ROUTES ở trên:
// next.config.ts tự rewrite URL mới về đúng thư mục này và chuyển hướng URL nội bộ sang URL mới.
// Thêm trang mới: tạo thư mục, khai báo URL trong ROUTES, rồi thêm một cặp [URL, thư mục] vào đây.
export const ROUTE_TO_PAGE_DIR: [url: string, pageDir: string][] = [
	[ROUTES.ADMIN.SINH_VIEN, "/admin/sinh-vien"],
];
