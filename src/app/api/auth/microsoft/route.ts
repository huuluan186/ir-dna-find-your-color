import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { ROUTES } from "@/constants/routes";
import {
	createMicrosoftAuthorizeUrl,
	getRequestOrigin,
	MicrosoftAuthError,
} from "@/lib/microsoft-auth";

export async function GET(request: NextRequest) {
	await cookies();

	try {
		const authorizeUrl = await createMicrosoftAuthorizeUrl(request);
		return NextResponse.redirect(authorizeUrl);
	} catch (error) {
		console.error("Khởi tạo đăng nhập Microsoft thất bại:", error);
		const code = error instanceof MicrosoftAuthError ? error.code : "oauth_failed";
		const homeUrl = new URL(ROUTES.HOME, getRequestOrigin(request));
		homeUrl.searchParams.set("authError", code);
		return NextResponse.redirect(homeUrl);
	}
}
