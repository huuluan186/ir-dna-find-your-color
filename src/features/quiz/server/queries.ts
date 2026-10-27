import "server-only";
import { findStudent } from "@/features/auth/server/queries";
import { getDb } from "@/lib/db";
import type { ScoreKind } from "@/lib/scoring";
import type { GeneProfile, QuizQuestion, QuizResultData, RankingItem } from "../types";

export const RETAKE_SETTING_KEY = "cho_lam_lai";

// Lấy bộ câu hỏi đang bật cùng các phương án chưa xoá, sắp theo thứ tự hiển thị.
// Tuyệt đối không lấy bảng diem_dap_an để trình duyệt không biết phương án thuộc mã gen nào.
export async function getActiveQuiz(): Promise<QuizQuestion[]> {
	const { data, error } = await getDb()
		.from("cau_hoi")
		.select("id_cau_hoi, noi_dung, thu_tu, dap_an(id_dap_an, noi_dung, thu_tu, is_deleted)")
		.eq("dang_bat", true)
		.eq("is_deleted", false)
		.order("thu_tu", { ascending: true })
		.order("id_cau_hoi", { ascending: true });
	if (error) throw error;

	return data.map(({ dap_an, ...question }) => ({
		...question,
		dap_an: dap_an
			.filter((option) => !option.is_deleted)
			.sort((a, b) => a.thu_tu - b.thu_tu || a.id_dap_an - b.id_dap_an)
			.map(({ id_dap_an, noi_dung, thu_tu }) => ({ id_dap_an, noi_dung, thu_tu })),
	}));
}

export async function getActiveGenes(): Promise<GeneProfile[]> {
	const { data, error } = await getDb()
		.from("mau_gen")
		.select("id_mau_gen, ten_mau, ma_hex, ten_ma_gen, tu_khoa, y_nghia, linh_vuc, ky_nang, thu_tu")
		.eq("is_deleted", false)
		.order("thu_tu", { ascending: true })
		.order("id_mau_gen", { ascending: true });
	if (error) throw error;

	return data.map((row) => ({
		...row,
		tu_khoa: Array.isArray(row.tu_khoa) ? row.tu_khoa : [],
		y_nghia: row.y_nghia ?? "",
		linh_vuc: row.linh_vuc ?? "",
		ky_nang: row.ky_nang ?? "",
	}));
}

export async function getRetakeAllowed(): Promise<boolean> {
	const { data, error } = await getDb()
		.from("cai_dat")
		.select("gia_tri")
		.eq("khoa", RETAKE_SETTING_KEY)
		.maybeSingle();
	if (error) throw error;

	return typeof data?.gia_tri === "boolean" ? data.gia_tri : true;
}

export async function getLatestQuizResult(mssv: string): Promise<QuizResultData | null> {
	const [student, latestRes, genes, choLamLai] = await Promise.all([
		findStudent(mssv),
		getDb()
			.from("ket_qua")
			.select("id_ket_qua, mssv, bang_xep_hang, top_mau_gen_ids, loai_ket_qua, created_at")
			.eq("mssv", mssv)
			.order("created_at", { ascending: false })
			.order("id_ket_qua", { ascending: false })
			.limit(1)
			.maybeSingle(),
		getActiveGenes(),
		getRetakeAllowed(),
	]);

	if (latestRes.error) throw latestRes.error;
	if (!student || !latestRes.data) return null;

	const row = latestRes.data;
	return {
		id_ket_qua: row.id_ket_qua,
		mssv: row.mssv,
		ho_ten: student.ho_ten,
		loai_ket_qua: row.loai_ket_qua as ScoreKind,
		top_mau_gen_ids: Array.isArray(row.top_mau_gen_ids) ? (row.top_mau_gen_ids as number[]) : [],
		bang_xep_hang: Array.isArray(row.bang_xep_hang) ? (row.bang_xep_hang as RankingItem[]) : [],
		genes,
		cho_lam_lai: choLamLai,
		created_at: row.created_at,
	};
}
