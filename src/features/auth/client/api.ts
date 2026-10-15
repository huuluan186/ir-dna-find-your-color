import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { http, HttpError } from "@/lib/http";
import type { LoginErrorCode, LoginField, StudentLoginInput } from "../schema";

// Mã SV chưa có thì server trả need_name để form hỏi thêm họ tên
export type LoginResponse = { mssv: string; ho_ten: string } | { need_name: true };

// Lỗi kiểm tra dữ liệu từ server (400) mang theo mã lỗi từng ô
export class LoginValidationError extends Error {
	constructor(public errors: Partial<Record<LoginField, LoginErrorCode>>) {
		super("validation");
	}
}

export async function loginStudentRequest(input: StudentLoginInput) {
	try {
		return await http.post<LoginResponse>(API_ENDPOINTS.AUTH.STUDENT, input);
	} catch (error) {
		if (error instanceof HttpError && error.status === 400) {
			throw new LoginValidationError(
				(error.data as { errors?: LoginValidationError["errors"] })?.errors ?? {}
			);
		}
		throw error;
	}
}
