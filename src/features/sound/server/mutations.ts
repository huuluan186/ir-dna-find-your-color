import "server-only";
import { SOUND } from "@/constants/sound";
import { getDb } from "@/lib/db";
import type { SoundErrorCode, SoundSettings } from "../schema";
import type { UploadedMusic } from "../types";
import { getPublicUrl, getSoundSettings, SOUND_SETTING_KEY } from "./queries";

type Result<T> = { ok: true; data: T } | { ok: false; code: SoundErrorCode };

export async function saveSoundSettings(settings: SoundSettings): Promise<Result<SoundSettings>> {
	const choice = settings.nhac_nen;
	if (choice?.nguon === "tai_len") {
		const { data, error } = await getDb()
			.from("nhac_nen")
			.select("id_nhac_nen")
			.eq("id_nhac_nen", choice.id_nhac_nen)
			.maybeSingle();
		if (error) throw error;
		if (!data) return { ok: false, code: "not_found" };
	}

	const { error } = await getDb()
		.from("cai_dat")
		.upsert({ khoa: SOUND_SETTING_KEY, gia_tri: settings });
	if (error) throw error;
	return { ok: true, data: settings };
}

// File đã được route kiểm tra loại và dung lượng. Ghi file trước, ghi CSDL sau;
// ghi CSDL lỗi thì xoá file vừa tải để Storage không còn file mồ côi.
export async function uploadMusic(input: {
	ten: string;
	bytes: ArrayBuffer;
	ext: string;
	type: string;
}): Promise<UploadedMusic> {
	const db = getDb();
	const path = `${SOUND.UPLOAD_DIR}/${crypto.randomUUID()}.${input.ext}`;

	const upload = await db.storage.from(SOUND.BUCKET).upload(path, input.bytes, {
		contentType: input.type,
		cacheControl: "31536000",
		upsert: false,
	});
	if (upload.error) throw upload.error;

	const { data, error } = await db
		.from("nhac_nen")
		.insert({
			ten: input.ten,
			duong_dan: path,
			kich_thuoc: input.bytes.byteLength,
			loai_file: input.type,
		})
		.select("id_nhac_nen, ten, kich_thuoc, created_at")
		.single();
	if (error) {
		await db.storage.from(SOUND.BUCKET).remove([path]);
		throw error;
	}

	return { ...data, src: getPublicUrl(path) };
}

// Không cho xoá bài đang dùng làm nhạc nền: admin phải chọn bài khác và lưu trước
export async function deleteMusic(id: number): Promise<Result<null>> {
	const settings = await getSoundSettings();
	if (settings.nhac_nen?.nguon === "tai_len" && settings.nhac_nen.id_nhac_nen === id) {
		return { ok: false, code: "in_use" };
	}

	const db = getDb();
	const { data, error } = await db
		.from("nhac_nen")
		.delete()
		.eq("id_nhac_nen", id)
		.select("duong_dan")
		.maybeSingle();
	if (error) throw error;
	if (!data) return { ok: false, code: "not_found" };

	// Dòng CSDL đã xoá; xoá file lỗi thì chỉ ghi log, không báo lỗi cho admin
	const removed = await db.storage.from(SOUND.BUCKET).remove([data.duong_dan]);
	if (removed.error) console.error("Xoá file nhạc trong Storage thất bại:", removed.error);
	return { ok: true, data: null };
}
