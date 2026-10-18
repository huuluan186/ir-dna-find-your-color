import { NextResponse } from "next/server";
import { findStudent } from "@/features/auth/server/queries";
import { submitQuizSchema } from "@/features/quiz/schema";
import { submitQuiz, SubmitQuizError } from "@/features/quiz/server/mutations";
import { getLatestQuizResult } from "@/features/quiz/server/queries";
import { getStudentSession } from "@/lib/session";

export async function GET() {
	try {
		const session = await getStudentSession();
		const student = session ? await findStudent(session.mssv) : null;
		if (!student) {
			return NextResponse.json({ message: "Chưa đăng nhập" }, { status: 401 });
		}
		if (student.bi_khoa) {
			return NextResponse.json(
				{ message: "Tài khoản đã bị khoá", code: "account_locked" },
				{ status: 403 }
			);
		}

		const result = await getLatestQuizResult(student.mssv);
		if (!result) {
			return NextResponse.json({ message: "Chưa có kết quả" }, { status: 404 });
		}
		return NextResponse.json(result);
	} catch (error) {
		console.error("Lấy kết quả trắc nghiệm thất bại:", error);
		return NextResponse.json({ message: "Lỗi hệ thống, vui lòng thử lại sau" }, { status: 500 });
	}
}

export async function POST(request: Request) {
	try {
		const session = await getStudentSession();
		if (!session) {
			return NextResponse.json(
				{ message: "Chưa đăng nhập", code: "unauthorized" },
				{ status: 401 }
			);
		}

		const body = await request.json().catch(() => null);
		const parsed = submitQuizSchema.safeParse(body);
		if (!parsed.success) {
			return NextResponse.json(
				{ message: "Dữ liệu nộp bài không hợp lệ", code: "invalid_submission" },
				{ status: 400 }
			);
		}

		const result = await submitQuiz(session.mssv, parsed.data.selected);
		return NextResponse.json(result);
	} catch (error) {
		if (error instanceof SubmitQuizError) {
			return NextResponse.json({ message: error.code, code: error.code }, { status: error.status });
		}
		console.error("Nộp bài trắc nghiệm thất bại:", error);
		return NextResponse.json({ message: "Lỗi hệ thống, vui lòng thử lại sau" }, { status: 500 });
	}
}
