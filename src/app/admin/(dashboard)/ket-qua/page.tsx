import { Suspense } from "react";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { AdminSkeleton, ResultTable } from "@/components/admin";
import { QUERY_KEYS } from "@/constants/query-keys";
import { listAdminColors, listAdminResults } from "@/features/admin/server/queries";
import { getQueryClient } from "@/lib/query-client";

export default function AdminResultsPage() {
	return (
		<Suspense fallback={<AdminSkeleton variant="table" />}>
			<ResultsPrefetch />
		</Suspense>
	);
}

// Lấy sẵn danh sách kết quả và danh sách mã gen ở server để trang hiển thị tức thì
async function ResultsPrefetch() {
	const queryClient = getQueryClient();
	await Promise.all([
		queryClient.prefetchQuery({
			queryKey: QUERY_KEYS.ADMIN.RESULTS,
			queryFn: listAdminResults,
		}),
		queryClient.prefetchQuery({
			queryKey: QUERY_KEYS.ADMIN.COLORS,
			queryFn: listAdminColors,
		}),
	]);

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<ResultTable />
		</HydrationBoundary>
	);
}
