import "server-only";
import { getDb } from "@/lib/db";
import type { UpdateColorInput } from "../schema";
import type { AdminColorDetail } from "../types";

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

// Cập nhật thông tin mã gen. Trả null nếu không tìm thấy mã gen.
export async function updateAdminColor(
	id: number,
	input: UpdateColorInput
): Promise<AdminColorDetail | null> {
	const { data, error } = await getDb()
		.from("mau_gen")
		.update({
			ten_mau: input.ten_mau,
			ma_hex: input.ma_hex.toUpperCase(),
			ten_ma_gen: input.ten_ma_gen,
			tu_khoa: input.tu_khoa,
			y_nghia: input.y_nghia,
			linh_vuc: input.linh_vuc,
			ky_nang: input.ky_nang,
			updated_at: new Date().toISOString(),
		})
		.eq("id_mau_gen", id)
		.eq("is_deleted", false)
		.select(
			"id_mau_gen, ten_mau, ma_hex, ten_ma_gen, tu_khoa, y_nghia, linh_vuc, ky_nang, thu_tu, created_at, updated_at"
		)
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

// Thêm mới một mã gen
export async function createAdminColor(input: UpdateColorInput): Promise<AdminColorDetail> {
	const { data: maxRow } = await getDb()
		.from("mau_gen")
		.select("thu_tu")
		.order("thu_tu", { ascending: false })
		.limit(1)
		.maybeSingle();
	const nextOrder = (maxRow?.thu_tu ?? 0) + 1;

	const { data, error } = await getDb()
		.from("mau_gen")
		.insert({
			ten_mau: input.ten_mau,
			ma_hex: input.ma_hex.toUpperCase(),
			ten_ma_gen: input.ten_ma_gen,
			tu_khoa: input.tu_khoa,
			y_nghia: input.y_nghia,
			linh_vuc: input.linh_vuc,
			ky_nang: input.ky_nang,
			thu_tu: nextOrder,
		})
		.select(
			"id_mau_gen, ten_mau, ma_hex, ten_ma_gen, tu_khoa, y_nghia, linh_vuc, ky_nang, thu_tu, created_at, updated_at"
		)
		.single();
	if (error) throw error;

	return {
		...data,
		tu_khoa: Array.isArray(data.tu_khoa) ? data.tu_khoa : [],
		y_nghia: data.y_nghia ?? "",
		linh_vuc: data.linh_vuc ?? "",
		ky_nang: data.ky_nang ?? "",
	};
}

// Xoá mềm mã gen (is_deleted = true). Trả null nếu không tìm thấy.
export async function deleteAdminColor(id: number): Promise<{ id_mau_gen: number } | null> {
	const { data, error } = await getDb()
		.from("mau_gen")
		.update({
			is_deleted: true,
			deleted_at: new Date().toISOString(),
		})
		.eq("id_mau_gen", id)
		.eq("is_deleted", false)
		.select("id_mau_gen")
		.maybeSingle();
	if (error) throw error;
	return data;
}
