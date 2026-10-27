"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/query-keys";
import type { AdminColorRow, AdminQuestionRow, AdminStudentRow } from "../types";
import {
	createAdminColorRequest,
	createAdminQuestionRequest,
	deleteAdminColorRequest,
	deleteAdminQuestionRequest,
	fetchAdminColors,
	fetchAdminQuestionDetail,
	fetchAdminQuestions,
	fetchStudentDetail,
	fetchStudents,
	setStudentLockedRequest,
	toggleAdminQuestionStatusRequest,
	updateAdminColorRequest,
	updateAdminQuestionRequest,
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

export function useAdminQuestions() {
	return useQuery({ queryKey: QUERY_KEYS.ADMIN.QUESTIONS, queryFn: fetchAdminQuestions });
}

export function useAdminQuestionDetail(id: number) {
	return useQuery({
		queryKey: QUERY_KEYS.ADMIN.QUESTION_DETAIL(id),
		queryFn: () => fetchAdminQuestionDetail(id),
		enabled: id > 0,
	});
}

export function useCreateAdminQuestion() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: createAdminQuestionRequest,
		onSuccess: () =>
			Promise.all([
				queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN.QUESTIONS }),
				queryClient.invalidateQueries({ queryKey: QUERY_KEYS.QUIZ.ALL }),
			]),
	});
}

export function useUpdateAdminQuestion() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: updateAdminQuestionRequest,
		onSettled: (_data, _error, { id }) =>
			Promise.all([
				queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN.QUESTIONS }),
				queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN.QUESTION_DETAIL(id) }),
				queryClient.invalidateQueries({ queryKey: QUERY_KEYS.QUIZ.ALL }),
			]),
	});
}

export function useToggleAdminQuestionStatus() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: toggleAdminQuestionStatusRequest,
		onMutate: async ({ id, dang_bat }) => {
			await queryClient.cancelQueries({ queryKey: QUERY_KEYS.ADMIN.QUESTIONS });
			const previous = queryClient.getQueryData<AdminQuestionRow[]>(QUERY_KEYS.ADMIN.QUESTIONS);
			queryClient.setQueryData<AdminQuestionRow[]>(QUERY_KEYS.ADMIN.QUESTIONS, (rows) =>
				rows?.map((row) => (row.id_cau_hoi === id ? { ...row, dang_bat } : row))
			);
			return { previous };
		},
		onError: (_error, _input, context) => {
			if (context?.previous) queryClient.setQueryData(QUERY_KEYS.ADMIN.QUESTIONS, context.previous);
		},
		onSettled: (_data, _error, { id }) =>
			Promise.all([
				queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN.QUESTIONS }),
				queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN.QUESTION_DETAIL(id) }),
				queryClient.invalidateQueries({ queryKey: QUERY_KEYS.QUIZ.ALL }),
			]),
	});
}

export function useDeleteAdminQuestion() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: deleteAdminQuestionRequest,
		onMutate: async (id) => {
			await queryClient.cancelQueries({ queryKey: QUERY_KEYS.ADMIN.QUESTIONS });
			const previous = queryClient.getQueryData<AdminQuestionRow[]>(QUERY_KEYS.ADMIN.QUESTIONS);
			queryClient.setQueryData<AdminQuestionRow[]>(QUERY_KEYS.ADMIN.QUESTIONS, (rows) =>
				rows?.filter((row) => row.id_cau_hoi !== id)
			);
			return { previous };
		},
		onError: (_error, _id, context) => {
			if (context?.previous) queryClient.setQueryData(QUERY_KEYS.ADMIN.QUESTIONS, context.previous);
		},
		onSettled: () =>
			Promise.all([
				queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN.QUESTIONS }),
				queryClient.invalidateQueries({ queryKey: QUERY_KEYS.QUIZ.ALL }),
			]),
	});
}
