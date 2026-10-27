import { Suspense } from "react";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { AdminSkeleton, QuestionTable } from "@/components/admin";
import { QUERY_KEYS } from "@/constants/query-keys";
import { listAdminColors, listAdminQuestions } from "@/features/admin/server/queries";
import { getQueryClient } from "@/lib/query-client";

export default function AdminQuestionsPage() {
	return (
		<Suspense fallback={<AdminSkeleton variant="table" />}>
			<QuestionsPrefetch />
		</Suspense>
	);
}

// Lấy sẵn danh sách câu hỏi và danh sách mã gen ở server để trang hiển thị tức thì
async function QuestionsPrefetch() {
	const queryClient = getQueryClient();
	await Promise.all([
		queryClient.prefetchQuery({
			queryKey: QUERY_KEYS.ADMIN.QUESTIONS,
			queryFn: listAdminQuestions,
		}),
		queryClient.prefetchQuery({
			queryKey: QUERY_KEYS.ADMIN.COLORS,
			queryFn: listAdminColors,
		}),
	]);

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<QuestionTable />
		</HydrationBoundary>
	);
}
