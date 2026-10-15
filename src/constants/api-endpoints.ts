// Route handler trong src/app/api/. Client chỉ gọi server qua các đường dẫn này.
export const API_ENDPOINTS = {
	ROOT: "/api",
	AUTH: {
		STUDENT: "/api/auth/student",
		ADMIN: "/api/auth/admin",
	},
	QUIZ: {
		GET: "/api/quiz",
		SUBMIT: "/api/quiz/submit",
	},
	ADMIN: {
		STUDENTS: "/api/admin/students",
		STUDENT_DETAIL: (mssv: string) => `/api/admin/students/${mssv}`,
		COLORS: "/api/admin/colors",
		QUESTIONS: "/api/admin/questions",
		RESULTS: "/api/admin/results",
		EXPORT: "/api/admin/export",
	},
} as const;
