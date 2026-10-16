// Ảnh, âm thanh trong public/. Thêm file mới thì khai báo ở đây.
export const ASSETS = {
	FAVICON: "/favicon.ico",
	// Nhạc nền có sẵn (CC0), danh sách cho admin chọn ở src/constants/sound.ts
	BGM: {
		FUNKY_HOUSE: "/sounds/bgm/funky-house.mp3",
		HAPPY_VIBES: "/sounds/bgm/happy-vibes.mp3",
		HAPPY_CLAPPY: "/sounds/bgm/happy-clappy.mp3",
		OUTER_SPACE: "/sounds/bgm/outer-space.mp3",
		UPBEAT_SYNTH: "/sounds/bgm/upbeat-synth.mp3",
		CHILL_LOOP: "/sounds/bgm/chill-loop.mp3",
	},
} as const;
