"use client";

import { useState, type FormEvent } from "react";
import { Button, Stack, Text, TextInput } from "@mantine/core";
import { MOCK_SINH_VIEN } from "@/mock-data/student";
import classes from "./WelcomeForm.module.css";

export function WelcomeForm() {
	const [mssv, setMssv] = useState("");
	const [hoTen, setHoTen] = useState("");
	const [errors, setErrors] = useState<{ mssv?: string; hoTen?: string }>({});
	const [message, setMessage] = useState("");

	function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const normalizedMssv = mssv.trim();
		const normalizedHoTen = hoTen.trim();
		const nextErrors: typeof errors = {};

		if (!/^\d{6,15}$/.test(normalizedMssv)) {
			nextErrors.mssv = "Mã sinh viên gồm 6–15 chữ số.";
		}
		if (!normalizedHoTen) {
			nextErrors.hoTen = "Vui lòng nhập họ và tên.";
		}

		setErrors(nextErrors);
		setMessage("");
		if (Object.keys(nextErrors).length > 0) return;

		const sampleStudent = MOCK_SINH_VIEN.find((student) => student.mssv === normalizedMssv);
		const displayName = sampleStudent?.ho_ten ?? normalizedHoTen;
		setMessage(`Chào ${displayName}! Đây là bản thử nghiệm, thông tin chưa được lưu.`);
	}

	return (
		<form className={classes.form} noValidate onSubmit={handleSubmit}>
			<Stack gap="md">
				<div>
					<Text className={classes.formHeading}>Bắt đầu khám phá</Text>
					<Text className={classes.formHint}>Điền thông tin để tiếp tục.</Text>
				</div>

				<TextInput
					label="Mã số sinh viên"
					placeholder="Nhập mã sinh viên"
					inputMode="numeric"
					autoComplete="off"
					maxLength={15}
					required
					value={mssv}
					error={errors.mssv}
					onChange={(event) => {
						setMssv(event.currentTarget.value.replace(/\D/g, ""));
						setMessage("");
					}}
				/>

				<TextInput
					label="Họ và tên"
					placeholder="Nhập họ tên của bạn"
					autoComplete="name"
					maxLength={100}
					required
					value={hoTen}
					error={errors.hoTen}
					onChange={(event) => {
						setHoTen(event.currentTarget.value);
						setMessage("");
					}}
				/>

				<Button type="submit" fullWidth className={classes.submitButton}>
					Bắt đầu khám phá
				</Button>

				<Text className={classes.sampleHint}>
					Dữ liệu thử: <strong>2300001234</strong> · <strong>Nguyễn Văn A</strong>
				</Text>

				{message && (
					<Text className={classes.status} role="status">
						{message}
					</Text>
				)}
			</Stack>
		</form>
	);
}
