import { Suspense } from "react";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { redirect } from "next/navigation";
import { StudentFrame } from "@/components/shared";
import { ResultScreen } from "@/components/student";
import { QUERY_KEYS } from "@/constants/query-keys";
import { ROUTES } from "@/constants/routes";
import { findStudent } from "@/features/auth/server/queries";
import { getLatestQuizResult } from "@/features/quiz/server/queries";
import { getQueryClient } from "@/lib/query-client";
import { getStudentSession } from "@/lib/session";

// cacheComponents: đọc cookie phải nằm trong <Suspense>, khung trang vẫn prerender được
export default function ResultPage() {
	return (
		<StudentFrame>
			<Suspense fallback={null}>
				<ResultGate />
			</Suspense>
		</StudentFrame>
	);
}

// Chưa đăng nhập hoặc bị khoá thì về màn chào; chưa có kết quả nào thì sang màn làm bài
async function ResultGate() {
	const session = await getStudentSession();
	const student = session ? await findStudent(session.mssv) : null;
	if (!student || student.bi_khoa) redirect(ROUTES.HOME);

	const result = await getLatestQuizResult(student.mssv);
	if (!result) redirect(ROUTES.QUIZ);

	const queryClient = getQueryClient();
	queryClient.setQueryData(QUERY_KEYS.RESULT.LATEST, result);

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<ResultScreen />
		</HydrationBoundary>
	);
}
