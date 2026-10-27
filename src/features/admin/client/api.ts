import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { http } from "@/lib/http";
import type { SaveQuestionInput, UpdateColorInput } from "../schema";
import type {
	AdminColorDetail,
	AdminColorRow,
	AdminQuestionDetail,
	AdminQuestionRow,
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

export const fetchAdminQuestions = () =>
	http.get<AdminQuestionRow[]>(API_ENDPOINTS.ADMIN.QUESTIONS);

export const fetchAdminQuestionDetail = (id: number) =>
	http.get<AdminQuestionDetail>(API_ENDPOINTS.ADMIN.QUESTION_DETAIL(id));

export const createAdminQuestionRequest = (data: SaveQuestionInput) =>
	http.post<AdminQuestionDetail>(API_ENDPOINTS.ADMIN.QUESTIONS, data);

export const updateAdminQuestionRequest = ({ id, data }: { id: number; data: SaveQuestionInput }) =>
	http.patch<AdminQuestionDetail>(API_ENDPOINTS.ADMIN.QUESTION_DETAIL(id), data);

export const toggleAdminQuestionStatusRequest = ({
	id,
	dang_bat,
}: {
	id: number;
	dang_bat: boolean;
}) =>
	http.patch<{ id_cau_hoi: number; dang_bat: boolean }>(API_ENDPOINTS.ADMIN.QUESTION_STATUS(id), {
		dang_bat,
	});

export const deleteAdminQuestionRequest = (id: number) =>
	http.delete<{ ok: boolean; id_cau_hoi: number }>(API_ENDPOINTS.ADMIN.QUESTION_DETAIL(id));
