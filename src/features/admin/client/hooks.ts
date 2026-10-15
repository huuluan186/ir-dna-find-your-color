"use client";

import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/query-keys";
import { fetchStudentDetail, fetchStudents } from "./api";

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
