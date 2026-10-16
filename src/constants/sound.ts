import { ASSETS } from "./assets";

// Âm thanh: nhạc nền có sẵn, giới hạn file tải lên, mặc định. Xem .ai/system/am_thanh.md

// Nhạc nền có sẵn (CC0, nguồn ghi trong .ai/system/am_thanh.md). labelKey là khoá dịch nhóm "adminSound".
// Thêm bài: chép file vào public/sounds/bgm, khai báo trong ASSETS.BGM rồi thêm một dòng ở đây.
export const BGM_PRESETS = [
	{ ma: "funky-house", src: ASSETS.BGM.FUNKY_HOUSE, labelKey: "presetFunkyHouse" },
	{ ma: "happy-vibes", src: ASSETS.BGM.HAPPY_VIBES, labelKey: "presetHappyVibes" },
	{ ma: "happy-clappy", src: ASSETS.BGM.HAPPY_CLAPPY, labelKey: "presetHappyClappy" },
	{ ma: "outer-space", src: ASSETS.BGM.OUTER_SPACE, labelKey: "presetOuterSpace" },
	{ ma: "upbeat-synth", src: ASSETS.BGM.UPBEAT_SYNTH, labelKey: "presetUpbeatSynth" },
	{ ma: "chill-loop", src: ASSETS.BGM.CHILL_LOOP, labelKey: "presetChillLoop" },
] as const;

export type BgmPresetId = (typeof BGM_PRESETS)[number]["ma"];

export const BGM_PRESET_IDS = BGM_PRESETS.map((preset) => preset.ma) as [
	BgmPresetId,
	...BgmPresetId[],
];

export const SOUND = {
	// Supabase Storage: bucket công khai, file nhạc tải lên nằm trong thư mục UPLOAD_DIR
	BUCKET: "am-thanh",
	UPLOAD_DIR: "nhac-nen",
	// Vercel chặn body > 4,5 MB nên giữ 4 MB. Đổi số này thì sửa cả file_size_limit trong migration
	MAX_UPLOAD_BYTES: 4 * 1024 * 1024,
	// Đuôi file → loại file lưu trong Storage. Chỉ MP3/M4A vì Safari iOS không phát được OGG
	UPLOAD_TYPES: { mp3: "audio/mpeg", m4a: "audio/mp4" },
	UPLOAD_ACCEPT: "audio/mpeg,audio/mp3,audio/mp4,audio/x-m4a,.mp3,.m4a",
	NAME_MAX_LENGTH: 100,
	DEFAULT_PRESET: "outer-space" as BgmPresetId,
	DEFAULT_VOLUME: 40,
} as const;
