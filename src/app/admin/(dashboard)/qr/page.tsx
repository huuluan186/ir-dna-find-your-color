import { Suspense } from "react";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { AdminSkeleton, QrPanel } from "@/components/admin";
import { QUERY_KEYS } from "@/constants/query-keys";
import { listAdminColors } from "@/features/admin/server/queries";
import { getQueryClient } from "@/lib/query-client";

export default function AdminQrPage() {
	return (
		<Suspense fallback={<AdminSkeleton variant="detail" />}>
			<QrPrefetch />
		</Suspense>
	);
}

// Lấy sẵn danh sách mã gen ở server để bảng màu QR hiển thị tức thì
async function QrPrefetch() {
	const queryClient = getQueryClient();
	await queryClient.prefetchQuery({
		queryKey: QUERY_KEYS.ADMIN.COLORS,
		queryFn: listAdminColors,
	});

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<QrPanel />
		</HydrationBoundary>
	);
}
