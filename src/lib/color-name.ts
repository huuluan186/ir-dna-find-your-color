import nearestColor from "nearest-color";

// Bộ màu tiếng Anh tiêu chuẩn phổ quát để bắt dải màu
const COLOR_PALETTE = {
	Red: "#FF0000",
	Crimson: "#DC143C",
	Coral: "#FF7F50",
	Orange: "#FFA500",
	Gold: "#FFD700",
	Yellow: "#FFFF00",
	Lime: "#00FF00",
	Green: "#008000",
	Teal: "#008080",
	Cyan: "#00FFFF",
	SkyBlue: "#87CEEB",
	Blue: "#0000FF",
	Navy: "#000080",
	Indigo: "#4B0082",
	Purple: "#800080",
	Violet: "#EE82EE",
	Magenta: "#FF00FF",
	Pink: "#FFC0CB",
	Brown: "#8B4513",
	White: "#FFFFFF",
	Gray: "#808080",
	Black: "#000000",
};

const matcher = nearestColor.from(COLOR_PALETTE);

/**
 * Lấy tên màu tiếng Anh gần nhất từ mã HEX bằng thuật toán Euclidean Distance
 * @param hex Mã màu dạng #RRGGBB hoặc #RGB
 * @returns Tên màu tiếng Anh (ví dụ: "Red", "Orange", "Blue"...)
 */
export function getClosestColorName(hex: string): string {
	if (!hex || typeof hex !== "string") return "";
	const trimmed = hex.trim();
	if (!/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(trimmed)) return "";

	try {
		const match = matcher(trimmed);
		return match?.name ?? "";
	} catch {
		return "";
	}
}

/**
 * Bản đồ dịch tên màu tiếng Anh sang tiếng Việt
 */
export const COLOR_TRANSLATIONS: Record<string, { vi: string; en: string }> = {
	Red: { vi: "Đỏ", en: "Red" },
	Crimson: { vi: "Đỏ thẫm", en: "Crimson" },
	Coral: { vi: "Cam san hô", en: "Coral" },
	Orange: { vi: "Cam", en: "Orange" },
	Gold: { vi: "Vàng kim", en: "Gold" },
	Yellow: { vi: "Vàng", en: "Yellow" },
	Lime: { vi: "Xanh chanh", en: "Lime" },
	Green: { vi: "Xanh lá", en: "Green" },
	Teal: { vi: "Xanh mòng két", en: "Teal" },
	Cyan: { vi: "Xanh ngọc (Cyan)", en: "Cyan" },
	SkyBlue: { vi: "Xanh da trời", en: "Sky Blue" },
	Blue: { vi: "Xanh dương", en: "Blue" },
	Navy: { vi: "Xanh navy", en: "Navy" },
	Indigo: { vi: "Chàm", en: "Indigo" },
	Purple: { vi: "Tím", en: "Purple" },
	Violet: { vi: "Tím hoa cà", en: "Violet" },
	Magenta: { vi: "Hồng cánh sen", en: "Magenta" },
	Pink: { vi: "Hồng", en: "Pink" },
	Brown: { vi: "Nâu", en: "Brown" },
	White: { vi: "Trắng", en: "White" },
	Gray: { vi: "Xám", en: "Gray" },
	Black: { vi: "Đen", en: "Black" },
};

/**
 * Lấy tên màu bản địa hoá theo ngôn ngữ giao diện
 * @param hex Mã màu
 * @param locale "vi" hoặc "en"
 */
export function getLocalizedColorName(hex: string, locale: "vi" | "en" = "vi"): string {
	const englishName = getClosestColorName(hex);
	if (!englishName) return "";
	const trans = COLOR_TRANSLATIONS[englishName];
	if (!trans) return englishName;
	return locale === "en" ? trans.en : trans.vi;
}
