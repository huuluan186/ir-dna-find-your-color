import { NextResponse } from "next/server";
import { updateColorSchema } from "@/features/admin/schema";
import { createAdminColor } from "@/features/admin/server/mutations";
import { listAdminColors } from "@/features/admin/server/queries";
import { isAdmin } from "@/lib/session";

export async function GET() {
	if (!(await isAdmin())) return NextResponse.json({ message: "Chưa đăng nhập" }, { status: 401 });

	try {
		return NextResponse.json(await listAdminColors());
	} catch (error) {
		console.error("Lấy danh sách mã gen thất bại:", error);
		return NextResponse.json({ message: "Lỗi hệ thống, vui lòng thử lại sau" }, { status: 500 });
	}
}

export async function POST(request: Request) {
	if (!(await isAdmin())) return NextResponse.json({ message: "Chưa đăng nhập" }, { status: 401 });

	const body = await request.json().catch(() => null);
	const parsed = updateColorSchema.safeParse(body);
	if (!parsed.success) {
		return NextResponse.json(
			{ message: "Dữ liệu không hợp lệ", errors: parsed.error.flatten().fieldErrors },
			{ status: 400 }
		);
	}

	try {
		const created = await createAdminColor(parsed.data);
		return NextResponse.json({ ...created, message: "Thêm mã gen thành công" }, { status: 201 });
	} catch (error) {
		console.error("Thêm mã gen thất bại:", error);
		return NextResponse.json({ message: "Lỗi hệ thống, vui lòng thử lại sau" }, { status: 500 });
	}
}
