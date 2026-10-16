import { NextResponse } from "next/server";
import { validateStudentLogin } from "@/features/auth/schema";
import { registerStudent } from "@/features/auth/server/mutations";
import { findStudent } from "@/features/auth/server/queries";
import { createStudentSession } from "@/lib/session";

// Bước 1 gửi { mssv }: đã có thì đăng nhập luôn, chưa có thì trả { need_name: true }.
// Bước 2 gửi { mssv, ho_ten }: thêm sinh viên (nếu đã có thì giữ họ tên cũ) rồi đăng nhập.
export async function POST(request: Request) {
	let body: unknown;
	try {
		body = await request.json();
	} catch {
		body = null;
	}

	const { data, errors } = validateStudentLogin(body);
	if (!data) return NextResponse.json({ errors }, { status: 400 });

	try {
		const student =
			data.ho_ten === undefined
				? await findStudent(data.mssv)
				: await registerStudent({ mssv: data.mssv, ho_ten: data.ho_ten });
		if (!student) return NextResponse.json({ need_name: true });
		// Tài khoản bị admin khoá: không tạo phiên
		if (student.bi_khoa) return NextResponse.json({ code: "locked" }, { status: 403 });

		const session = { mssv: student.mssv, ho_ten: student.ho_ten };
		await createStudentSession(session);
		return NextResponse.json(session);
	} catch (error) {
		console.error("Đăng nhập sinh viên thất bại:", error);
		return NextResponse.json({ message: "Lỗi hệ thống, vui lòng thử lại sau" }, { status: 500 });
	}
}
