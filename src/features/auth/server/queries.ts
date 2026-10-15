import "server-only";
import { db } from "@/lib/db";

// Trả null nếu mã SV chưa có trong CSDL
export async function findStudent(mssv: string) {
	const { data, error } = await db
		.from("sinh_vien")
		.select("mssv, ho_ten")
		.eq("mssv", mssv)
		.maybeSingle();
	if (error) throw error;
	return data;
}
