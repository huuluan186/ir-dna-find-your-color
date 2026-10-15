// Query key của TanStack Query. Server (prefetch) và client (useQuery) phải dùng chung key ở đây.
export const QUERY_KEYS = {
	STUDENT: {
		ME: ["student", "me"],
	},
	QUIZ: {
		ALL: ["quiz"],
	},
	RESULT: {
		LATEST: ["result", "latest"],
	},
	ADMIN: {
		ALL: ["admin"],
		STUDENTS: ["admin", "students"],
		STUDENT_DETAIL: (mssv: string) => ["admin", "students", mssv] as const,
		COLORS: ["admin", "colors"],
		QUESTIONS: ["admin", "questions"],
		RESULTS: ["admin", "results"],
	},
} as const;
