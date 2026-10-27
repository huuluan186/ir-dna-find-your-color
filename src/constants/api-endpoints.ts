// Route handler trong src/app/api/. Client chỉ gọi server qua các đường dẫn này.
export const API_ENDPOINTS = {
	ROOT: "/api",
	AUTH: {
		STUDENT: "/api/auth/student",
		ADMIN: "/api/auth/admin",
	},
	// Cài đặt âm thanh công khai cho trang sinh viên (nhạc nền đang dùng, âm lượng)
	SOUND: "/api/sound",
	QUIZ: {
		GET: "/api/quiz",
		SUBMIT: "/api/quiz/submit",
	},
	ADMIN: {
		STUDENTS: "/api/admin/students",
		STUDENT_DETAIL: (mssv: string) => `/api/admin/students/${mssv}`,
		COLORS: "/api/admin/colors",
		COLOR_DETAIL: (id: number) => `/api/admin/colors/${id}`,
		QUESTIONS: "/api/admin/questions",
		QUESTION_DETAIL: (id: number) => `/api/admin/questions/${id}`,
		QUESTION_STATUS: (id: number) => `/api/admin/questions/${id}/status`,
		RESULTS: "/api/admin/results",
		EXPORT: "/api/admin/export",
		SOUND: "/api/admin/sound",
		SOUND_UPLOADS: "/api/admin/sound/uploads",
		SOUND_UPLOAD: (id: number) => `/api/admin/sound/uploads/${id}`,
	},
} as const;
