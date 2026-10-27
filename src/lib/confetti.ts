// Pháo hoa giấy chúc mừng khi mở màn kết quả IR DNA.
// Sử dụng màu hex của các mã gen dẫn đầu của sinh viên và tự tắt nếu trình duyệt bật giảm chuyển động.

const DEFAULT_DNA_COLORS = ["#E53935", "#FB8C00", "#FDD835", "#43A047", "#1E4FA3", "#8E24AA"];

export async function fireDnaConfetti(hexColors?: string[]) {
	if (typeof window === "undefined") return;
	if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

	const palette = hexColors && hexColors.length > 0 ? hexColors : DEFAULT_DNA_COLORS;
	// Nếu chỉ có 1 màu chủ đạo, pha thêm ánh vàng sáng và trắng ngọc để pháo hoa nổi bật trên cả nền sáng/tối
	const colors = palette.length === 1 ? [palette[0], "#FDD835", "#FFFFFF"] : palette;

	const { default: confetti } = await import("canvas-confetti");

	// Đợt 1: bung ở chính giữa màn hình
	void confetti({
		particleCount: 70,
		spread: 76,
		origin: { x: 0.5, y: 0.58 },
		colors,
		disableForReducedMotion: true,
	});

	// Đợt 2: bắn chéo từ hai bên sườn lên giữa
	setTimeout(() => {
		void confetti({
			particleCount: 45,
			angle: 60,
			spread: 58,
			origin: { x: 0.08, y: 0.72 },
			colors,
			disableForReducedMotion: true,
		});
		void confetti({
			particleCount: 45,
			angle: 120,
			spread: 58,
			origin: { x: 0.92, y: 0.72 },
			colors,
			disableForReducedMotion: true,
		});
	}, 220);

	// Đợt 3: mưa kim tuyến nhẹ từ đỉnh xuống
	setTimeout(() => {
		void confetti({
			particleCount: 55,
			spread: 110,
			startVelocity: 28,
			decay: 0.92,
			scalar: 0.95,
			origin: { x: 0.5, y: 0.28 },
			colors,
			disableForReducedMotion: true,
		});
	}, 520);
}
