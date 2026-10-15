import { Badge, Group, Stack, Text, Title } from "@mantine/core";
import { WelcomeForm } from "@/components/student/WelcomeForm";
import { StudentFrame } from "@/components/shared/StudentFrame";
import { MOCK_MAU_GEN } from "@/mock-data/quiz";
import classes from "./page.module.css";

export default function HomePage() {
	return (
		<StudentFrame>
			<div className={classes.screen}>
				<Group justify="right" align="center">
					<Badge className={classes.prototypeBadge} title="Bản mẫu">
						P
					</Badge>
				</Group>

				<Stack className={classes.hero} gap="md">
					<Text className={classes.eyebrow}>GIẢI MÃ BẢN SẮC CỦA BẠN</Text>
					<Title order={1} className={classes.title}>
						Tìm màu sắc
						<br />
						<span>trong bạn.</span>
					</Title>
					<Text className={classes.description}>
						Khám phá thế mạnh của bạn qua 12 câu hỏi ngắn.
					</Text>
					<Group className={classes.genes} gap={8} aria-label="Sáu mã gen màu sắc">
						{MOCK_MAU_GEN.map((gene) => (
							<span
								key={gene.id_mau_gen}
								className={classes.geneDot}
								style={{ backgroundColor: gene.ma_hex }}
								title={`${gene.ten_mau} · ${gene.ten_ma_gen}`}
							/>
						))}
						<Text className={classes.duration}>3–5 phút</Text>
					</Group>
				</Stack>

				<WelcomeForm />

				<Text className={classes.footer}>
					Kết quả là gợi ý để bạn khám phá bản thân, không phải nhãn tính cách cố định.
				</Text>
			</div>
		</StudentFrame>
	);
}
