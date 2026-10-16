import "server-only";
import { getDb } from "@/lib/db";

// Mã SV đã có thì giữ họ tên đã lưu; chưa có thì thêm mới. Upsert bỏ qua trùng để hai lần bấm cùng lúc không lỗi.
export async function registerStudent({ mssv, ho_ten }: { mssv: string; ho_ten: string }) {
	const { error: insertError } = await getDb()
		.from("sinh_vien")
		.upsert({ mssv, ho_ten }, { onConflict: "mssv", ignoreDuplicates: true });
	if (insertError) throw insertError;

	const { data, error } = await getDb()
		.from("sinh_vien")
		.select("mssv, ho_ten, bi_khoa")
		.eq("mssv", mssv)
		.single();
	if (error) throw error;

	return data;
}
