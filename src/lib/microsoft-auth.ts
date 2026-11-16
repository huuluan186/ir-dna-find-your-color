import "server-only";
import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { createRemoteJWKSet, jwtVerify, SignJWT } from "jose";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { SESSION, STUDENT_INPUT } from "@/constants/app";
import { normalizeName } from "@/features/auth/schema";

export type MicrosoftAuthErrorCode =
	| "not_configured"
	| "invalid_state"
	| "invalid_domain"
	| "invalid_profile"
	| "locked"
	| "oauth_failed";

export class MicrosoftAuthError extends Error {
	readonly code: MicrosoftAuthErrorCode;

	constructor(code: MicrosoftAuthErrorCode, message?: string) {
		super(message ?? code);
		this.code = code;
	}
}

const OAUTH_STATE_AUDIENCE = "ms-oauth-state";
const DEFAULT_ALLOWED_DOMAIN = "st.huflit.edu.vn";
const MICROSOFT_JWKS = createRemoteJWKSet(
	new URL("https://login.microsoftonline.com/common/discovery/v2.0/keys")
);

function getSessionSecret() {
	const secret = process.env.SESSION_SECRET;
	if (!secret || secret.length < 32) {
		throw new Error("SESSION_SECRET phải có ít nhất 32 ký tự.");
	}
	return new TextEncoder().encode(secret);
}

function getMicrosoftConfig() {
	const clientId = process.env.MICROSOFT_CLIENT_ID?.trim();
	const clientSecret = process.env.MICROSOFT_CLIENT_SECRET?.trim();
	const tenantId = process.env.MICROSOFT_TENANT_ID?.trim() || "common";
	const allowedDomain = (process.env.MICROSOFT_ALLOWED_DOMAIN || DEFAULT_ALLOWED_DOMAIN)
		.trim()
		.toLowerCase()
		.replace(/^@/, "");

	if (!clientId || !clientSecret) {
		throw new MicrosoftAuthError(
			"not_configured",
			"Thiếu MICROSOFT_CLIENT_ID hoặc MICROSOFT_CLIENT_SECRET."
		);
	}

	return { clientId, clientSecret, tenantId, allowedDomain };
}

export function getRequestOrigin(request: NextRequest) {
	const forwardedHost = request.headers.get("x-forwarded-host");
	const forwardedProto = request.headers.get("x-forwarded-proto") || "https";
	if (forwardedHost) {
		return `${forwardedProto}://${forwardedHost}`;
	}
	return request.nextUrl.origin;
}

export function getMicrosoftRedirectUri(request: NextRequest) {
	return new URL(API_ENDPOINTS.AUTH.MICROSOFT_CALLBACK, getRequestOrigin(request)).toString();
}

export async function createMicrosoftAuthorizeUrl(request: NextRequest) {
	const { clientId, tenantId, allowedDomain } = getMicrosoftConfig();
	const state = randomBytes(16).toString("hex");
	const nonce = randomBytes(16).toString("hex");

	const stateToken = await new SignJWT({ state, nonce })
		.setProtectedHeader({ alg: "HS256" })
		.setAudience(OAUTH_STATE_AUDIENCE)
		.setIssuedAt()
		.setExpirationTime(`${SESSION.OAUTH_STATE_MAX_AGE_SECONDS}s`)
		.sign(getSessionSecret());

	(await cookies()).set(SESSION.OAUTH_STATE_COOKIE, stateToken, {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax",
		path: "/",
		maxAge: SESSION.OAUTH_STATE_MAX_AGE_SECONDS,
	});

	const authorizeUrl = new URL(
		`https://login.microsoftonline.com/${encodeURIComponent(tenantId)}/oauth2/v2.0/authorize`
	);
	authorizeUrl.searchParams.set("client_id", clientId);
	authorizeUrl.searchParams.set("response_type", "code");
	authorizeUrl.searchParams.set("redirect_uri", getMicrosoftRedirectUri(request));
	authorizeUrl.searchParams.set("response_mode", "query");
	authorizeUrl.searchParams.set("scope", "openid profile email");
	authorizeUrl.searchParams.set("state", state);
	authorizeUrl.searchParams.set("nonce", nonce);
	authorizeUrl.searchParams.set("prompt", "select_account");
	if (allowedDomain) {
		authorizeUrl.searchParams.set("domain_hint", allowedDomain);
	}

	return authorizeUrl.toString();
}

async function consumeOAuthStateCookie(expectedState: string) {
	const cookieStore = await cookies();
	const token = cookieStore.get(SESSION.OAUTH_STATE_COOKIE)?.value;
	cookieStore.delete(SESSION.OAUTH_STATE_COOKIE);

	if (!token || !expectedState) {
		throw new MicrosoftAuthError("invalid_state");
	}

	try {
		const { payload } = await jwtVerify(token, getSessionSecret(), {
			audience: OAUTH_STATE_AUDIENCE,
		});
		if (payload.state !== expectedState || typeof payload.nonce !== "string") {
			throw new MicrosoftAuthError("invalid_state");
		}
		return payload.nonce;
	} catch (error) {
		if (error instanceof MicrosoftAuthError) throw error;
		throw new MicrosoftAuthError("invalid_state");
	}
}

function extractStudentProfile(
	payload: Record<string, unknown>,
	allowedDomain: string
): { mssv: string; ho_ten: string; email: string } {
	const rawEmail =
		(typeof payload.email === "string" && payload.email) ||
		(typeof payload.preferred_username === "string" && payload.preferred_username) ||
		(typeof payload.upn === "string" && payload.upn) ||
		"";

	const email = rawEmail.trim().toLowerCase();
	const atIndex = email.lastIndexOf("@");
	if (atIndex <= 0) {
		throw new MicrosoftAuthError("invalid_profile", "Không đọc được email từ tài khoản Microsoft.");
	}

	const localPart = email.slice(0, atIndex);
	const domain = email.slice(atIndex + 1);

	if (allowedDomain && domain !== allowedDomain) {
		throw new MicrosoftAuthError(
			"invalid_domain",
			`Email ${email} không thuộc tên miền ${allowedDomain}.`
		);
	}

	// Phần trước @ của mail sinh viên HUFLIT là MSSV (VD: 23dh110001@st.huflit.edu.vn -> 23DH110001)
	const mssv = localPart
		.toUpperCase()
		.replace(/[^A-Z0-9_-]/g, "")
		.slice(0, STUDENT_INPUT.MSSV_MAX_LENGTH);

	if (!STUDENT_INPUT.MSSV_PATTERN.test(mssv)) {
		throw new MicrosoftAuthError("invalid_profile", `Mã SV tách từ email không hợp lệ: ${mssv}`);
	}

	const rawName =
		(typeof payload.name === "string" && payload.name) ||
		[payload.family_name, payload.given_name]
			.filter((part): part is string => typeof part === "string" && part.trim().length > 0)
			.join(" ") ||
		mssv;

	// Bỏ tiền tố MSSV nếu tên hiển thị trên trường có dạng "23DH110001 - Nguyễn Văn A"
	const strippedName = rawName
		.replace(new RegExp(`^${mssv}\\s*[-–—:|]?\\s*`, "i"), "")
		.replace(/\s*[-–—:|]\s*$/, "")
		.trim();

	const ho_ten =
		normalizeName(strippedName || mssv).slice(0, STUDENT_INPUT.HO_TEN_MAX_LENGTH) || mssv;

	return { mssv, ho_ten, email };
}

export async function verifyMicrosoftCallback(
	request: NextRequest,
	code: string,
	state: string
): Promise<{ mssv: string; ho_ten: string; email: string }> {
	const { clientId, clientSecret, tenantId, allowedDomain } = getMicrosoftConfig();
	const expectedNonce = await consumeOAuthStateCookie(state);

	const tokenEndpoint = `https://login.microsoftonline.com/${encodeURIComponent(tenantId)}/oauth2/v2.0/token`;
	const body = new URLSearchParams({
		client_id: clientId,
		client_secret: clientSecret,
		code,
		redirect_uri: getMicrosoftRedirectUri(request),
		grant_type: "authorization_code",
	});

	const tokenResponse = await fetch(tokenEndpoint, {
		method: "POST",
		headers: { "Content-Type": "application/x-www-form-urlencoded" },
		body: body.toString(),
		cache: "no-store",
	});

	if (!tokenResponse.ok) {
		const errorText = await tokenResponse.text().catch(() => "");
		console.error("Đổi mã uỷ quyền Microsoft thất bại:", tokenResponse.status, errorText);
		throw new MicrosoftAuthError("oauth_failed");
	}

	const tokenData = (await tokenResponse.json()) as { id_token?: unknown };
	if (typeof tokenData.id_token !== "string") {
		throw new MicrosoftAuthError("oauth_failed", "Microsoft không trả về id_token.");
	}

	const { payload } = await jwtVerify(tokenData.id_token, MICROSOFT_JWKS, {
		audience: clientId,
	});

	if (payload.nonce !== expectedNonce) {
		throw new MicrosoftAuthError("invalid_state", "Nonce trong id_token không khớp.");
	}

	return extractStudentProfile(payload as Record<string, unknown>, allowedDomain);
}
