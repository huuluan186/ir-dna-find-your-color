"use client";

import { useState, type FormEvent } from "react";
import { Button, PasswordInput, Stack, Text, Title } from "@mantine/core";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/routes";
import { useLoginAdmin } from "@/features/auth/client/hooks";
import { HttpError } from "@/lib/http";
import classes from "./AdminLoginForm.module.css";

// Mã lỗi server (HTTP status) → khoá dịch
const ERROR_BY_STATUS: Record<number, string> = {
	400: "passwordRequired",
	401: "wrongPassword",
	429: "tooManyAttempts",
};

export function AdminLoginForm() {
	const t = useTranslations("admin");
	const router = useRouter();
	const login = useLoginAdmin();
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null);

	function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (!password) {
			setError(t("passwordRequired"));
			return;
		}
		login.mutate(password, {
			onSuccess: () => {
				router.replace(ROUTES.ADMIN.SINH_VIEN);
				router.refresh();
			},
			onError: (err) => {
				const key = err instanceof HttpError ? ERROR_BY_STATUS[err.status] : undefined;
				setError(t(key ?? "serverError"));
			},
		});
	}

	return (
		<form className={classes.card} noValidate onSubmit={handleSubmit}>
			<Stack gap="lg">
				<div>
					<Title order={1} className={classes.title}>
						{t("loginTitle")}
					</Title>
					<Text className={classes.hint}>{t("loginHint")}</Text>
				</div>
				<PasswordInput
					label={t("passwordLabel")}
					placeholder={t("passwordPlaceholder")}
					autoComplete="current-password"
					value={password}
					error={error}
					onChange={(event) => setPassword(event.currentTarget.value)}
					onFocus={() => setError(null)}
				/>
				<Button type="submit" fullWidth color="dark" loading={login.isPending}>
					{t("loginButton")}
				</Button>
			</Stack>
		</form>
	);
}
