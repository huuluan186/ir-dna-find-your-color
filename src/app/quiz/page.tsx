import { Suspense } from "react";
import { redirect } from "next/navigation";
import { StudentFrame } from "@/components/shared";
import { QuizScreen } from "@/components/student";
import { ROUTES } from "@/constants/routes";
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

// Chưa đăng nhập thì quay về màn chào
async function QuizGate() {
	if (!(await getStudentSession())) redirect(ROUTES.HOME);
	return <QuizScreen />;
}
