import { Skeleton, Stack } from "@mantine/core";
import classes from "./AdminSkeleton.module.css";

// Khung xương đúng hình trang thật trong lúc chờ dữ liệu, thay cho vòng xoay
export function AdminSkeleton({ variant }: { variant: "table" | "detail" }) {
	if (variant === "detail") {
		return (
			<Stack gap="lg" aria-busy="true">
				<Skeleton height={260} radius={8} />
			</Stack>
		);
	}

	return (
		<Stack gap={20} aria-busy="true">
			<Skeleton height={42} width={320} maw="100%" />
			<div className={classes.table}>
				{Array.from({ length: 8 }, (_, index) => (
					<Skeleton key={index} height={20} />
				))}
			</div>
		</Stack>
	);
}
