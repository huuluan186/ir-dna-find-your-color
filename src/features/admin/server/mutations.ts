import "server-only";
import { getDb } from "@/lib/db";
import { isSameHexColor } from "@/lib/color-name";
import type { SaveQuestionInput, UpdateColorInput } from "../schema";
import type { AdminColorDetail, AdminQuestionDetail } from "../types";
import { getAdminQuestionDetail } from "./queries";

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
	// Kiểm tra trùng tên màu hoặc mã màu với các mã gen khác đang hoạt động
	const { data: existing } = await getDb()
		.from("mau_gen")
		.select("id_mau_gen, ten_mau, ma_hex")
		.eq("is_deleted", false)
		.neq("id_mau_gen", id);

	if (existing && existing.length > 0) {
		const normTenMau = input.ten_mau.trim().toLowerCase();
		const normMaHex = input.ma_hex.trim().toUpperCase();

		const duplicateName = existing.find((c) => c.ten_mau.trim().toLowerCase() === normTenMau);
		if (duplicateName) {
			throw new Error("DUPLICATE_COLOR_NAME");
		}

		// Kiểm tra trùng mã hex tuyệt đối
		const duplicateHex = existing.find((c) => isSameHexColor(c.ma_hex, normMaHex));
		if (duplicateHex) {
			throw new Error("DUPLICATE_COLOR_HEX");
		}
	}

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
	// Kiểm tra trùng tên màu hoặc mã màu với các mã gen đang hoạt động
	const { data: existing } = await getDb()
		.from("mau_gen")
		.select("id_mau_gen, ten_mau, ma_hex")
		.eq("is_deleted", false);

	if (existing && existing.length > 0) {
		const normTenMau = input.ten_mau.trim().toLowerCase();
		const normMaHex = input.ma_hex.trim().toUpperCase();

		const duplicateName = existing.find((c) => c.ten_mau.trim().toLowerCase() === normTenMau);
		if (duplicateName) {
			throw new Error("DUPLICATE_COLOR_NAME");
		}

		// Kiểm tra trùng mã hex tuyệt đối
		const duplicateHex = existing.find((c) => isSameHexColor(c.ma_hex, normMaHex));
		if (duplicateHex) {
			throw new Error("DUPLICATE_COLOR_HEX");
		}
	}

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

// Thêm mới một câu hỏi kèm các phương án và gán mã gen (+1 điểm)
export async function createAdminQuestion(input: SaveQuestionInput): Promise<AdminQuestionDetail> {
	const db = getDb();

	// 1. Tạo câu hỏi
	const { data: qData, error: qError } = await db
		.from("cau_hoi")
		.insert({
			noi_dung: input.noi_dung,
			thu_tu: input.thu_tu,
			dang_bat: input.dang_bat,
		})
		.select("id_cau_hoi")
		.single();

	if (qError) throw qError;
	const id_cau_hoi = qData.id_cau_hoi;

	// 2. Thêm các phương án và điểm mã gen
	for (const opt of input.dap_an) {
		const { data: optData, error: optError } = await db
			.from("dap_an")
			.insert({
				id_cau_hoi,
				noi_dung: opt.noi_dung,
				thu_tu: opt.thu_tu,
			})
			.select("id_dap_an")
			.single();

		if (optError) throw optError;

		const { error: ptError } = await db.from("diem_dap_an").insert({
			id_dap_an: optData.id_dap_an,
			id_mau_gen: opt.id_mau_gen,
			diem: 1,
		});

		if (ptError) throw ptError;
	}

	const created = await getAdminQuestionDetail(id_cau_hoi);
	if (!created) {
		throw new Error("Không thể tải thông tin câu hỏi vừa tạo");
	}

	return created;
}

// Cập nhật câu hỏi và các phương án
export async function updateAdminQuestion(
	id: number,
	input: SaveQuestionInput
): Promise<AdminQuestionDetail | null> {
	const db = getDb();

	// 1. Cập nhật câu hỏi
	const { data: qData, error: qError } = await db
		.from("cau_hoi")
		.update({
			noi_dung: input.noi_dung,
			thu_tu: input.thu_tu,
			dang_bat: input.dang_bat,
			updated_at: new Date().toISOString(),
		})
		.eq("id_cau_hoi", id)
		.eq("is_deleted", false)
		.select("id_cau_hoi")
		.maybeSingle();

	if (qError) throw qError;
	if (!qData) return null;

	// 2. Lấy danh sách phương án hiện có trong DB
	const { data: existingOpts, error: exError } = await db
		.from("dap_an")
		.select("id_dap_an")
		.eq("id_cau_hoi", id)
		.eq("is_deleted", false);

	if (exError) throw exError;

	const existingIds = new Set((existingOpts ?? []).map((o) => o.id_dap_an));
	const incomingIds = new Set(
		input.dap_an.filter((o) => o.id_dap_an !== undefined).map((o) => o.id_dap_an as number)
	);

	// Soft-delete những phương án bị xoá khỏi form
	for (const exId of existingIds) {
		if (!incomingIds.has(exId)) {
			await db
				.from("dap_an")
				.update({ is_deleted: true, deleted_at: new Date().toISOString() })
				.eq("id_dap_an", exId);
		}
	}

	// Cập nhật hoặc thêm mới từng phương án
	for (const opt of input.dap_an) {
		if (opt.id_dap_an && existingIds.has(opt.id_dap_an)) {
			// Cập nhật phương án cũ
			const { error: uOptErr } = await db
				.from("dap_an")
				.update({
					noi_dung: opt.noi_dung,
					thu_tu: opt.thu_tu,
					updated_at: new Date().toISOString(),
				})
				.eq("id_dap_an", opt.id_dap_an);

			if (uOptErr) throw uOptErr;

			// Cập nhật điểm mã gen (upsert với conflict trên id_dap_an)
			const { error: ptErr } = await db.from("diem_dap_an").upsert(
				{
					id_dap_an: opt.id_dap_an,
					id_mau_gen: opt.id_mau_gen,
					diem: 1,
				},
				{ onConflict: "id_dap_an" }
			);

			if (ptErr) throw ptErr;
		} else {
			// Thêm phương án mới
			const { data: newOpt, error: nOptErr } = await db
				.from("dap_an")
				.insert({
					id_cau_hoi: id,
					noi_dung: opt.noi_dung,
					thu_tu: opt.thu_tu,
				})
				.select("id_dap_an")
				.single();

			if (nOptErr) throw nOptErr;

			const { error: ptErr } = await db.from("diem_dap_an").insert({
				id_dap_an: newOpt.id_dap_an,
				id_mau_gen: opt.id_mau_gen,
				diem: 1,
			});

			if (ptErr) throw ptErr;
		}
	}

	return getAdminQuestionDetail(id);
}

// Bật hoặc tắt trạng thái hoạt động của câu hỏi
export async function toggleAdminQuestionStatus(
	id: number,
	dang_bat: boolean
): Promise<{ id_cau_hoi: number; dang_bat: boolean } | null> {
	const { data, error } = await getDb()
		.from("cau_hoi")
		.update({
			dang_bat,
			updated_at: new Date().toISOString(),
		})
		.eq("id_cau_hoi", id)
		.eq("is_deleted", false)
		.select("id_cau_hoi, dang_bat")
		.maybeSingle();

	if (error) throw error;
	return data;
}

// Xoá mềm câu hỏi (is_deleted = true) và các phương án liên quan
export async function deleteAdminQuestion(id: number): Promise<{ id_cau_hoi: number } | null> {
	const db = getDb();
	const now = new Date().toISOString();

	const { data, error } = await db
		.from("cau_hoi")
		.update({
			is_deleted: true,
			deleted_at: now,
		})
		.eq("id_cau_hoi", id)
		.eq("is_deleted", false)
		.select("id_cau_hoi")
		.maybeSingle();

	if (error) throw error;
	if (!data) return null;

	// Soft-delete các phương án đi kèm
	await db
		.from("dap_an")
		.update({
			is_deleted: true,
			deleted_at: now,
		})
		.eq("id_cau_hoi", id)
		.eq("is_deleted", false);

	return data;
}
