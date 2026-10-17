import { NextResponse } from "next/server";
import { findStudent } from "@/features/auth/server/queries";
import { getActiveQuiz } from "@/features/quiz/server/queries";
import { getStudentSession } from "@/lib/session";

// Trả bộ đề đang bật cho sinh viên đã đăng nhập (không kèm mã gen/điểm của phương án)
export async function GET() {
	try {
		const session = await getStudentSession();
		if (!session) {
			return NextResponse.json({ message: "Chưa đăng nhập" }, { status: 401 });
		}

		const student = await findStudent(session.mssv);
		if (!student || student.bi_khoa) {
			return NextResponse.json({ message: "Tài khoản không hợp lệ" }, { status: 403 });
		}

		return NextResponse.json(await getActiveQuiz());
	} catch (error) {
		console.error("Lấy bộ đề trắc nghiệm thất bại:", error);
		return NextResponse.json({ message: "Lỗi hệ thống, vui lòng thử lại sau" }, { status: 500 });
	}
}
