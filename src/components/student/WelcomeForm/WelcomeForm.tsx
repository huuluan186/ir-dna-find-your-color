"use client";

import { useState, useSyncExternalStore } from "react";
import { Button, Stack, Text } from "@mantine/core";
import { useTranslations } from "next-intl";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import classes from "./WelcomeForm.module.css";

const OAUTH_ERROR_KEYS: Record<string, string> = {
	invalid_domain: "microsoftDomainError",
	locked: "accountLocked",
	not_configured: "microsoftNotConfiguredError",
	invalid_state: "microsoftAuthError",
	invalid_profile: "microsoftAuthError",
	oauth_failed: "microsoftAuthError",
};

function MicrosoftIcon() {
	return (
		<svg width="18" height="18" viewBox="0 0 21 21" aria-hidden="true">
			<rect x="1" y="1" width="9" height="9" fill="#F25022" />
			<rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
			<rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
			<rect x="11" y="11" width="9" height="9" fill="#FFB900" />
		</svg>
	);
}

export function WelcomeForm() {
	const t = useTranslations("form");
	const [oauthErrorDismissed, setOauthErrorDismissed] = useState(false);
	const [redirectingMicrosoft, setRedirectingMicrosoft] = useState(false);

	const urlAuthError = useSyncExternalStore(
		() => () => {},
		() => new URLSearchParams(window.location.search).get("authError"),
		() => null
	);

	const oauthErrorKey =
		!oauthErrorDismissed && urlAuthError
			? (OAUTH_ERROR_KEYS[urlAuthError] ?? "microsoftAuthError")
			: null;

	function clearOauthError() {
		if (!urlAuthError && oauthErrorDismissed) return;
		setOauthErrorDismissed(true);
		const params = new URLSearchParams(window.location.search);
		if (!params.has("authError")) return;
		params.delete("authError");
		const nextQuery = params.toString();
		const nextUrl = `${window.location.pathname}${nextQuery ? `?${nextQuery}` : ""}`;
		window.history.replaceState(null, "", nextUrl);
	}

	function handleMicrosoftLogin() {
		clearOauthError();
		setRedirectingMicrosoft(true);
		window.location.assign(API_ENDPOINTS.AUTH.MICROSOFT);
	}

	return (
		<div className={classes.form}>
			<Stack gap="md">
				<div>
					<Text className={classes.formHeading}>{t("heading")}</Text>
					<Text className={classes.formHint}>{t("hint")}</Text>
				</div>

				<Button
					type="button"
					variant="default"
					fullWidth
					className={classes.microsoftButton}
					leftSection={<MicrosoftIcon />}
					loading={redirectingMicrosoft}
					onClick={handleMicrosoftLogin}
				>
					{t("microsoftButton")}
				</Button>

				{oauthErrorKey && (
					<Text className={classes.serverError} role="alert">
						{t(oauthErrorKey)}
					</Text>
				)}
			</Stack>
		</div>
	);
}
