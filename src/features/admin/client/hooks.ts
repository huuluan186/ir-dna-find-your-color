"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/query-keys";
import type { AdminStudentRow } from "../types";
import { fetchStudentDetail, fetchStudents, setStudentLockedRequest } from "./api";

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
