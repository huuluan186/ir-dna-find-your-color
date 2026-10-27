import { z } from "zod";
import { BGM_PRESET_IDS, SOUND } from "@/constants/sound";

// Giá trị khoá "am_thanh" trong bảng cai_dat. Dùng chung cho server (kiểm tra) và form admin.

export const musicChoiceSchema = z.discriminatedUnion("nguon", [
	z.object({ nguon: z.literal("co_san"), ma: z.enum(BGM_PRESET_IDS) }),
	z.object({ nguon: z.literal("tai_len"), id_nhac_nen: z.number().int().positive() }),
]);

export const soundSettingsSchema = z.object({
	// null: tắt nhạc nền
	nhac_nen: musicChoiceSchema.nullable(),
	am_luong: z.number().int().min(0).max(100),
	hieu_ung: z.boolean(),
});

export type MusicChoice = z.infer<typeof musicChoiceSchema>;
export type SoundSettings = z.infer<typeof soundSettingsSchema>;

export const DEFAULT_SOUND_SETTINGS: SoundSettings = {
	nhac_nen: null,
	am_luong: SOUND.DEFAULT_VOLUME,
	hieu_ung: true,
};

// Mã lỗi server trả về khi tải lên / xoá / lưu; client dịch sang chữ
export type SoundErrorCode =
	"file_missing" | "file_too_large" | "file_type" | "in_use" | "not_found";

// Đuôi file hợp lệ → loại file; null nếu không nhận
export function getUploadType(fileName: string) {
	const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
	return ext in SOUND.UPLOAD_TYPES
		? { ext, type: SOUND.UPLOAD_TYPES[ext as keyof typeof SOUND.UPLOAD_TYPES] }
		: null;
}
