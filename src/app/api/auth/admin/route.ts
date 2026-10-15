import { createHash, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { ADMIN_LOGIN_LIMIT } from "@/constants/app";
import { adminLoginSchema } from "@/features/auth/schema";
import { clearAdminSession, createAdminSession } from "@/lib/session";

// ponytail: đếm lần sai trong bộ nhớ của từng instance serverless, chặn được dò mật khẩu nhanh
// nhưng không chia sẻ giữa các instance. Cần chặt hơn thì lưu đếm vào CSDL hoặc Upstash.
const failedAttempts = new Map<string, { count: number; resetAt: number }>();

function getClientIp(request: Request) {
	return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

function isLocked(ip: string) {
	const entry = failedAttempts.get(ip);
	if (!entry || entry.resetAt < Date.now()) return false;
	return entry.count >= ADMIN_LOGIN_LIMIT.MAX_ATTEMPTS;
}

function recordFailure(ip: string) {
	const now = Date.now();
	const entry = failedAttempts.get(ip);
	if (!entry || entry.resetAt < now) {
		failedAttempts.set(ip, { count: 1, resetAt: now + ADMIN_LOGIN_LIMIT.WINDOW_SECONDS * 1000 });
	} else {
		entry.count += 1;
	}
}

// So sánh qua băm SHA-256 để hai chuỗi cùng độ dài, timingSafeEqual không lộ độ dài mật khẩu
function passwordMatches(input: string, expected: string) {
	const hash = (value: string) => createHash("sha256").update(value).digest();
	return timingSafeEqual(hash(input), hash(expected));
}

export async function POST(request: Request) {
	const ip = getClientIp(request);
	if (isLocked(ip)) {
		return NextResponse.json({ code: "too_many_attempts" }, { status: 429 });
	}

	const parsed = adminLoginSchema.safeParse(await request.json().catch(() => null));
	if (!parsed.success) return NextResponse.json({ code: "password_required" }, { status: 400 });

	try {
		const expected = process.env.ADMIN_PASSWORD;
		if (!expected) throw new Error("Thiếu ADMIN_PASSWORD.");

		if (!passwordMatches(parsed.data.password, expected)) {
			recordFailure(ip);
			return NextResponse.json({ code: "wrong_password" }, { status: 401 });
		}

		failedAttempts.delete(ip);
		await createAdminSession();
		return NextResponse.json({ ok: true });
	} catch (error) {
		console.error("Đăng nhập admin thất bại:", error);
		return NextResponse.json({ message: "Lỗi hệ thống, vui lòng thử lại sau" }, { status: 500 });
	}
}

export async function DELETE() {
	await clearAdminSession();
	return NextResponse.json({ ok: true });
}
