// Thuật toán chấm điểm (hàm thuần, không gọi CSDL). Xem .ai/system/kien_truc.md mục 4.

export type ScoreInput = {
	colors: { id: number; hex: string }[];
	questions: { id: number; options: { id: number; points: Record<number, number> }[] }[];
	selected: number[]; // id_dap_an theo thứ tự câu
};

export type ColorScore = { colorId: number; points: number; max: number; percent: number };

export type ScoreResult = {
	ranking: ColorScore[]; // giảm dần
	topColorId: number;
	blendHex: string;
};

export function score({ colors, questions, selected }: ScoreInput): ScoreResult {
	const optionById = new Map<number, { questionIndex: number; points: Record<number, number> }>();
	questions.forEach((q, questionIndex) => {
		for (const o of q.options) optionById.set(o.id, { questionIndex, points: o.points });
	});

	const stats = colors.map((c) => {
		// Điểm tối đa: điểm cao nhất màu này nhận được ở từng câu.
		const max = questions.reduce(
			(sum, q) => sum + Math.max(0, ...q.options.map((o) => o.points[c.id] ?? 0)),
			0
		);
		return { colorId: c.id, hex: c.hex, points: 0, max, lastQuestion: -1 };
	});

	for (const id of selected) {
		const option = optionById.get(id);
		if (!option) throw new Error(`Đáp án không hợp lệ: ${id}`);
		for (const s of stats) {
			const p = option.points[s.colorId] ?? 0;
			if (p > 0) {
				s.points += p;
				s.lastQuestion = Math.max(s.lastQuestion, option.questionIndex);
			}
		}
	}

	const ratio = (s: (typeof stats)[number]) => (s.max === 0 ? 0 : s.points / s.max);
	// Giảm dần theo phần trăm; hoà thì màu được cộng điểm ở câu gần cuối nhất đứng trước.
	const sorted = [...stats].sort((a, b) => ratio(b) - ratio(a) || b.lastQuestion - a.lastQuestion);

	const [first, second] = sorted;
	return {
		ranking: sorted.map((s) => ({
			colorId: s.colorId,
			points: s.points,
			max: s.max,
			percent: Math.round(ratio(s) * 100),
		})),
		topColorId: first.colorId,
		blendHex: blend(first.hex, ratio(first), second?.hex, second ? ratio(second) : 0),
	};
}

// Trộn RGB 2 màu theo tỉ lệ phần trăm (86% và 57% → 60:40).
function blend(hexA: string, weightA: number, hexB: string | undefined, weightB: number): string {
	const total = weightA + weightB;
	if (!hexB || weightB === 0 || total === 0) return hexA.toUpperCase();
	const a = toRgb(hexA);
	const b = toRgb(hexB);
	const mixed = a.map((v, i) => Math.round((v * weightA + b[i] * weightB) / total));
	return (
		"#" +
		mixed
			.map((v) => v.toString(16).padStart(2, "0"))
			.join("")
			.toUpperCase()
	);
}

function toRgb(hex: string): number[] {
	const n = parseInt(hex.replace("#", ""), 16);
	return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
