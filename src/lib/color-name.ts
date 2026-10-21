import nearestColor from "nearest-color";

/**
 * Bảng màu chuẩn neo theo 6 màu gen của dự án và các màu phổ quát
 * Giúp nhận diện chính xác dải màu mà người dùng chọn
 */
const COLOR_PALETTE = {
	Red: "#E53935",
	Orange: "#FB8C00",
	Yellow: "#FDD835",
	Green: "#43A047",
	Blue: "#1E4FA3",
	Purple: "#8E24AA",
	Pink: "#E91E63",
	Brown: "#795548",
	Gray: "#9E9E9E",
	Black: "#000000",
	White: "#FFFFFF",
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
	Orange: { vi: "Cam", en: "Orange" },
	Yellow: { vi: "Vàng", en: "Yellow" },
	Green: { vi: "Xanh lá", en: "Green" },
	Blue: { vi: "Xanh dương", en: "Blue" },
	Purple: { vi: "Tím", en: "Purple" },
	Pink: { vi: "Hồng", en: "Pink" },
	Brown: { vi: "Nâu", en: "Brown" },
	Gray: { vi: "Xám", en: "Gray" },
	Black: { vi: "Đen", en: "Black" },
	White: { vi: "Trắng", en: "White" },
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
