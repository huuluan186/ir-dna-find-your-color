import { Suspense } from "react";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { AdminSkeleton, StudentTable } from "@/components/admin";
import { QUERY_KEYS } from "@/constants/query-keys";
import { listStudents } from "@/features/admin/server/queries";
import { getQueryClient } from "@/lib/query-client";

export default function AdminStudentsPage() {
	return (
		<Suspense fallback={<AdminSkeleton variant="table" />}>
			<StudentsPrefetch />
		</Suspense>
	);
}

// Lấy sẵn danh sách ở server để trang hiện ngay, client dùng chung cache qua HydrationBoundary
async function StudentsPrefetch() {
	const queryClient = getQueryClient();
	await queryClient.prefetchQuery({ queryKey: QUERY_KEYS.ADMIN.STUDENTS, queryFn: listStudents });

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<StudentTable />
		</HydrationBoundary>
	);
}
