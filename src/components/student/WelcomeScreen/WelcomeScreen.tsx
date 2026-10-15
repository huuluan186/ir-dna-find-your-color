"use client";

import { Group, Stack, Text, Title } from "@mantine/core";
import { useTranslations } from "next-intl";
import { WelcomeForm } from "@/components/student/WelcomeForm";
import classes from "./WelcomeScreen.module.css";

export function WelcomeScreen() {
	const t = useTranslations("home");

	return (
		<div className={classes.screen}>
			<div className={classes.intro}>
				<Group className={classes.identity} gap={10} align="center">
					<span className={classes.brandMark} aria-hidden="true">
						<span />
						<span />
						<span />
					</span>
					<div>
						<Text className={classes.brand}>{t("brand")}</Text>
						<Text className={classes.station}>{t("station")}</Text>
					</div>
				</Group>

				<Stack className={classes.hero} gap="lg">
					<Text className={classes.eyebrow}>{t("eyebrow")}</Text>
					<Title order={1} className={classes.title}>
						{t("titleFirst")}
						<br />
						<span>{t("titleSecond")}</span>
					</Title>
					<Text className={classes.description}>{t("description")}</Text>
				</Stack>

				<div className={classes.formColumn}>
					<WelcomeForm />
				</div>
			</div>
		</div>
	);
}
