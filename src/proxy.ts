import { NextResponse, type NextRequest } from "next/server";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { SESSION } from "@/constants/app";
import { ROUTES } from "@/constants/routes";
import { verifyAdminToken } from "@/lib/session";

// Chặn sớm trang và API quản trị khi chưa có phiên admin. Route handler và trang vẫn tự kiểm tra lại.
export async function proxy(request: NextRequest) {
	const { pathname } = request.nextUrl;
	if (pathname === ROUTES.ADMIN.LOGIN) return NextResponse.next();

	const ok = await verifyAdminToken(request.cookies.get(SESSION.ADMIN_COOKIE)?.value);
	if (ok) return NextResponse.next();

	if (pathname.startsWith(`${API_ENDPOINTS.ROOT}/`)) {
		return NextResponse.json({ message: "Chưa đăng nhập" }, { status: 401 });
	}
	return NextResponse.redirect(new URL(ROUTES.ADMIN.LOGIN, request.url));
}

// matcher phải là chuỗi viết thẳng: Next đọc tĩnh lúc build, không nhận biến hay hằng số import.
// Giữ khớp với ROUTES.ADMIN.ROOT và API_ENDPOINTS.ADMIN.
export const config = {
	matcher: ["/admin/:path*", "/api/admin/:path*"],
};
