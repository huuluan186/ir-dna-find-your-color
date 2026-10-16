import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { http } from "@/lib/http";
import type { AdminStudentDetail, AdminStudentRow } from "../types";

export const fetchStudents = () => http.get<AdminStudentRow[]>(API_ENDPOINTS.ADMIN.STUDENTS);

export const fetchStudentDetail = (mssv: string) =>
	http.get<AdminStudentDetail>(API_ENDPOINTS.ADMIN.STUDENT_DETAIL(mssv));

export const setStudentLockedRequest = ({ mssv, bi_khoa }: { mssv: string; bi_khoa: boolean }) =>
	http.patch<{ mssv: string; bi_khoa: boolean; khoa_luc: string | null }>(
		API_ENDPOINTS.ADMIN.STUDENT_DETAIL(mssv),
		{ bi_khoa }
	);
