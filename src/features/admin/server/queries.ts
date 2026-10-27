import "server-only";
import { getDb } from "@/lib/db";
import type {
	AdminColorDetail,
	AdminColorRow,
	AdminQuestionDetail,
	AdminQuestionOption,
	AdminQuestionRow,
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

type RawDiem = {
	id_mau_gen: number;
	mau_gen:
		| {
				id_mau_gen: number;
				ten_mau: string;
				ma_hex: string;
				ten_ma_gen: string;
		  }
		| {
				id_mau_gen: number;
				ten_mau: string;
				ma_hex: string;
				ten_ma_gen: string;
		  }[]
		| null;
};

type RawOption = {
	id_dap_an: number;
	noi_dung: string;
	thu_tu: number;
	is_deleted: boolean;
	diem_dap_an: RawDiem | RawDiem[] | null;
};

function parseQuestionOption(opt: RawOption): AdminQuestionOption {
	const firstDiem = Array.isArray(opt.diem_dap_an) ? opt.diem_dap_an[0] : opt.diem_dap_an;
	const mauGen = firstDiem
		? Array.isArray(firstDiem.mau_gen)
			? firstDiem.mau_gen[0]
			: firstDiem.mau_gen
		: null;

	return {
		id_dap_an: opt.id_dap_an,
		noi_dung: opt.noi_dung,
		thu_tu: opt.thu_tu,
		id_mau_gen: firstDiem?.id_mau_gen ?? 0,
		ten_mau: mauGen?.ten_mau ?? "",
		ma_hex: mauGen?.ma_hex ?? "#999999",
		ten_ma_gen: mauGen?.ten_ma_gen ?? "",
	};
}

export async function listAdminQuestions(): Promise<AdminQuestionRow[]> {
	const { data, error } = await getDb()
		.from("cau_hoi")
		.select(
			`
			id_cau_hoi,
			noi_dung,
			thu_tu,
			dang_bat,
			created_at,
			updated_at,
			dap_an (
				id_dap_an,
				noi_dung,
				thu_tu,
				is_deleted,
				diem_dap_an (
					id_mau_gen,
					mau_gen (
						id_mau_gen,
						ten_mau,
						ma_hex,
						ten_ma_gen
					)
				)
			)
		`
		)
		.eq("is_deleted", false)
		.order("thu_tu", { ascending: true })
		.order("id_cau_hoi", { ascending: true });

	if (error) throw error;

	return data.map((q) => {
		const rawOptions = (q.dap_an as unknown as RawOption[]) ?? [];
		const activeOptions = rawOptions
			.filter((opt) => !opt.is_deleted)
			.sort((a, b) => a.thu_tu - b.thu_tu || a.id_dap_an - b.id_dap_an)
			.map(parseQuestionOption);

		return {
			id_cau_hoi: q.id_cau_hoi,
			noi_dung: q.noi_dung,
			thu_tu: q.thu_tu,
			dang_bat: q.dang_bat,
			dap_an: activeOptions,
			created_at: q.created_at,
			updated_at: q.updated_at,
		};
	});
}

export async function getAdminQuestionDetail(id: number): Promise<AdminQuestionDetail | null> {
	const { data, error } = await getDb()
		.from("cau_hoi")
		.select(
			`
			id_cau_hoi,
			noi_dung,
			thu_tu,
			dang_bat,
			created_at,
			updated_at,
			dap_an (
				id_dap_an,
				noi_dung,
				thu_tu,
				is_deleted,
				diem_dap_an (
					id_mau_gen,
					mau_gen (
						id_mau_gen,
						ten_mau,
						ma_hex,
						ten_ma_gen
					)
				)
			)
		`
		)
		.eq("id_cau_hoi", id)
		.eq("is_deleted", false)
		.maybeSingle();

	if (error) throw error;
	if (!data) return null;

	const rawOptions = (data.dap_an as unknown as RawOption[]) ?? [];
	const activeOptions = rawOptions
		.filter((opt) => !opt.is_deleted)
		.sort((a, b) => a.thu_tu - b.thu_tu || a.id_dap_an - b.id_dap_an)
		.map(parseQuestionOption);

	return {
		id_cau_hoi: data.id_cau_hoi,
		noi_dung: data.noi_dung,
		thu_tu: data.thu_tu,
		dang_bat: data.dang_bat,
		dap_an: activeOptions,
		created_at: data.created_at,
		updated_at: data.updated_at,
	};
}
