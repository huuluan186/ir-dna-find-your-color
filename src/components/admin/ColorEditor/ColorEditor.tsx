"use client";

import { useState } from "react";
import { Button, ColorInput, TagsInput, Text, Textarea, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconCheck, IconDeviceFloppy } from "@tabler/icons-react";
import { useLocale, useTranslations } from "next-intl";
import { DNA_COLORS } from "@/constants/app";
import { updateColorSchema, type UpdateColorInput } from "@/features/admin/schema";
import { useCreateAdminColor, useUpdateAdminColor } from "@/features/admin/client/hooks";
import type { AdminColorRow } from "@/features/admin/types";
import { getLocalizedColorName } from "@/lib/color-name";
import { showErrorToast, showSuccessToast } from "@/lib/toast";
import classes from "./ColorEditor.module.css";

type ColorEditorProps = {
	color?: AdminColorRow | null;
	onClose: () => void;
};

export function ColorEditor({ color, onClose }: ColorEditorProps) {
	const t = useTranslations("admin");
	const locale = useLocale() as "vi" | "en";
	const updateColor = useUpdateAdminColor();
	const createColor = useCreateAdminColor();
	const isEditing = Boolean(color);
	const isPending = updateColor.isPending || createColor.isPending;

	const [status, setStatus] = useState<{ tone: "ok" | "error"; text: string } | null>(null);

	const form = useForm<UpdateColorInput>({
		initialValues: {
			ten_mau: color?.ten_mau ?? (locale === "en" ? "Blue" : "Xanh dương"),
			ma_hex: color?.ma_hex ?? "#1E4FA3",
			ten_ma_gen: color?.ten_ma_gen ?? "",
			tu_khoa: color?.tu_khoa ?? [],
			y_nghia: color?.y_nghia ?? "",
			linh_vuc: color?.linh_vuc ?? "",
			ky_nang: color?.ky_nang ?? "",
		},
		validate: (values) => {
			const res = updateColorSchema.safeParse(values);
			if (!res.success) {
				const fieldErrors = res.error.flatten().fieldErrors;
				return Object.fromEntries(
					Object.entries(fieldErrors).map(([key, msgs]) => [key, msgs?.[0] ?? null])
				);
			}
			return {};
		},
	});

	function handleSubmit(values: UpdateColorInput) {
		setStatus(null);

		if (color) {
			updateColor.mutate(
				{ id: color.id_mau_gen, data: values },
				{
					onSuccess: (res) => {
						showSuccessToast((res as { message?: string })?.message ?? t("saveSuccess"));
						onClose();
					},
					onError: (err) => {
						showErrorToast(err, t("saveError"));
						setStatus({ tone: "error", text: t("saveError") });
					},
				}
			);
		} else {
			createColor.mutate(values, {
				onSuccess: (res) => {
					showSuccessToast((res as { message?: string })?.message ?? t("createSuccess"));
					onClose();
				},
				onError: (err) => {
					showErrorToast(err, t("saveError"));
					setStatus({ tone: "error", text: t("saveError") });
				},
			});
		}
	}

	return (
		<form onSubmit={form.onSubmit(handleSubmit)} className={classes.form}>
			<div className={classes.grid3}>
				<ColorInput
					label={t("fieldColorHex")}
					format="hex"
					swatches={[...DNA_COLORS]}
					required
					withAsterisk
					{...form.getInputProps("ma_hex")}
					onChange={(val) => {
						form.getInputProps("ma_hex").onChange(val);
						const detectedName = getLocalizedColorName(val, locale);
						if (detectedName) {
							form.setFieldValue("ten_mau", detectedName);
						}
					}}
				/>
				<TextInput
					label={t("fieldColorName")}
					placeholder="VD: Đỏ"
					required
					withAsterisk
					{...form.getInputProps("ten_mau")}
				/>
				<TextInput
					label={t("fieldGeneName")}
					placeholder="VD: Người dẫn dắt"
					required
					withAsterisk
					{...form.getInputProps("ten_ma_gen")}
				/>
			</div>

			<TagsInput
				label={t("fieldKeywords")}
				placeholder={t("fieldKeywordsPlaceholder")}
				description={t("fieldKeywordsDescription")}
				maxTags={10}
				{...form.getInputProps("tu_khoa")}
			/>

			<Textarea
				label={t("fieldMeaning")}
				placeholder="Mô tả ý nghĩa và đặc trưng của mã gen..."
				minRows={3}
				autosize
				required
				withAsterisk
				{...form.getInputProps("y_nghia")}
			/>

			<div className={classes.grid}>
				<Textarea
					label={t("fieldFields")}
					placeholder="VD: Ngoại giao, chính sách quốc tế..."
					minRows={2}
					autosize
					{...form.getInputProps("linh_vuc")}
				/>
				<Textarea
					label={t("fieldSkills")}
					placeholder="VD: Đàm phán, lãnh đạo, tư duy chiến lược..."
					minRows={2}
					autosize
					{...form.getInputProps("ky_nang")}
				/>
			</div>

			<div className={classes.actions}>
				{status && (
					<Text className={classes.feedback} data-tone={status.tone}>
						{status.tone === "ok" ? (
							<IconCheck size={16} style={{ verticalAlign: "middle", marginRight: 4 }} />
						) : null}
						{status.text}
					</Text>
				)}
				<Button variant="default" onClick={onClose} disabled={isPending}>
					{t("cancel")}
				</Button>
				<Button type="submit" loading={isPending} leftSection={<IconDeviceFloppy size={18} />}>
					{isEditing ? t("save") : t("addColor")}
				</Button>
			</div>
		</form>
	);
}
