import { NextResponse } from "next/server";
import { getPublicSound } from "@/features/sound/server/queries";

// Công khai: trang sinh viên (kể cả màn chào, chưa đăng nhập) cần biết nhạc nền đang dùng
export async function GET() {
	try {
		return NextResponse.json(await getPublicSound());
	} catch (error) {
		console.error("Lấy cài đặt âm thanh thất bại:", error);
		return NextResponse.json({ message: "Lỗi hệ thống, vui lòng thử lại sau" }, { status: 500 });
	}
}
