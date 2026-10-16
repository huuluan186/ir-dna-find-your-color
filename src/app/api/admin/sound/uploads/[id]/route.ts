import { NextResponse } from "next/server";
import { deleteMusic } from "@/features/sound/server/mutations";
import { isAdmin } from "@/lib/session";

export async function DELETE(
	_request: Request,
	{ params }: RouteContext<"/api/admin/sound/uploads/[id]">
) {
	if (!(await isAdmin())) return NextResponse.json({ message: "Chưa đăng nhập" }, { status: 401 });

	const id = Number((await params).id);
	if (!Number.isSafeInteger(id) || id <= 0) {
		return NextResponse.json({ code: "not_found" }, { status: 404 });
	}

	try {
		const result = await deleteMusic(id);
		if (!result.ok) {
			return NextResponse.json(
				{ code: result.code },
				{ status: result.code === "in_use" ? 409 : 404 }
			);
		}
		return NextResponse.json({ ok: true });
	} catch (error) {
		console.error("Xoá nhạc nền thất bại:", error);
		return NextResponse.json({ message: "Lỗi hệ thống, vui lòng thử lại sau" }, { status: 500 });
	}
}
