import type { Howl } from "howler";
import { STORAGE_KEYS } from "@/constants/app";

// Âm thanh phía trình duyệt. Nhạc nền: Howler (lặp, tăng/giảm dần). Hiệu ứng: ZzFX tạo tiếng bằng code,
// không cần file. Cả hai được import động khi cần để không chạy lúc render ở server.
// Trình duyệt chỉ cho phát sau lần chạm/bấm đầu tiên: Howler tự mở khoá AudioContext ở lần đó
// (kể cả Safari iOS), nhạc đã gọi play() trước đó sẽ tự bắt đầu. Xem .ai/system/am_thanh.md

export type SfxName =
	"tap" | "select" | "next" | "back" | "page" | "success" | "decode" | "celebrate";

// Tham số ZzFX theo thứ tự: âm lượng, độ ngẫu nhiên, tần số (Hz), attack, sustain, release (giây),
// dạng sóng (0 = sin), độ cong, trượt cao độ, trượt bậc 2, nhảy cao độ (Hz), thời điểm nhảy (giây).
// Tiếng sin ngắn, nhẹ. Thử và chỉnh ở https://killedbyapixel.github.io/ZzFX/
const SFX: Record<SfxName, (number | undefined)[]> = {
	tap: [0.5, 0, 880, 0, 0.005, 0.04],
	select: [0.6, 0, 660, 0.005, 0.03, 0.09, 0, 1, 0, 0, 220, 0.03], // E5 → A5
	next: [0.5, 0, 520, 0.01, 0.04, 0.12, 0, 1, 6], // trượt lên
	back: [0.5, 0, 620, 0.01, 0.04, 0.12, 0, 1, -6], // trượt xuống
	page: [0.45, 0, 392, 0.02, 0.06, 0.2, 0, 1, 0, 0, 196, 0.06], // G4 → D5
	success: [0.7, 0, 523, 0.02, 0.25, 0.5, 0, 1, 0, 0, 262, 0.1], // C5 → G5
	decode: [0.45, 0, 440, 0.03, 0.12, 0.32, 0, 1, 0, 0, 147, 0.08], // A4 → D5 êm dịu khi giải mã
	celebrate: [0.5, 0, 523.25, 0.015, 0.12, 0.38, 0, 1, 0, 0, 135.25, 0.07], // C5 → E5
};

// Chuỗi nốt hợp âm chúc mừng (E5 → G5 → C6) nối tiếp sau nốt đầu của "celebrate"
const CELEBRATE_CHIME_NOTES: { delayMs: number; params: (number | undefined)[] }[] = [
	{ delayMs: 110, params: [0.48, 0, 659.25, 0.015, 0.12, 0.4, 0, 1, 0, 0, 124.75, 0.07] },
	{ delayMs: 230, params: [0.55, 0, 783.99, 0.02, 0.22, 0.55, 0, 1, 0, 0, 262.51, 0.09] },
];

const MUSIC_FADE_MS = 1200;

type Engine = {
	Howl: typeof Howl;
	howler: typeof import("howler").Howler;
	zzfx: (...parameters: (number | undefined)[]) => unknown;
	ZZFX: typeof import("zzfx").ZZFX;
};

let enginePromise: Promise<Engine> | undefined;
let engine: Engine | undefined;

function loadEngine() {
	enginePromise ??= Promise.all([import("howler"), import("zzfx")]).then(([howlerMod, zzfxMod]) => {
		// Tắt autoSuspend để Howler không tự tạm dừng AudioContext sau 30 giây khi nhạc nền đang tắt.
		howlerMod.Howler.autoSuspend = false;
		// Howler.volume() tạo AudioContext nếu chưa có. Đóng AudioContext thừa do zzfx tự tạo lúc import.
		howlerMod.Howler.volume(1);
		if (
			zzfxMod.ZZFX.audioContext &&
			zzfxMod.ZZFX.audioContext !== howlerMod.Howler.ctx &&
			zzfxMod.ZZFX.audioContext.state !== "closed"
		) {
			void zzfxMod.ZZFX.audioContext.close().catch(() => {});
		}
		zzfxMod.ZZFX.audioContext = howlerMod.Howler.ctx;
		engine = {
			Howl: howlerMod.Howl,
			howler: howlerMod.Howler,
			zzfx: zzfxMod.zzfx,
			ZZFX: zzfxMod.ZZFX,
		};
		return engine;
	});
	return enginePromise;
}

// ---------- Trạng thái dùng chung cho giao diện (nút bật/tắt tiếng) ----------

// active: đang ở trang sinh viên (có StudentSound). hasMusic: admin đang bật nhạc nền.
// muted: người dùng tắt tiếng (chỉ có tác dụng khi hasMusic = true, lúc có hiện nút loa).
export type SoundState = { active: boolean; muted: boolean; hasMusic: boolean };

const SERVER_STATE: SoundState = { active: false, muted: false, hasMusic: false };
let state: SoundState | undefined;
const listeners = new Set<() => void>();

function readMuted() {
	try {
		return window.localStorage.getItem(STORAGE_KEYS.MUTED) === "1";
	} catch {
		return false;
	}
}

export function getSoundState(): SoundState {
	state ??= { active: false, muted: readMuted(), hasMusic: false };
	return state;
}

export function getServerSoundState() {
	return SERVER_STATE;
}

export function subscribeSound(listener: () => void) {
	listeners.add(listener);
	return () => listeners.delete(listener);
}

function setState(patch: Partial<SoundState>) {
	const current = getSoundState();
	const next = { ...current, ...patch };
	if (
		next.active === current.active &&
		next.muted === current.muted &&
		next.hasMusic === current.hasMusic
	) {
		return;
	}
	state = next;
	listeners.forEach((listener) => listener());
	syncMusic();
}

export function toggleMuted() {
	const muted = !getSoundState().muted;
	try {
		window.localStorage.setItem(STORAGE_KEYS.MUTED, muted ? "1" : "0");
	} catch {
		// Trình duyệt chặn localStorage (chế độ riêng tư): vẫn tắt/bật trong lượt này
	}
	setState({ muted });
}

// ---------- Nhạc nền ----------

let music: Howl | undefined;
let musicSrc: string | null = null;
let musicVolume = 0.4;
let effectsEnabled = true;
let leaveTimer: ReturnType<typeof setTimeout> | undefined;
let lastPath: string | undefined;

// Phát khi đang ở trang sinh viên và chưa tắt tiếng; ngược lại giảm dần rồi dừng
function syncMusic() {
	if (!music) return;
	const { active, muted } = getSoundState();
	const shouldPlay = active && !muted && musicVolume > 0;

	if (shouldPlay && !music.playing()) {
		music.play();
		music.fade(0, musicVolume, MUSIC_FADE_MS);
	} else if (!shouldPlay && music.playing()) {
		const fading = music;
		fading.fade(fading.volume(), 0, MUSIC_FADE_MS / 2);
		fading.once("fade", () => {
			if (!getSoundState().active || getSoundState().muted) fading.pause();
		});
	}
}

// Gọi khi có cài đặt từ server. Cùng bài thì chỉ đổi âm lượng, bài khác thì thay và phát lại từ đầu.
export async function setMusic(src: string | null, volume: number, effects: boolean) {
	effectsEnabled = effects;
	musicVolume = volume;
	setState({ hasMusic: Boolean(src) });
	if (src === musicSrc) {
		if (music?.playing()) music.fade(music.volume(), volume, MUSIC_FADE_MS / 2);
		syncMusic();
		return;
	}

	// Đổi bài giữa chừng (admin vừa đổi): bài cũ giảm dần rồi mới huỷ
	const old = music;
	if (old?.playing()) {
		old.fade(old.volume(), 0, MUSIC_FADE_MS / 2);
		old.once("fade", () => old.unload());
	} else {
		old?.unload();
	}
	music = undefined;
	musicSrc = src;
	if (!src) return;

	const { Howl } = await loadEngine();
	if (musicSrc !== src) return; // đã đổi bài khác trong lúc tải thư viện
	music = new Howl({ src: [src], loop: true, volume: 0 });
	syncMusic();
}

// StudentSound gọi khi vào trang sinh viên. Chuyển giữa hai trang sinh viên thì phát tiếng chuyển trang.
export function enterStudentPage(path: string) {
	clearTimeout(leaveTimer);
	if (lastPath !== undefined && lastPath !== path) playSfx("page");
	lastPath = path;
	if (!getSoundState().active) setState({ active: true });
	void loadEngine();
}

// Chờ một nhịp: chuyển sang trang sinh viên khác thì trang mới gọi enterStudentPage ngay, nhạc không bị ngắt
export function leaveStudentPage() {
	clearTimeout(leaveTimer);
	leaveTimer = setTimeout(() => setState({ active: false }), 400);
}

// ---------- Hiệu ứng ----------

function canPlayEffects() {
	const { active, muted, hasMusic } = getSoundState();
	if (!active || !effectsEnabled) return false;
	if (hasMusic && muted) return false;
	return true;
}

function playNoteSequence(eng: Engine, name: SfxName) {
	eng.zzfx(...SFX[name]);
	if (name === "celebrate") {
		for (const note of CELEBRATE_CHIME_NOTES) {
			setTimeout(() => {
				if (!canPlayEffects()) return;
				const currentCtx = eng.howler.ctx;
				if (!currentCtx || currentCtx.state !== "running") return;
				eng.ZZFX.audioContext = currentCtx;
				eng.zzfx(...note.params);
			}, note.delayMs);
		}
	}
}

function triggerSfx(eng: Engine, name: SfxName) {
	// Luôn đọc Howler.ctx hiện tại vì Howler._unlockAudio() có thể đóng ctx đầu tiên và tạo ctx mới
	// khi sampleRate của thiết bị khác 44100 Hz (VD: 48000 Hz trên desktop).
	const ctx = eng.howler.ctx;
	if (!ctx) return;
	eng.ZZFX.audioContext = ctx;

	if (ctx.state === "running") {
		playNoteSequence(eng, name);
		return;
	}
	if (ctx.state === "suspended") {
		void ctx
			.resume()
			.then(() => {
				if (eng.howler.ctx) eng.ZZFX.audioContext = eng.howler.ctx;
				playNoteSequence(eng, name);
			})
			.catch(() => {});
	}
}

export function playSfx(name: SfxName) {
	if (!canPlayEffects()) return;
	if (engine) {
		triggerSfx(engine, name);
		return;
	}
	void loadEngine().then((eng) => triggerSfx(eng, name));
}

// ---------- Nghe thử ở trang admin ----------

let preview: Howl | undefined;

export function stopPreview() {
	preview?.unload();
	preview = undefined;
}

// html5: phát ngay khi tải được một phần, không phải chờ tải hết file
export async function playPreview(src: string, volume: number, onEnd: () => void) {
	stopPreview();
	const { Howl } = await loadEngine();
	const howl = new Howl({ src: [src], html5: true, volume, onend: onEnd, onloaderror: onEnd });
	preview = howl;
	howl.play();
}

export function setPreviewVolume(volume: number) {
	preview?.volume(volume);
}
