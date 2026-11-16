import { NextResponse, type NextRequest } from "next/server";
import { ROUTES } from "@/constants/routes";
import { registerStudent } from "@/features/auth/server/mutations";
import {
	getRequestOrigin,
	MicrosoftAuthError,
	type MicrosoftAuthErrorCode,
	verifyMicrosoftCallback,
} from "@/lib/microsoft-auth";
import { createStudentSession } from "@/lib/session";

export const dynamic = "force-dynamic";

function redirectWithAuthError(request: NextRequest, code: MicrosoftAuthErrorCode) {
	const homeUrl = new URL(ROUTES.HOME, getRequestOrigin(request));
	homeUrl.searchParams.set("authError", code);
	return NextResponse.redirect(homeUrl);
}

export async function GET(request: NextRequest) {
	const { searchParams } = request.nextUrl;
	const oauthError = searchParams.get("error");

	if (oauthError) {
		// Người dùng tự bấm huỷ trên màn hình Microsoft thì quay về trang chủ bình thường
		if (oauthError === "access_denied") {
			return NextResponse.redirect(new URL(ROUTES.HOME, getRequestOrigin(request)));
		}
		console.error("Microsoft trả lỗi OAuth:", oauthError, searchParams.get("error_description"));
		return redirectWithAuthError(request, "oauth_failed");
	}

	const code = searchParams.get("code") ?? "";
	const state = searchParams.get("state") ?? "";

	try {
		const profile = await verifyMicrosoftCallback(request, code, state);
		const student = await registerStudent({ mssv: profile.mssv, ho_ten: profile.ho_ten });

		if (student.bi_khoa) {
			return redirectWithAuthError(request, "locked");
		}

		await createStudentSession({ mssv: student.mssv, ho_ten: student.ho_ten });
		return NextResponse.redirect(new URL(ROUTES.QUIZ, getRequestOrigin(request)));
	} catch (error) {
		console.error("Xác thực callback Microsoft thất bại:", error);
		if (error instanceof MicrosoftAuthError) {
			return redirectWithAuthError(request, error.code);
		}
		return redirectWithAuthError(request, "oauth_failed");
	}
}
