import { NextResponse } from "next/server";
import { saveQuestionSchema } from "@/features/admin/schema";
import { createAdminQuestion } from "@/features/admin/server/mutations";
import { listAdminQuestions } from "@/features/admin/server/queries";
import { isAdmin } from "@/lib/session";

export async function GET(_request: Request) {
	if (!(await isAdmin())) return NextResponse.json({ message: "Chưa đăng nhập" }, { status: 401 });

	try {
		return NextResponse.json(await listAdminQuestions());
	} catch (error) {
		console.error("Lấy danh sách câu hỏi thất bại:", error);
		return NextResponse.json({ message: "Lỗi hệ thống, vui lòng thử lại sau" }, { status: 500 });
	}
}

export async function POST(request: Request) {
	if (!(await isAdmin())) return NextResponse.json({ message: "Chưa đăng nhập" }, { status: 401 });

	const body = await request.json().catch(() => null);
	const parsed = saveQuestionSchema.safeParse(body);
	if (!parsed.success) {
		return NextResponse.json(
			{ message: "Dữ liệu không hợp lệ", errors: parsed.error.flatten().fieldErrors },
			{ status: 400 }
		);
	}

	try {
		const created = await createAdminQuestion(parsed.data);
		return NextResponse.json({ ...created, message: "Thêm câu hỏi thành công" }, { status: 201 });
	} catch (error) {
		console.error("Thêm câu hỏi thất bại:", error);
		return NextResponse.json({ message: "Lỗi hệ thống, vui lòng thử lại sau" }, { status: 500 });
	}
}
