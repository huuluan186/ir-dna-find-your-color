import { NextResponse } from "next/server";
import { listAdminResults } from "@/features/admin/server/queries";
import { isAdmin } from "@/lib/session";

export async function GET() {
	if (!(await isAdmin())) return NextResponse.json({ message: "Chưa đăng nhập" }, { status: 401 });

	try {
		return NextResponse.json(await listAdminResults());
	} catch (error) {
		console.error("Lấy danh sách kết quả thất bại:", error);
		return NextResponse.json({ message: "Lỗi hệ thống, vui lòng thử lại sau" }, { status: 500 });
	}
}
