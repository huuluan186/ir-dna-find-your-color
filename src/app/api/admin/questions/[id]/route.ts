import { NextResponse } from "next/server";
import { saveQuestionSchema } from "@/features/admin/schema";
import { deleteAdminQuestion, updateAdminQuestion } from "@/features/admin/server/mutations";
import { getAdminQuestionDetail } from "@/features/admin/server/queries";
import { isAdmin } from "@/lib/session";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
	if (!(await isAdmin())) return NextResponse.json({ message: "Chưa đăng nhập" }, { status: 401 });

	const id = Number((await params).id);
	if (!Number.isSafeInteger(id) || id <= 0) {
		return NextResponse.json({ message: "Không tìm thấy câu hỏi" }, { status: 404 });
	}

	try {
		const detail = await getAdminQuestionDetail(id);
		if (!detail) return NextResponse.json({ message: "Không tìm thấy câu hỏi" }, { status: 404 });
		return NextResponse.json(detail);
	} catch (error) {
		console.error("Lấy chi tiết câu hỏi thất bại:", error);
		return NextResponse.json({ message: "Lỗi hệ thống, vui lòng thử lại sau" }, { status: 500 });
	}
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
	if (!(await isAdmin())) return NextResponse.json({ message: "Chưa đăng nhập" }, { status: 401 });

	const id = Number((await params).id);
	if (!Number.isSafeInteger(id) || id <= 0) {
		return NextResponse.json({ message: "Không tìm thấy câu hỏi" }, { status: 404 });
	}

	const body = await request.json().catch(() => null);
	const parsed = saveQuestionSchema.safeParse(body);
	if (!parsed.success) {
		return NextResponse.json(
			{ message: "Dữ liệu không hợp lệ", errors: parsed.error.flatten().fieldErrors },
			{ status: 400 }
		);
	}

	try {
		const updated = await updateAdminQuestion(id, parsed.data);
		if (!updated) {
			return NextResponse.json({ message: "Không tìm thấy câu hỏi" }, { status: 404 });
		}
		return NextResponse.json({ ...updated, message: "Đã lưu thay đổi" });
	} catch (error) {
		console.error("Cập nhật câu hỏi thất bại:", error);
		return NextResponse.json({ message: "Lỗi hệ thống, vui lòng thử lại sau" }, { status: 500 });
	}
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
	if (!(await isAdmin())) return NextResponse.json({ message: "Chưa đăng nhập" }, { status: 401 });

	const id = Number((await params).id);
	if (!Number.isSafeInteger(id) || id <= 0) {
		return NextResponse.json({ message: "Không tìm thấy câu hỏi" }, { status: 404 });
	}

	try {
		const deleted = await deleteAdminQuestion(id);
		if (!deleted) {
			return NextResponse.json({ message: "Không tìm thấy câu hỏi" }, { status: 404 });
		}
		return NextResponse.json({ ok: true, id_cau_hoi: id, message: "Đã xoá câu hỏi thành công" });
	} catch (error) {
		console.error("Xoá câu hỏi thất bại:", error);
		return NextResponse.json({ message: "Lỗi hệ thống, vui lòng thử lại sau" }, { status: 500 });
	}
}
