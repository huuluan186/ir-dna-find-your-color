"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/query-keys";
import type { AdminColorRow, AdminStudentRow } from "../types";
import {
	createAdminColorRequest,
	deleteAdminColorRequest,
	fetchAdminColors,
	fetchStudentDetail,
	fetchStudents,
	setStudentLockedRequest,
	updateAdminColorRequest,
} from "./api";

// Dữ liệu đã prefetch ở page.tsx nên lần đầu không gọi API; sau đó tự làm mới khi quay lại tab
export function useStudents() {
	return useQuery({ queryKey: QUERY_KEYS.ADMIN.STUDENTS, queryFn: fetchStudents });
}

export function useStudentDetail(mssv: string) {
	return useQuery({
		queryKey: QUERY_KEYS.ADMIN.STUDENT_DETAIL(mssv),
		queryFn: () => fetchStudentDetail(mssv),
	});
}

// Khoá/mở: đổi trạng thái trong bảng ngay (optimistic), lỗi thì trả lại như cũ
export function useSetStudentLocked() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: setStudentLockedRequest,
		onMutate: async ({ mssv, bi_khoa }) => {
			await queryClient.cancelQueries({ queryKey: QUERY_KEYS.ADMIN.STUDENTS });
			const previous = queryClient.getQueryData<AdminStudentRow[]>(QUERY_KEYS.ADMIN.STUDENTS);
			queryClient.setQueryData<AdminStudentRow[]>(QUERY_KEYS.ADMIN.STUDENTS, (rows) =>
				rows?.map((row) => (row.mssv === mssv ? { ...row, bi_khoa } : row))
			);
			return { previous };
		},
		onError: (_error, _input, context) => {
			if (context?.previous) queryClient.setQueryData(QUERY_KEYS.ADMIN.STUDENTS, context.previous);
		},
		onSettled: (_data, _error, { mssv }) =>
			Promise.all([
				queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN.STUDENTS }),
				queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN.STUDENT_DETAIL(mssv) }),
			]),
	});
}

export function useAdminColors() {
	return useQuery({ queryKey: QUERY_KEYS.ADMIN.COLORS, queryFn: fetchAdminColors });
}

export function useUpdateAdminColor() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: updateAdminColorRequest,
		onMutate: async ({ id, data }) => {
			await queryClient.cancelQueries({ queryKey: QUERY_KEYS.ADMIN.COLORS });
			const previous = queryClient.getQueryData<AdminColorRow[]>(QUERY_KEYS.ADMIN.COLORS);
			queryClient.setQueryData<AdminColorRow[]>(QUERY_KEYS.ADMIN.COLORS, (rows) =>
				rows?.map((row) =>
					row.id_mau_gen === id
						? {
								...row,
								...data,
								ma_hex: data.ma_hex.toUpperCase(),
								updated_at: new Date().toISOString(),
							}
						: row
				)
			);
			return { previous };
		},
		onError: (_error, _input, context) => {
			if (context?.previous) queryClient.setQueryData(QUERY_KEYS.ADMIN.COLORS, context.previous);
		},
		onSettled: (_data, _error, { id }) =>
			Promise.all([
				queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN.COLORS }),
				queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN.COLOR_DETAIL(id) }),
				queryClient.invalidateQueries({ queryKey: QUERY_KEYS.QUIZ.ALL }),
			]),
	});
}

export function useCreateAdminColor() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: createAdminColorRequest,
		onSuccess: () =>
			Promise.all([
				queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN.COLORS }),
				queryClient.invalidateQueries({ queryKey: QUERY_KEYS.QUIZ.ALL }),
			]),
	});
}

export function useDeleteAdminColor() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: deleteAdminColorRequest,
		onMutate: async (id) => {
			await queryClient.cancelQueries({ queryKey: QUERY_KEYS.ADMIN.COLORS });
			const previous = queryClient.getQueryData<AdminColorRow[]>(QUERY_KEYS.ADMIN.COLORS);
			queryClient.setQueryData<AdminColorRow[]>(QUERY_KEYS.ADMIN.COLORS, (rows) =>
				rows?.filter((row) => row.id_mau_gen !== id)
			);
			return { previous };
		},
		onError: (_error, _id, context) => {
			if (context?.previous) queryClient.setQueryData(QUERY_KEYS.ADMIN.COLORS, context.previous);
		},
		onSettled: () =>
			Promise.all([
				queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN.COLORS }),
				queryClient.invalidateQueries({ queryKey: QUERY_KEYS.QUIZ.ALL }),
			]),
	});
}
