"use client";

import { useState, type FormEvent } from "react";
import { Button, Stack, Text, TextInput } from "@mantine/core";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/routes";
import classes from "./WelcomeForm.module.css";

export function WelcomeForm() {
	const t = useTranslations("form");
	const [mssv, setMssv] = useState("");
	const [hoTen, setHoTen] = useState("");
	const [errors, setErrors] = useState<{ mssv?: boolean; hoTen?: boolean }>({});
	const router = useRouter();

	function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const normalizedMssv = mssv.trim();
		const normalizedHoTen = hoTen.trim();
		const nextErrors: typeof errors = {};

		if (!/^\d{6,15}$/.test(normalizedMssv)) {
			nextErrors.mssv = true;
		}
		if (!normalizedHoTen) {
			nextErrors.hoTen = true;
		}

		setErrors(nextErrors);
		if (Object.keys(nextErrors).length > 0) return;

		// ponytail: chưa lưu sinh viên, backend nối ở bước sau
		router.push(ROUTES.QUIZ);
	}

	return (
		<form className={classes.form} noValidate onSubmit={handleSubmit}>
			<Stack gap="md">
				<div>
					<Text className={classes.formHeading}>{t("heading")}</Text>
					<Text className={classes.formHint}>{t("hint")}</Text>
				</div>

				<div className={classes.fields}>
					<TextInput
						label={t("studentIdLabel")}
						placeholder={t("studentIdPlaceholder")}
						inputMode="numeric"
						autoComplete="off"
						maxLength={15}
						required
						value={mssv}
						error={errors.mssv ? t("studentIdError") : undefined}
						onChange={(event) => {
							setMssv(event.currentTarget.value.replace(/\D/g, ""));
						}}
					/>

					<TextInput
						label={t("nameLabel")}
						placeholder={t("namePlaceholder")}
						autoComplete="name"
						maxLength={100}
						required
						value={hoTen}
						error={errors.hoTen ? t("nameError") : undefined}
						onChange={(event) => {
							setHoTen(event.currentTarget.value);
						}}
					/>
				</div>

				<Button type="submit" fullWidth className={classes.submitButton}>
					{t("button")}
				</Button>

				<Text className={classes.sampleHint}>
					{t("sample")} <strong>2300001234</strong> · <strong>Nguyễn Văn A</strong>
				</Text>
			</Stack>
		</form>
	);
}
