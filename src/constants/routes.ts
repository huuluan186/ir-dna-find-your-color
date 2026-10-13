// Đường dẫn trang. Không viết thẳng chuỗi "/quiz", "/admin/..." trong component.
export const ROUTES = {
	HOME: "/",
	QUIZ: "/quiz",
	RESULT: "/result",
	ADMIN: {
		LOGIN: "/admin/login",
		MAU_GEN: "/admin/mau-gen",
		CAU_HOI: "/admin/cau-hoi",
		KET_QUA: "/admin/ket-qua",
		QR: "/admin/qr",
	},
} as const;
