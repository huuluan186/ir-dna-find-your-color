import { Suspense } from "react";
import { redirect } from "next/navigation";
import { StudentFrame } from "@/components/shared";
import { QuizScreen } from "@/components/student";
import { ROUTES } from "@/constants/routes";
import { findStudent } from "@/features/auth/server/queries";
import { getStudentSession } from "@/lib/session";

// cacheComponents: đọc cookie phải nằm trong <Suspense>, khung trang vẫn prerender được
export default function QuizPage() {
	return (
		<StudentFrame>
			<Suspense fallback={null}>
				<QuizGate />
			</Suspense>
		</StudentFrame>
	);
}

// Chưa đăng nhập, hoặc tài khoản đã bị admin khoá/xoá sau khi đăng nhập, thì quay về màn chào
async function QuizGate() {
	const session = await getStudentSession();
	const student = session ? await findStudent(session.mssv) : null;
	if (!student || student.bi_khoa) redirect(ROUTES.HOME);
	return <QuizScreen />;
}
