import { Suspense } from "react";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { AdminSkeleton, ColorTable } from "@/components/admin";
import { QUERY_KEYS } from "@/constants/query-keys";
import { listAdminColors } from "@/features/admin/server/queries";
import { getQueryClient } from "@/lib/query-client";

export default function AdminColorsPage() {
	return (
		<Suspense fallback={<AdminSkeleton variant="table" />}>
			<ColorsPrefetch />
		</Suspense>
	);
}

// Lấy sẵn danh sách mã gen ở server để trang hiện ngay, client dùng chung cache qua HydrationBoundary
async function ColorsPrefetch() {
	const queryClient = getQueryClient();
	await queryClient.prefetchQuery({
		queryKey: QUERY_KEYS.ADMIN.COLORS,
		queryFn: listAdminColors,
	});

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<ColorTable />
		</HydrationBoundary>
	);
}
