"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/query-keys";
import { loginStudentRequest } from "./api";

export function useLoginStudent() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: loginStudentRequest,
		onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.STUDENT.ME }),
	});
}
