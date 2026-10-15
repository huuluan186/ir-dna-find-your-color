"use client";

import { useState } from "react";
import { Anchor, Button, Stack, Text, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { STUDENT_INPUT } from "@/constants/app";
import { ROUTES } from "@/constants/routes";
import { LoginValidationError } from "@/features/auth/client/api";
import { useLoginStudent } from "@/features/auth/client/hooks";
import { validateStudentLogin, type LoginErrorCode } from "@/features/auth/schema";
import classes from "./WelcomeForm.module.css";

const ERROR_KEYS: Record<LoginErrorCode, string> = {
	mssv_invalid: "studentIdError",
	ho_ten_required: "nameError",
	ho_ten_too_long: "nameTooLongError",
};

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

	const serverError = login.isError && !(login.error instanceof LoginValidationError) && (
		<Text className={classes.serverError} role="alert">
			{t("serverError")}
		</Text>
	);

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

				{/* key đổi theo bước để ô nhập mới trượt vào thay ô cũ */}
				<div key={step} className={classes.slide} data-back={goingBack || undefined}>
					{step === "mssv" ? (
						<TextInput
							{...form.getInputProps("mssv")}
							label={t("studentIdLabel")}
							placeholder={t("studentIdPlaceholder")}
							inputMode="numeric"
							autoComplete="off"
							maxLength={STUDENT_INPUT.MSSV_MAX_LENGTH}
							required
							autoFocus={goingBack}
							onChange={(event) =>
								form.setFieldValue("mssv", event.currentTarget.value.replace(/D/g, ""))
							}
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

				<Button type="submit" fullWidth className={classes.submitButton} loading={login.isPending}>
					{step === "name" ? t("button") : t("continue")}
				</Button>

				{step === "name" && (
					<Anchor component="button" type="button" size="sm" onClick={backToStudentId}>
						{t("changeStudentId")}
					</Anchor>
				)}

				{serverError}
			</Stack>
		</form>
	);
}
