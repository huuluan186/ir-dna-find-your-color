import "server-only";
import { cookies } from "next/headers";
import { jwtVerify, SignJWT } from "jose";
import { SESSION } from "@/constants/app";

// Phiên sinh viên: cookie httpOnly chứa JWT ký bằng SESSION_SECRET, sống 7 ngày.

export type StudentSession = { mssv: string; ho_ten: string };

function getSecret() {
	const secret = process.env.SESSION_SECRET;
	if (!secret || secret.length < 32) {
		throw new Error("SESSION_SECRET phải có ít nhất 32 ký tự.");
	}
	return new TextEncoder().encode(secret);
}

export async function createStudentSession(student: StudentSession) {
	const token = await new SignJWT({ ho_ten: student.ho_ten })
		.setProtectedHeader({ alg: "HS256" })
		.setSubject(student.mssv)
		.setIssuedAt()
		.setExpirationTime(`${SESSION.STUDENT_MAX_AGE_SECONDS}s`)
		.sign(getSecret());

	(await cookies()).set(SESSION.STUDENT_COOKIE, token, {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax",
		path: "/",
		maxAge: SESSION.STUDENT_MAX_AGE_SECONDS,
	});
}

// Trả null nếu chưa đăng nhập, cookie hết hạn hoặc bị sửa
export async function getStudentSession(): Promise<StudentSession | null> {
	const token = (await cookies()).get(SESSION.STUDENT_COOKIE)?.value;
	if (!token) return null;

	try {
		const { payload } = await jwtVerify(token, getSecret());
		if (!payload.sub || typeof payload.ho_ten !== "string") return null;
		return { mssv: payload.sub, ho_ten: payload.ho_ten };
	} catch {
		return null;
	}
}
