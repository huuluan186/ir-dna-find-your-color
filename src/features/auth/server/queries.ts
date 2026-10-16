import "server-only";
import { getDb } from "@/lib/db";

// Trả null nếu mã SV chưa có trong CSDL
export async function findStudent(mssv: string) {
	const { data, error } = await getDb()
		.from("sinh_vien")
		.select("mssv, ho_ten, bi_khoa")
		.eq("mssv", mssv)
		.maybeSingle();
	if (error) throw error;
	return data;
}
