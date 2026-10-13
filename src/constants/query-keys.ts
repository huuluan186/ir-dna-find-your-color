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
		COLORS: ["admin", "colors"],
		QUESTIONS: ["admin", "questions"],
		RESULTS: ["admin", "results"],
	},
} as const;
