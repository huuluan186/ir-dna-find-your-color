import { NextResponse } from "next/server";
import { deleteAdminResult } from "@/features/admin/server/mutations";
import { isAdmin } from "@/lib/session";

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
	if (!(await isAdmin())) return NextResponse.json({ message: "Chưa đăng nhập" }, { status: 401 });

	const id = Number((await params).id);
	if (!Number.isSafeInteger(id) || id <= 0) {
		return NextResponse.json({ message: "Không tìm thấy kết quả" }, { status: 404 });
	}

	try {
		const deleted = await deleteAdminResult(id);
		if (!deleted) {
			return NextResponse.json({ message: "Không tìm thấy kết quả" }, { status: 404 });
		}
		return NextResponse.json({ ok: true, id_ket_qua: id, message: "Đã xoá kết quả thành công" });
	} catch (error) {
		console.error("Xoá kết quả thất bại:", error);
		return NextResponse.json({ message: "Lỗi hệ thống, vui lòng thử lại sau" }, { status: 500 });
	}
}
