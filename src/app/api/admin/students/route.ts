import { NextResponse } from "next/server";
import { listStudents } from "@/features/admin/server/queries";
import { isAdmin } from "@/lib/session";

export async function GET() {
	if (!(await isAdmin())) return NextResponse.json({ message: "Chưa đăng nhập" }, { status: 401 });

	try {
		return NextResponse.json(await listStudents());
	} catch (error) {
		console.error("Lấy danh sách sinh viên thất bại:", error);
		return NextResponse.json({ message: "Lỗi hệ thống, vui lòng thử lại sau" }, { status: 500 });
	}
}
