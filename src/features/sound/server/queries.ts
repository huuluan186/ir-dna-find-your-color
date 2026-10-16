import "server-only";
import { BGM_PRESETS, SOUND } from "@/constants/sound";
import { getDb } from "@/lib/db";
import { DEFAULT_SOUND_SETTINGS, soundSettingsSchema, type SoundSettings } from "../schema";
import type { AdminSound, PublicSound, UploadedMusic } from "../types";

export const SOUND_SETTING_KEY = "am_thanh";

export function getPublicUrl(path: string) {
	return getDb().storage.from(SOUND.BUCKET).getPublicUrl(path).data.publicUrl;
}

// Chưa có dòng cài đặt (chưa chạy migration 0004) hoặc dữ liệu hỏng thì dùng mặc định
export async function getSoundSettings(): Promise<SoundSettings> {
	const { data, error } = await getDb()
		.from("cai_dat")
		.select("gia_tri")
		.eq("khoa", SOUND_SETTING_KEY)
		.maybeSingle();
	if (error) throw error;

	const parsed = soundSettingsSchema.safeParse(data?.gia_tri);
	return parsed.success ? parsed.data : DEFAULT_SOUND_SETTINGS;
}

export async function listUploadedMusic(): Promise<UploadedMusic[]> {
	const { data, error } = await getDb()
		.from("nhac_nen")
		.select("id_nhac_nen, ten, kich_thuoc, created_at, duong_dan")
		.order("created_at", { ascending: false });
	if (error) throw error;

	return data.map(({ duong_dan, ...row }) => ({ ...row, src: getPublicUrl(duong_dan) }));
}

export async function getAdminSound(): Promise<AdminSound> {
	const [settings, uploads] = await Promise.all([getSoundSettings(), listUploadedMusic()]);
	return { settings, uploads };
}

const DEFAULT_SRC = BGM_PRESETS.find((preset) => preset.ma === SOUND.DEFAULT_PRESET)!.src;

// Đổi lựa chọn trong cài đặt thành đường dẫn file. Bài tải lên đã bị xoá thì quay về bài mặc định.
export async function getPublicSound(): Promise<PublicSound> {
	const settings = await getSoundSettings();
	const choice = settings.nhac_nen;
	let src: string | null = null;

	if (choice?.nguon === "co_san") {
		src = BGM_PRESETS.find((preset) => preset.ma === choice.ma)?.src ?? DEFAULT_SRC;
	} else if (choice?.nguon === "tai_len") {
		const { data, error } = await getDb()
			.from("nhac_nen")
			.select("duong_dan")
			.eq("id_nhac_nen", choice.id_nhac_nen)
			.maybeSingle();
		if (error) throw error;
		src = data ? getPublicUrl(data.duong_dan) : DEFAULT_SRC;
	}

	return { src, volume: settings.am_luong / 100, effects: settings.hieu_ung };
}
