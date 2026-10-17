"use client";

import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/query-keys";
import { fetchQuiz } from "./api";

// Bộ đề đã prefetch ở /quiz/page.tsx; giữ trong cache suốt phiên làm bài để rớt mạng giữa chừng vẫn làm tiếp được
export function useQuiz() {
	return useQuery({
		queryKey: QUERY_KEYS.QUIZ.ALL,
		queryFn: fetchQuiz,
		staleTime: Infinity,
	});
}
