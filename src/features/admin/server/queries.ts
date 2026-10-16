import "server-only";
import { getDb } from "@/lib/db";
import type { AdminStudentDetail, AdminStudentRow } from "../types";

type StudentWithResults = {
	mssv: string;
	ho_ten: string;
	created_at: string;
	bi_khoa: boolean;
	ket_qua: { created_at: string }[];
};

// Đếm số lần làm và lấy lần gần nhất từ các dòng ket_qua đi kèm
function summarize<T extends StudentWithResults>({ ket_qua, ...student }: T) {
	const times = ket_qua.map((row) => row.created_at).sort();
	return { ...student, so_lan_lam: times.length, lan_lam_gan_nhat: times.at(-1) ?? null };
}

// ponytail: tải hết sinh viên một lần, lọc và phân trang ở client. Đủ cho vài nghìn dòng của
// một triển lãm; nhiều hơn thì chuyển sang phân trang ở server (range + count).
export async function listStudents(): Promise<AdminStudentRow[]> {
	const { data, error } = await getDb()
		.from("sinh_vien")
		.select("mssv, ho_ten, created_at, bi_khoa, ket_qua(created_at)")
		.order("created_at", { ascending: false });
	if (error) throw error;

	return data.map(summarize);
}

// Trả null nếu không có sinh viên này
export async function getStudentDetail(mssv: string): Promise<AdminStudentDetail | null> {
	const { data, error } = await getDb()
		.from("sinh_vien")
		.select("mssv, ho_ten, created_at, updated_at, bi_khoa, khoa_luc, ket_qua(created_at)")
		.eq("mssv", mssv)
		.maybeSingle();
	if (error) throw error;

	return data ? summarize(data) : null;
}
