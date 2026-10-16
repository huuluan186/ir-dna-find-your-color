// zzfx không kèm kiểu TypeScript; chỉ khai báo phần dự án dùng (src/lib/sound.ts)
declare module "zzfx" {
	export function zzfx(...parameters: (number | undefined)[]): AudioBufferSourceNode;
	export const ZZFX: {
		volume: number;
		audioContext: AudioContext;
	};
}
