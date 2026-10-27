import "server-only";
import { findStudent } from "@/features/auth/server/queries";
import { getDb } from "@/lib/db";
import { score, type ScoreInput } from "@/lib/scoring";
import type { QuizResultData, RankingItem } from "../types";
import { getActiveGenes, getRetakeAllowed } from "./queries";

export type SubmitQuizErrorCode =
	"unauthorized" | "account_locked" | "retake_disabled" | "invalid_submission";

export class SubmitQuizError extends Error {
	constructor(
		public readonly code: SubmitQuizErrorCode,
		public readonly status: number
	) {
		super(code);
	}
}

type RawPoint = { id_mau_gen: number; diem: number };
type RawOption = {
	id_dap_an: number;
	thu_tu: number;
	is_deleted: boolean;
	diem_dap_an: RawPoint | RawPoint[] | null;
};

function extractColorId(raw: RawOption["diem_dap_an"]): number | null {
	if (!raw) return null;
	const first = Array.isArray(raw) ? raw[0] : raw;
	return first ? first.id_mau_gen : null;
}

async function getScoringQuestions(): Promise<ScoreInput["questions"]> {
	const { data, error } = await getDb()
		.from("cau_hoi")
		.select(
			"id_cau_hoi, thu_tu, dap_an(id_dap_an, thu_tu, is_deleted, diem_dap_an(id_mau_gen, diem))"
		)
		.eq("dang_bat", true)
		.eq("is_deleted", false)
		.order("thu_tu", { ascending: true })
		.order("id_cau_hoi", { ascending: true });
	if (error) throw error;

	return data.map((q) => {
		const options = (q.dap_an as unknown as RawOption[])
			.filter((opt) => !opt.is_deleted)
			.sort((a, b) => a.thu_tu - b.thu_tu || a.id_dap_an - b.id_dap_an)
			.flatMap((opt) => {
				const colorId = extractColorId(opt.diem_dap_an);
				return colorId !== null ? [{ id: opt.id_dap_an, colorId }] : [];
			});
		return { id: q.id_cau_hoi, options };
	});
}

export async function submitQuiz(mssv: string, selected: number[]): Promise<QuizResultData> {
	const [student, choLamLai, genes, questions] = await Promise.all([
		findStudent(mssv),
		getRetakeAllowed(),
		getActiveGenes(),
		getScoringQuestions(),
	]);

	if (!student) throw new SubmitQuizError("unauthorized", 401);
	if (student.bi_khoa) throw new SubmitQuizError("account_locked", 403);

	if (!choLamLai) {
		const { count, error } = await getDb()
			.from("ket_qua")
			.select("id_ket_qua", { count: "exact", head: true })
			.eq("mssv", mssv);
		if (error) throw error;
		if ((count ?? 0) > 0) throw new SubmitQuizError("retake_disabled", 403);
	}

	let scored: ReturnType<typeof score>;
	try {
		scored = score({
			colorIds: genes.map((gene) => gene.id_mau_gen),
			questions,
			selected,
		});
	} catch {
		throw new SubmitQuizError("invalid_submission", 400);
	}

	const geneMap = new Map(genes.map((gene) => [gene.id_mau_gen, gene]));
	const bang_xep_hang: RankingItem[] = scored.points.map((pt) => ({
		id_mau_gen: pt.colorId,
		ten_mau: geneMap.get(pt.colorId)?.ten_mau ?? "",
		diem: pt.points,
	}));

	const { data: inserted, error: insertError } = await getDb()
		.from("ket_qua")
		.insert({
			mssv,
			dap_an_da_chon: selected,
			bang_xep_hang,
			top_mau_gen_ids: scored.topColorIds,
			loai_ket_qua: scored.kind,
		})
		.select("id_ket_qua, created_at")
		.single();

	if (insertError) throw insertError;

	return {
		id_ket_qua: inserted.id_ket_qua,
		mssv,
		ho_ten: student.ho_ten,
		loai_ket_qua: scored.kind,
		top_mau_gen_ids: scored.topColorIds,
		bang_xep_hang,
		genes,
		cho_lam_lai: choLamLai,
		created_at: inserted.created_at,
	};
}
