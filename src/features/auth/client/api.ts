import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { http } from "@/lib/http";

export const loginAdminRequest = (password: string) =>
	http.post<{ ok: true }>(API_ENDPOINTS.AUTH.ADMIN, { password });

export const logoutAdminRequest = () => http.delete<{ ok: true }>(API_ENDPOINTS.AUTH.ADMIN);
