import { NextResponse } from "next/server";
import { questionStatusSchema } from "@/features/admin/schema";
import { toggleAdminQuestionStatus } from "@/features/admin/server/mutations";
import { isAdmin } from "@/lib/session";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
	if (!(await isAdmin())) return NextResponse.json({ message: "Chưa đăng nhập" }, { status: 401 });

	const id = Number((await params).id);
	if (!Number.isSafeInteger(id) || id <= 0) {
		return NextResponse.json({ message: "Không tìm thấy câu hỏi" }, { status: 404 });
	}

	const body = await request.json().catch(() => null);
	const parsed = questionStatusSchema.safeParse(body);
	if (!parsed.success) {
		return NextResponse.json(
			{ message: "Dữ liệu không hợp lệ", errors: parsed.error.flatten().fieldErrors },
			{ status: 400 }
		);
	}

	try {
		const updated = await toggleAdminQuestionStatus(id, parsed.data.dang_bat);
		if (!updated) {
			return NextResponse.json({ message: "Không tìm thấy câu hỏi" }, { status: 404 });
		}
		const message = parsed.data.dang_bat ? "Đã bật câu hỏi" : "Đã tạm ẩn câu hỏi";
		return NextResponse.json({ ...updated, message });
	} catch (error) {
		console.error("Đổi trạng thái câu hỏi thất bại:", error);
		return NextResponse.json({ message: "Lỗi hệ thống, vui lòng thử lại sau" }, { status: 500 });
	}
}
