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
		if (error instanceof Error && error.message === "DUPLICATE_COLOR_NAME") {
			return NextResponse.json({ message: "Tên màu đã tồn tại trong hệ thống" }, { status: 400 });
		}
		if (error instanceof Error && error.message === "DUPLICATE_COLOR_HEX") {
			return NextResponse.json(
				{ message: "Mã màu HEX đã tồn tại trong hệ thống" },
				{ status: 400 }
			);
		}
		console.error("Thêm mã gen thất bại:", error);
		return NextResponse.json({ message: "Lỗi hệ thống, vui lòng thử lại sau" }, { status: 500 });
	}
}
