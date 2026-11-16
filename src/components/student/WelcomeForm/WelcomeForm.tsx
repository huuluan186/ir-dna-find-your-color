"use client";

import { useState, useSyncExternalStore } from "react";
import { Anchor, Button, Divider, Stack, Text, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { STUDENT_INPUT } from "@/constants/app";
import { ROUTES } from "@/constants/routes";
import { LoginValidationError } from "@/features/auth/client/api";
import { useLoginStudent } from "@/features/auth/client/hooks";
import { validateStudentLogin, type LoginErrorCode } from "@/features/auth/schema";
import { HttpError } from "@/lib/http";
import classes from "./WelcomeForm.module.css";

const ERROR_KEYS: Record<LoginErrorCode, string> = {
	mssv_invalid: "studentIdError",
	ho_ten_required: "nameError",
	ho_ten_too_long: "nameTooLongError",
};

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

// Server trả 403 khi admin đã khoá tài khoản
function isLockedError(error: unknown) {
	return error instanceof HttpError && error.status === 403;
}

// mssv: nhập mã SV → name: mã chưa có, nhập họ tên → confirm: mã đã có, chào và xác nhận
type Step = "mssv" | "name" | "confirm";

export function WelcomeForm() {
	const t = useTranslations("form");
	const router = useRouter();
	const login = useLoginStudent();
	const [step, setStep] = useState<Step>("mssv");
	const [studentName, setStudentName] = useState("");
	// Hướng trượt: tiến tới thì vào từ phải, quay lại thì vào từ trái
	const [goingBack, setGoingBack] = useState(false);
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

	// Bước 1 chỉ gửi mã SV; bước 2 gửi thêm họ tên
	function toPayload(values: { mssv: string; ho_ten: string }) {
		return step === "name" ? values : { mssv: values.mssv };
	}

	const form = useForm({
		initialValues: { mssv: "", ho_ten: "" },
		// Cùng bộ luật với server; lỗi là mã, dịch sang chữ ở đây
		validate: (values) => {
			const { errors } = validateStudentLogin(toPayload(values));
			return {
				mssv: errors.mssv ? t(ERROR_KEYS[errors.mssv]) : null,
				ho_ten: errors.ho_ten ? t(ERROR_KEYS[errors.ho_ten]) : null,
			};
		},
	});

	function handleSubmit(values: typeof form.values) {
		login.mutate(toPayload(values), {
			onSuccess: (data) => {
				setGoingBack(false);
				if ("need_name" in data) {
					setStep("name");
				} else if (step === "name") {
					router.push(ROUTES.QUIZ);
				} else {
					setStudentName(data.ho_ten);
					setStep("confirm");
				}
			},
			onError: (error) => {
				if (isLockedError(error)) {
					form.setErrors({ mssv: t("accountLocked") });
					return;
				}
				if (!(error instanceof LoginValidationError)) return;
				form.setErrors({
					mssv: error.errors.mssv ? t(ERROR_KEYS[error.errors.mssv]) : undefined,
					ho_ten: error.errors.ho_ten ? t(ERROR_KEYS[error.errors.ho_ten]) : undefined,
				});
			},
		});
	}

	function backToStudentId() {
		login.reset();
		form.setFieldValue("ho_ten", "");
		form.clearErrors();
		setGoingBack(true);
		setStep("mssv");
	}

	function handleMicrosoftLogin() {
		clearOauthError();
		setRedirectingMicrosoft(true);
		window.location.assign(API_ENDPOINTS.AUTH.MICROSOFT);
	}

	const errorMessage = oauthErrorKey
		? t(oauthErrorKey)
		: login.isError && !(login.error instanceof LoginValidationError) && !isLockedError(login.error)
			? t("serverError")
			: null;

	if (step === "confirm") {
		return (
			<div className={classes.form}>
				<Stack gap="md" className={classes.slide}>
					<div>
						<Text className={classes.greeting}>{t("greeting", { name: studentName })}</Text>
						<Text className={classes.formHint}>{t("confirmHint")}</Text>
					</div>
					<Button
						fullWidth
						className={classes.submitButton}
						onClick={() => router.push(ROUTES.QUIZ)}
					>
						{t("button")}
					</Button>
					<Anchor component="button" type="button" size="sm" onClick={backToStudentId}>
						{t("notYou")}
					</Anchor>
				</Stack>
			</div>
		);
	}

	return (
		<form className={classes.form} noValidate onSubmit={form.onSubmit(handleSubmit)}>
			<Stack gap="md">
				<div>
					<Text className={classes.formHeading}>{t("heading")}</Text>
					<Text className={classes.formHint}>
						{step === "name" ? t("newStudentHint") : t("hint")}
					</Text>
				</div>

				{step === "mssv" && (
					<>
						<Button
							type="button"
							variant="default"
							fullWidth
							className={classes.microsoftButton}
							leftSection={<MicrosoftIcon />}
							loading={redirectingMicrosoft}
							disabled={login.isPending}
							onClick={handleMicrosoftLogin}
						>
							{t("microsoftButton")}
						</Button>
						<Divider label={t("orDivider")} labelPosition="center" />
					</>
				)}

				{/* key đổi theo bước để ô nhập mới trượt vào thay ô cũ */}
				<div key={step} className={classes.slide} data-back={goingBack || undefined}>
					{step === "mssv" ? (
						<TextInput
							{...form.getInputProps("mssv")}
							label={t("studentIdLabel")}
							placeholder={t("studentIdPlaceholder")}
							autoCapitalize="characters"
							autoComplete="off"
							maxLength={STUDENT_INPUT.MSSV_MAX_LENGTH}
							required
							autoFocus={goingBack}
							onChange={(event) => {
								clearOauthError();
								form.setFieldValue("mssv", event.currentTarget.value.toUpperCase());
							}}
							onFocus={() => form.clearFieldError("mssv")}
						/>
					) : (
						<TextInput
							{...form.getInputProps("ho_ten")}
							label={t("nameLabel")}
							placeholder={t("namePlaceholder")}
							description={t("studentIdSummary", { mssv: form.values.mssv })}
							autoComplete="name"
							maxLength={STUDENT_INPUT.HO_TEN_MAX_LENGTH}
							required
							autoFocus
							onFocus={() => form.clearFieldError("ho_ten")}
						/>
					)}
				</div>

				<Button
					type="submit"
					fullWidth
					className={classes.submitButton}
					loading={login.isPending}
					disabled={redirectingMicrosoft}
				>
					{step === "name" ? t("button") : t("continue")}
				</Button>

				{step === "name" && (
					<Anchor component="button" type="button" size="sm" onClick={backToStudentId}>
						{t("changeStudentId")}
					</Anchor>
				)}

				{errorMessage && (
					<Text className={classes.serverError} role="alert">
						{errorMessage}
					</Text>
				)}
			</Stack>
		</form>
	);
}
