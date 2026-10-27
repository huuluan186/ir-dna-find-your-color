// Query key của TanStack Query. Server (prefetch) và client (useQuery) phải dùng chung key ở đây.
export const QUERY_KEYS = {
	STUDENT: {
		ME: ["student", "me"],
	},
	QUIZ: {
		ALL: ["quiz"],
	},
	SOUND: ["sound"],
	RESULT: {
		LATEST: ["result", "latest"],
	},
	ADMIN: {
		ALL: ["admin"],
		STUDENTS: ["admin", "students"],
		STUDENT_DETAIL: (mssv: string) => ["admin", "students", mssv] as const,
		COLORS: ["admin", "colors"],
		COLOR_DETAIL: (id: number) => ["admin", "colors", id] as const,
		QUESTIONS: ["admin", "questions"],
		QUESTION_DETAIL: (id: number) => ["admin", "questions", id] as const,
		RESULTS: ["admin", "results"],
		SOUND: ["admin", "sound"],
	},
} as const;
