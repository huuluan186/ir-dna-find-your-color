import { colord, extend } from "colord";
import labPlugin from "colord/plugins/lab";

extend([labPlugin]);

export type ColorFamily =
	| "Red"
	| "Orange"
	| "Yellow"
	| "Green"
	| "Blue"
	| "Purple"
	| "Pink"
	| "Brown"
	| "Gray"
	| "White"
	| "Black";

/**
 * Xác định nhóm màu (Color Family) bằng phân tích không gian màu HSL
 */
export function getColorFamily(hex: string): ColorFamily | null {
	if (!hex || typeof hex !== "string") return null;
	const c = colord(hex.trim());
	if (!c.isValid()) return null;

	const { h, s, l } = c.toHsl();

	// Kiểm tra các nhóm màu phi sắc (Achromatic) và đặc biệt
	if (l < 12) return "Black";
	if (l > 90 && s < 20) return "White";
	if (s < 14) return "Gray";
	if (h >= 10 && h < 45 && l < 40 && s < 80) return "Brown";

	// Dải quang phổ góc Hue (0 - 360 độ)
	if (h >= 345 || h < 15) return "Red";
	if (h >= 15 && h < 45) return "Orange";
	if (h >= 45 && h < 70) return "Yellow";
	if (h >= 70 && h < 165) return "Green";
	if (h >= 165 && h < 255) return "Blue";
	if (h >= 255 && h < 315) return "Purple";
	return "Pink";
}

/**
 * Bản đồ dịch tên nhóm màu tiếng Anh sang tiếng Việt
 */
export const COLOR_TRANSLATIONS: Record<ColorFamily, { vi: string; en: string }> = {
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
 * Lấy tên màu tự động theo mã HEX và ngôn ngữ hiển thị
 */
export function getLocalizedColorName(hex: string, locale: "vi" | "en" = "vi"): string {
	const family = getColorFamily(hex);
	if (!family) return "";
	const trans = COLOR_TRANSLATIONS[family];
	return locale === "en" ? trans.en : trans.vi;
}

/**
 * Kiểm tra xem 2 mã màu có thực sự trùng lặp hoặc quá gần nhau hay không
 * Sử dụng kết hợp:
 * 1. Cùng nhóm màu (Color Family)
 * 2. Khoảng cách thị giác Delta-E trong không gian màu CIELAB < 0.10
 */
export function areColorsTooSimilar(
	hex1: string,
	hex2: string,
	deltaThreshold = 0.1
): { similar: boolean; reason?: string } {
	const c1 = colord(hex1.trim());
	const c2 = colord(hex2.trim());

	if (!c1.isValid() || !c2.isValid()) {
		return { similar: false };
	}

	// 1. Nếu trùng hoàn toàn mã HEX
	if (c1.toHex().toUpperCase() === c2.toHex().toUpperCase()) {
		return { similar: true, reason: "EXACT_HEX" };
	}

	// 2. Tính khoảng cách thị giác Delta trong CIE LAB
	const delta = c1.delta(c2);
	const family1 = getColorFamily(hex1);
	const family2 = getColorFamily(hex2);

	// Nếu cùng nhóm màu và độ sai lệch thị giác < 0.10 (mắt người nhìn vào thấy gần như cùng một màu)
	if (family1 === family2 && delta < deltaThreshold) {
		return { similar: true, reason: "VISUALLY_IDENTICAL" };
	}

	return { similar: false };
}
