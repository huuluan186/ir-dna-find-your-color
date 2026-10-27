"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/query-keys";
import { HttpError } from "@/lib/http";
import { fetchLatestResult, fetchQuiz, submitQuizAnswers } from "./api";

// Bộ đề đã prefetch ở /quiz/page.tsx; giữ trong cache suốt phiên làm bài để rớt mạng giữa chừng vẫn làm tiếp được
export function useQuiz() {
	return useQuery({
		queryKey: QUERY_KEYS.QUIZ.ALL,
		queryFn: fetchQuiz,
		staleTime: Infinity,
	});
}

export function useLatestResult() {
	return useQuery({
		queryKey: QUERY_KEYS.RESULT.LATEST,
		queryFn: fetchLatestResult,
		staleTime: 60_000,
	});
}

// Nộp bài: tự thử lại tối đa 3 lần với thời gian chờ tăng dần nếu mạng chập chờn hoặc lỗi 5xx
export function useSubmitQuiz() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: submitQuizAnswers,
		retry: (failureCount, error) => {
			if (error instanceof HttpError && error.status >= 400 && error.status < 500) {
				return false;
			}
			return failureCount < 3;
		},
		retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 8000),
		onSuccess: (result) => {
			queryClient.setQueryData(QUERY_KEYS.RESULT.LATEST, result);
			void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN.STUDENTS });
			void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN.RESULTS });
		},
	});
}
