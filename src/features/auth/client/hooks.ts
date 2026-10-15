"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/query-keys";
import { loginAdminRequest, loginStudentRequest, logoutAdminRequest } from "./api";

export function useLoginStudent() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: loginStudentRequest,
		onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.STUDENT.ME }),
	});
}

export function useLoginAdmin() {
	return useMutation({ mutationFn: loginAdminRequest });
}

// Đăng xuất thì xoá cache admin để người sau không thấy dữ liệu cũ
export function useLogoutAdmin() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: logoutAdminRequest,
		onSuccess: () => queryClient.removeQueries({ queryKey: QUERY_KEYS.ADMIN.ALL }),
	});
}
