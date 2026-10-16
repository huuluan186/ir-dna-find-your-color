import type { SoundSettings } from "./schema";

// Trang sinh viên chỉ nhận đúng thứ cần để phát: đường dẫn file, âm lượng 0–1, bật hiệu ứng
export type PublicSound = {
	src: string | null;
	volume: number;
	effects: boolean;
};

// Một bài admin đã tải lên (dòng nhac_nen + đường dẫn công khai để nghe thử)
export type UploadedMusic = {
	id_nhac_nen: number;
	ten: string;
	kich_thuoc: number;
	created_at: string;
	src: string;
};

export type AdminSound = {
	settings: SoundSettings;
	uploads: UploadedMusic[];
};
