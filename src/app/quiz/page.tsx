import { redirect } from "next/navigation";
import { StudentFrame } from "@/components/shared";
import { QuizScreen } from "@/components/student";
import { ROUTES } from "@/constants/routes";
import { getStudentSession } from "@/lib/session";

export default async function QuizPage() {
	// Chưa đăng nhập thì quay về màn chào
	if (!(await getStudentSession())) redirect(ROUTES.HOME);

	return (
		<StudentFrame>
			<QuizScreen />
		</StudentFrame>
	);
}
