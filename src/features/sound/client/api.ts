import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { http, HttpError } from "@/lib/http";
import type { SoundErrorCode, SoundSettings } from "../schema";
import type { AdminSound, PublicSound, UploadedMusic } from "../types";

export const fetchPublicSound = () => http.get<PublicSound>(API_ENDPOINTS.SOUND);

export const fetchAdminSound = () => http.get<AdminSound>(API_ENDPOINTS.ADMIN.SOUND);

export const saveSoundSettingsRequest = (settings: SoundSettings) =>
	http.put<SoundSettings>(API_ENDPOINTS.ADMIN.SOUND, settings);

export function uploadMusicRequest(file: File) {
	const form = new FormData();
	form.append("file", file);
	return http.post<UploadedMusic>(API_ENDPOINTS.ADMIN.SOUND_UPLOADS, form);
}

export const deleteMusicRequest = (id: number) =>
	http.delete<{ ok: true }>(API_ENDPOINTS.ADMIN.SOUND_UPLOAD(id));

// Lấy mã lỗi server gửi kèm (file_too_large, in_use...); null nếu là lỗi hệ thống / mạng
export function getSoundErrorCode(error: unknown): SoundErrorCode | null {
	if (!(error instanceof HttpError)) return null;
	// Vercel tự chặn body quá lớn trước khi tới route, trả 413 không kèm JSON
	if (error.status === 413) return "file_too_large";
	const code = (error.data as { code?: SoundErrorCode } | null)?.code;
	return code ?? null;
}
