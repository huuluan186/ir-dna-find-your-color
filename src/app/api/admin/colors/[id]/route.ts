import { NextResponse } from "next/server";
import { updateColorSchema } from "@/features/admin/schema";
import { deleteAdminColor, updateAdminColor } from "@/features/admin/server/mutations";
import { getAdminColorDetail } from "@/features/admin/server/queries";
import { isAdmin } from "@/lib/session";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
	if (!(await isAdmin())) return NextResponse.json({ message: "Chưa đăng nhập" }, { status: 401 });

	const id = Number((await params).id);
	if (!Number.isSafeInteger(id) || id <= 0) {
		return NextResponse.json({ message: "Không tìm thấy mã gen" }, { status: 404 });
	}

	try {
		const detail = await getAdminColorDetail(id);
		if (!detail) return NextResponse.json({ message: "Không tìm thấy mã gen" }, { status: 404 });
		return NextResponse.json(detail);
	} catch (error) {
		console.error("Lấy chi tiết mã gen thất bại:", error);
		return NextResponse.json({ message: "Lỗi hệ thống, vui lòng thử lại sau" }, { status: 500 });
	}
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
	if (!(await isAdmin())) return NextResponse.json({ message: "Chưa đăng nhập" }, { status: 401 });

	const id = Number((await params).id);
	if (!Number.isSafeInteger(id) || id <= 0) {
		return NextResponse.json({ message: "Không tìm thấy mã gen" }, { status: 404 });
	}

	const body = await request.json().catch(() => null);
	const parsed = updateColorSchema.safeParse(body);
	if (!parsed.success) {
		return NextResponse.json(
			{ message: "Dữ liệu không hợp lệ", errors: parsed.error.flatten().fieldErrors },
			{ status: 400 }
		);
	}

	try {
		const updated = await updateAdminColor(id, parsed.data);
		if (!updated) {
			return NextResponse.json({ message: "Không tìm thấy mã gen" }, { status: 404 });
		}
		return NextResponse.json({ ...updated, message: "Đã lưu thay đổi" });
	} catch (error) {
		if (error instanceof Error && error.message === "DUPLICATE_COLOR_NAME") {
			return NextResponse.json({ message: "Tên màu đã tồn tại trong hệ thống" }, { status: 400 });
		}
		if (error instanceof Error && error.message === "DUPLICATE_COLOR_HEX") {
			return NextResponse.json({ message: "Mã màu HEX đã tồn tại trong hệ thống" }, { status: 400 });
		}
		console.error("Cập nhật mã gen thất bại:", error);
		return NextResponse.json({ message: "Lỗi hệ thống, vui lòng thử lại sau" }, { status: 500 });
	}
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
	if (!(await isAdmin())) return NextResponse.json({ message: "Chưa đăng nhập" }, { status: 401 });

	const id = Number((await params).id);
	if (!Number.isSafeInteger(id) || id <= 0) {
		return NextResponse.json({ message: "Không tìm thấy mã gen" }, { status: 404 });
	}

	try {
		const deleted = await deleteAdminColor(id);
		if (!deleted) {
			return NextResponse.json({ message: "Không tìm thấy mã gen" }, { status: 404 });
		}
		return NextResponse.json({ ok: true, id_mau_gen: id, message: "Đã xoá mã gen thành công" });
	} catch (error) {
		console.error("Xoá mã gen thất bại:", error);
		return NextResponse.json({ message: "Lỗi hệ thống, vui lòng thử lại sau" }, { status: 500 });
	}
}
