import "server-only";
import { getDb } from "@/lib/db";

// Khoá/mở tài khoản sinh viên. Trả null nếu không có mã SV này.
export async function setStudentLocked(mssv: string, locked: boolean) {
	const { data, error } = await getDb()
		.from("sinh_vien")
		.update({ bi_khoa: locked, khoa_luc: locked ? new Date().toISOString() : null })
		.eq("mssv", mssv)
		.select("mssv, bi_khoa, khoa_luc")
		.maybeSingle();
	if (error) throw error;
	return data;
}
