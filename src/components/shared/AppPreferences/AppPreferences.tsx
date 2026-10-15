"use client";

import { useEffect, useState, type ReactNode } from "react";
import { ActionIcon, Group, SegmentedControl, Tooltip, useMantineColorScheme } from "@mantine/core";
import { IconMoon, IconSun } from "@tabler/icons-react";
import { NextIntlClientProvider, useTranslations } from "next-intl";
import enMessages from "@/messages/en.json";
import viMessages from "@/messages/vi.json";
import classes from "./AppPreferences.module.css";

type Locale = "vi" | "en";

function PreferencesContent({
	locale,
	setLocale,
	children,
}: {
	locale: Locale;
	setLocale: (locale: Locale) => void;
	children: ReactNode;
}) {
	const t = useTranslations("preferences");
	const { colorScheme, setColorScheme } = useMantineColorScheme();
	const isDark = colorScheme === "dark";
	const themeLabel = isDark ? t("switchToLight") : t("switchToDark");

	return (
		<>
			<div className={classes.toolbar}>
				<Group gap={8} wrap="nowrap">
					<span className={classes.srOnly}>{t("languageLabel")}</span>
					<SegmentedControl
						aria-label={t("languageLabel")}
						className={classes.language}
						size="xs"
						value={locale}
						data={[
							{ label: "VI", value: "vi" },
							{ label: "EN", value: "en" },
						]}
						onChange={(value) => setLocale(value as Locale)}
					/>
					<Tooltip label={themeLabel} withArrow>
						<ActionIcon
							aria-label={themeLabel}
							className={classes.themeButton}
							variant="default"
							size={34}
							radius="xl"
							onClick={() => setColorScheme(isDark ? "light" : "dark")}
						>
							{isDark ? <IconSun size={17} /> : <IconMoon size={17} />}
						</ActionIcon>
					</Tooltip>
				</Group>
			</div>
			{children}
		</>
	);
}

export function AppPreferencesProvider({ children }: { children: ReactNode }) {
	const [locale, setLocaleState] = useState<Locale>("vi");

	useEffect(() => {
		const storedLocale = window.localStorage.getItem("ir-dna-locale");
		if (storedLocale === "vi" || storedLocale === "en") setLocaleState(storedLocale);
	}, []);

	useEffect(() => {
		document.documentElement.lang = locale;
	}, [locale]);

	function setLocale(nextLocale: Locale) {
		setLocaleState(nextLocale);
		window.localStorage.setItem("ir-dna-locale", nextLocale);
	}

	return (
		<NextIntlClientProvider
			locale={locale}
			messages={locale === "vi" ? viMessages : enMessages}
		>
			<PreferencesContent locale={locale} setLocale={setLocale}>
				{children}
			</PreferencesContent>
		</NextIntlClientProvider>
	);
}
