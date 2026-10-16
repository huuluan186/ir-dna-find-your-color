import { NextResponse } from "next/server";
import { soundSettingsSchema } from "@/features/sound/schema";
import { saveSoundSettings } from "@/features/sound/server/mutations";
import { getAdminSound } from "@/features/sound/server/queries";
import { isAdmin } from "@/lib/session";

export async function GET() {
	if (!(await isAdmin())) return NextResponse.json({ message: "Chưa đăng nhập" }, { status: 401 });

	try {
		return NextResponse.json(await getAdminSound());
	} catch (error) {
		console.error("Lấy cài đặt âm thanh (admin) thất bại:", error);
		return NextResponse.json({ message: "Lỗi hệ thống, vui lòng thử lại sau" }, { status: 500 });
	}
}

export async function PUT(request: Request) {
	if (!(await isAdmin())) return NextResponse.json({ message: "Chưa đăng nhập" }, { status: 401 });

	const parsed = soundSettingsSchema.safeParse(await request.json().catch(() => null));
	if (!parsed.success) return NextResponse.json({ code: "invalid" }, { status: 400 });

	try {
		const result = await saveSoundSettings(parsed.data);
		if (!result.ok) return NextResponse.json({ code: result.code }, { status: 404 });
		return NextResponse.json(result.data);
	} catch (error) {
		console.error("Lưu cài đặt âm thanh thất bại:", error);
		return NextResponse.json({ message: "Lỗi hệ thống, vui lòng thử lại sau" }, { status: 500 });
	}
}
