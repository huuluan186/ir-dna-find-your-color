import "server-only";
import { cookies } from "next/headers";
import { jwtVerify, SignJWT } from "jose";
import { SESSION } from "@/constants/app";

// Phiên sinh viên (7 ngày) và admin (12 giờ): cookie httpOnly chứa JWT ký bằng SESSION_SECRET.
// Mỗi loại có audience riêng nên token sinh viên không dùng được làm token admin và ngược lại.

export type StudentSession = { mssv: string; ho_ten: string };

const AUDIENCE = { STUDENT: "student", ADMIN: "admin" } as const;

function getSecret() {
	const secret = process.env.SESSION_SECRET;
	if (!secret || secret.length < 32) {
		throw new Error("SESSION_SECRET phải có ít nhất 32 ký tự.");
	}
	return new TextEncoder().encode(secret);
}

async function setSessionCookie(name: string, token: string, maxAge: number) {
	(await cookies()).set(name, token, {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax",
		path: "/",
		maxAge,
	});
}

export async function createStudentSession(student: StudentSession) {
	const token = await new SignJWT({ ho_ten: student.ho_ten })
		.setProtectedHeader({ alg: "HS256" })
		.setSubject(student.mssv)
		.setAudience(AUDIENCE.STUDENT)
		.setIssuedAt()
		.setExpirationTime(`${SESSION.STUDENT_MAX_AGE_SECONDS}s`)
		.sign(getSecret());

	await setSessionCookie(SESSION.STUDENT_COOKIE, token, SESSION.STUDENT_MAX_AGE_SECONDS);
}

// Trả null nếu chưa đăng nhập, cookie hết hạn hoặc bị sửa
export async function getStudentSession(): Promise<StudentSession | null> {
	const token = (await cookies()).get(SESSION.STUDENT_COOKIE)?.value;
	if (!token) return null;

	try {
		const { payload } = await jwtVerify(token, getSecret(), { audience: AUDIENCE.STUDENT });
		if (!payload.sub || typeof payload.ho_ten !== "string") return null;
		return { mssv: payload.sub, ho_ten: payload.ho_ten };
	} catch {
		return null;
	}
}

export async function createAdminSession() {
	const token = await new SignJWT({})
		.setProtectedHeader({ alg: "HS256" })
		.setAudience(AUDIENCE.ADMIN)
		.setIssuedAt()
		.setExpirationTime(`${SESSION.ADMIN_MAX_AGE_SECONDS}s`)
		.sign(getSecret());

	await setSessionCookie(SESSION.ADMIN_COOKIE, token, SESSION.ADMIN_MAX_AGE_SECONDS);
}

export async function clearAdminSession() {
	(await cookies()).delete(SESSION.ADMIN_COOKIE);
}

// Dùng chung cho proxy.ts (đọc cookie từ request) và trang/API (đọc qua cookies())
export async function verifyAdminToken(token: string | undefined) {
	if (!token) return false;
	try {
		await jwtVerify(token, getSecret(), { audience: AUDIENCE.ADMIN });
		return true;
	} catch {
		return false;
	}
}

export async function isAdmin() {
	return verifyAdminToken((await cookies()).get(SESSION.ADMIN_COOKIE)?.value);
}
