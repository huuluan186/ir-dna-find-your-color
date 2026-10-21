import "server-only";
import { getDb } from "@/lib/db";
import type {
	AdminColorDetail,
	AdminColorRow,
	AdminStudentDetail,
	AdminStudentRow,
} from "../types";

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

export async function listAdminColors(): Promise<AdminColorRow[]> {
	const { data, error } = await getDb()
		.from("mau_gen")
		.select(
			"id_mau_gen, ten_mau, ma_hex, ten_ma_gen, tu_khoa, y_nghia, linh_vuc, ky_nang, thu_tu, updated_at"
		)
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

export async function getAdminColorDetail(id: number): Promise<AdminColorDetail | null> {
	const { data, error } = await getDb()
		.from("mau_gen")
		.select(
			"id_mau_gen, ten_mau, ma_hex, ten_ma_gen, tu_khoa, y_nghia, linh_vuc, ky_nang, thu_tu, created_at, updated_at"
		)
		.eq("id_mau_gen", id)
		.eq("is_deleted", false)
		.maybeSingle();
	if (error) throw error;
	if (!data) return null;

	return {
		...data,
		tu_khoa: Array.isArray(data.tu_khoa) ? data.tu_khoa : [],
		y_nghia: data.y_nghia ?? "",
		linh_vuc: data.linh_vuc ?? "",
		ky_nang: data.ky_nang ?? "",
	};
}
