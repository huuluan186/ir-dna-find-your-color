import { Stack, Text, Title } from "@mantine/core";
import { StudentFrame } from "@/components/shared/StudentFrame";
import { APP } from "@/constants/app";

// Màn chào tạm thời. Bước sau thay bằng form nhập mã SV.
export default function HomePage() {
	return (
		<StudentFrame>
			<Stack gap="xs" my="auto">
				<Text c="dna" fw={600} size="sm" tt="uppercase">
					Trạm 2 · IDENTITY
				</Text>
				<Title order={1}>{APP.NAME}</Title>
				<Text c="dimmed">{APP.DESCRIPTION}</Text>
			</Stack>
		</StudentFrame>
	);
}
