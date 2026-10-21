import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { http } from "@/lib/http";
import type { UpdateColorInput } from "../schema";
import type {
	AdminColorDetail,
	AdminColorRow,
	AdminStudentDetail,
	AdminStudentRow,
} from "../types";

export const fetchStudents = () => http.get<AdminStudentRow[]>(API_ENDPOINTS.ADMIN.STUDENTS);

export const fetchStudentDetail = (mssv: string) =>
	http.get<AdminStudentDetail>(API_ENDPOINTS.ADMIN.STUDENT_DETAIL(mssv));

export const setStudentLockedRequest = ({ mssv, bi_khoa }: { mssv: string; bi_khoa: boolean }) =>
	http.patch<{ mssv: string; bi_khoa: boolean; khoa_luc: string | null }>(
		API_ENDPOINTS.ADMIN.STUDENT_DETAIL(mssv),
		{ bi_khoa }
	);

export const fetchAdminColors = () => http.get<AdminColorRow[]>(API_ENDPOINTS.ADMIN.COLORS);

export const createAdminColorRequest = (data: UpdateColorInput) =>
	http.post<AdminColorDetail>(API_ENDPOINTS.ADMIN.COLORS, data);

export const updateAdminColorRequest = ({ id, data }: { id: number; data: UpdateColorInput }) =>
	http.patch<AdminColorDetail>(API_ENDPOINTS.ADMIN.COLOR_DETAIL(id), data);

export const deleteAdminColorRequest = (id: number) =>
	http.delete<{ ok: boolean; id_mau_gen: number }>(API_ENDPOINTS.ADMIN.COLOR_DETAIL(id));
