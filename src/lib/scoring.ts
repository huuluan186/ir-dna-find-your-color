// Thuật toán chấm điểm (hàm thuần, không gọi CSDL). Xem .ai/system/kien_truc.md mục 4.

export type ScoreInput = {
	colorIds: number[];
	questions: { id: number; options: { id: number; colorId: number }[] }[];
	selected: number[]; // id_dap_an theo thứ tự câu
};

export type ColorScore = { colorId: number; points: number };

export type ScoreKind = "don" | "ket_hop" | "dong_hang" | "da_sac";

export type ScoreResult = {
	points: ColorScore[]; // giảm dần; các điểm bằng nhau giữ thứ tự colorIds đầu vào
	topColorIds: number[];
	kind: ScoreKind;
};

export function score({ colorIds, questions, selected }: ScoreInput): ScoreResult {
	if (colorIds.length !== 6 || new Set(colorIds).size !== colorIds.length) {
		throw new Error("Danh sách mã gen không hợp lệ.");
	}

	if (questions.length === 0 || selected.length !== questions.length) {
		throw new Error("Cần chọn đúng một đáp án cho mỗi câu hỏi.");
	}

	const knownColorIds = new Set(colorIds);
	const questionIds = new Set<number>();
	const optionById = new Map<number, { questionId: number; colorId: number }>();

	for (const question of questions) {
		if (questionIds.has(question.id)) {
			throw new Error(`Câu hỏi bị trùng mã: ${question.id}`);
		}
		questionIds.add(question.id);

		if (question.options.length === 0) {
			throw new Error(`Câu hỏi ${question.id} chưa có đáp án.`);
		}

		for (const option of question.options) {
			if (optionById.has(option.id)) {
				throw new Error(`Đáp án bị trùng mã: ${option.id}`);
			}
			if (!knownColorIds.has(option.colorId)) {
				throw new Error(`Đáp án ${option.id} gán mã gen không hợp lệ.`);
			}
			optionById.set(option.id, { questionId: question.id, colorId: option.colorId });
		}
	}

	const selectedQuestionIds = new Set<number>();
	const totals = new Map(colorIds.map((colorId) => [colorId, 0]));

	for (const optionId of selected) {
		const option = optionById.get(optionId);
		if (!option) {
			throw new Error(`Đáp án không thuộc bộ câu hỏi: ${optionId}`);
		}
		if (selectedQuestionIds.has(option.questionId)) {
			throw new Error(`Chỉ được chọn một đáp án cho câu hỏi ${option.questionId}.`);
		}

		selectedQuestionIds.add(option.questionId);
		totals.set(option.colorId, totals.get(option.colorId)! + 1);
	}

	if (selectedQuestionIds.size !== questions.length) {
		throw new Error("Cần chọn đúng một đáp án cho mỗi câu hỏi.");
	}

	const points = colorIds
		.map((colorId) => ({ colorId, points: totals.get(colorId)! }))
		.sort((a, b) => b.points - a.points);
	const highestPoints = points[0].points;
	const topColorIds = points
		.filter((result) => result.points === highestPoints)
		.map((result) => result.colorId);

	return {
		points,
		topColorIds,
		kind:
			topColorIds.length === 1
				? "don"
				: topColorIds.length === 2
					? "ket_hop"
					: topColorIds.length === colorIds.length
						? "da_sac"
						: "dong_hang",
	};
}
