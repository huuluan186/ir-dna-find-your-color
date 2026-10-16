import { Suspense } from "react";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { AdminSkeleton, SoundSettings } from "@/components/admin";
import { QUERY_KEYS } from "@/constants/query-keys";
import { getAdminSound } from "@/features/sound/server/queries";
import { getQueryClient } from "@/lib/query-client";

export default function AdminSoundPage() {
	return (
		<Suspense fallback={<AdminSkeleton variant="detail" />}>
			<SoundPrefetch />
		</Suspense>
	);
}

// Lấy sẵn cài đặt và danh sách nhạc ở server, client dùng chung cache qua HydrationBoundary
async function SoundPrefetch() {
	const queryClient = getQueryClient();
	await queryClient.prefetchQuery({ queryKey: QUERY_KEYS.ADMIN.SOUND, queryFn: getAdminSound });

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<SoundSettings />
		</HydrationBoundary>
	);
}
