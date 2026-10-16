import { NextResponse } from "next/server";
import { STUDENT_INPUT } from "@/constants/app";
import { studentLockSchema } from "@/features/admin/schema";
import { setStudentLocked } from "@/features/admin/server/mutations";
import { getStudentDetail } from "@/features/admin/server/queries";
import { isAdmin } from "@/lib/session";

export async function GET(
	_request: Request,
	{ params }: RouteContext<"/api/admin/students/[mssv]">
) {
	if (!(await isAdmin())) return NextResponse.json({ message: "Chưa đăng nhập" }, { status: 401 });

	const { mssv } = await params;
	if (!STUDENT_INPUT.MSSV_PATTERN.test(mssv)) {
		return NextResponse.json({ message: "Không tìm thấy sinh viên" }, { status: 404 });
	}

	try {
		const detail = await getStudentDetail(mssv);
		if (!detail) return NextResponse.json({ message: "Không tìm thấy sinh viên" }, { status: 404 });
		return NextResponse.json(detail);
	} catch (error) {
		console.error("Lấy chi tiết sinh viên thất bại:", error);
		return NextResponse.json({ message: "Lỗi hệ thống, vui lòng thử lại sau" }, { status: 500 });
	}
}

export async function PATCH(
	request: Request,
	{ params }: RouteContext<"/api/admin/students/[mssv]">
) {
	if (!(await isAdmin())) return NextResponse.json({ message: "Chưa đăng nhập" }, { status: 401 });

	const { mssv } = await params;
	if (!STUDENT_INPUT.MSSV_PATTERN.test(mssv)) {
		return NextResponse.json({ message: "Không tìm thấy sinh viên" }, { status: 404 });
	}
	const parsed = studentLockSchema.safeParse(await request.json().catch(() => null));
	if (!parsed.success)
		return NextResponse.json({ message: "Dữ liệu không hợp lệ" }, { status: 400 });

	try {
		const student = await setStudentLocked(mssv, parsed.data.bi_khoa);
		if (!student)
			return NextResponse.json({ message: "Không tìm thấy sinh viên" }, { status: 404 });
		return NextResponse.json(student);
	} catch (error) {
		console.error("Khoá/mở tài khoản sinh viên thất bại:", error);
		return NextResponse.json({ message: "Lỗi hệ thống, vui lòng thử lại sau" }, { status: 500 });
	}
}
