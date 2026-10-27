"use client";

import { useMemo, useState } from "react";
import {
	Button,
	Group,
	NumberInput,
	Select,
	Switch,
	Text,
	Textarea,
	TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconCheck, IconDeviceFloppy } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import {
	saveQuestionSchema,
	type QuestionOptionInput,
	type SaveQuestionInput,
} from "@/features/admin/schema";
import { useCreateAdminQuestion, useUpdateAdminQuestion } from "@/features/admin/client/hooks";
import type { AdminColorRow, AdminQuestionRow } from "@/features/admin/types";
import { showErrorToast, showSuccessToast } from "@/lib/toast";
import classes from "./QuestionEditor.module.css";

const LETTERS = ["A", "B", "C", "D", "E", "F"];

type QuestionEditorProps = {
	question?: AdminQuestionRow | null;
	colors: AdminColorRow[];
	defaultNextOrder?: number;
	onClose: () => void;
};

export function QuestionEditor({
	question,
	colors,
	defaultNextOrder = 1,
	onClose,
}: QuestionEditorProps) {
	const t = useTranslations("admin");
	const createQuestion = useCreateAdminQuestion();
	const updateQuestion = useUpdateAdminQuestion();
	const isEditing = Boolean(question);
	const isPending = createQuestion.isPending || updateQuestion.isPending;

	const [status, setStatus] = useState<{ tone: "ok" | "error"; text: string } | null>(null);

	// Tạo 4 phương án mẫu khi tạo mới, gán các mã gen khác nhau (1, 2, 3, 4)
	const initialOptions: QuestionOptionInput[] = useMemo(() => {
		if (question && question.dap_an.length > 0) {
			return question.dap_an.map((opt) => ({
				id_dap_an: opt.id_dap_an,
				noi_dung: opt.noi_dung,
				thu_tu: opt.thu_tu,
				id_mau_gen: opt.id_mau_gen,
			}));
		}

		return [0, 1, 2, 3].map((idx) => ({
			noi_dung: "",
			thu_tu: idx + 1,
			id_mau_gen: colors[idx]?.id_mau_gen ?? colors[0]?.id_mau_gen ?? 1,
		}));
	}, [question, colors]);

	const colorMap = useMemo(() => new Map(colors.map((c) => [c.id_mau_gen, c])), [colors]);

	const geneSelectData = useMemo(
		() =>
			colors.map((c) => ({
				value: String(c.id_mau_gen),
				label: `${c.ten_mau} – ${c.ten_ma_gen}`,
			})),
		[colors]
	);

	const form = useForm<SaveQuestionInput>({
		initialValues: {
			noi_dung: question?.noi_dung ?? "",
			thu_tu: question?.thu_tu ?? defaultNextOrder,
			dang_bat: question?.dang_bat ?? true,
			dap_an: initialOptions,
		},
		validate: (values) => {
			const res = saveQuestionSchema.safeParse(values);
			if (!res.success) {
				const fieldErrors = res.error.flatten().fieldErrors;
				const errors: Record<string, string> = {};
				if (fieldErrors.noi_dung?.[0]) errors.noi_dung = fieldErrors.noi_dung[0];
				if (fieldErrors.thu_tu?.[0]) errors.thu_tu = fieldErrors.thu_tu[0];
				if (fieldErrors.dap_an?.[0]) errors.dap_an = fieldErrors.dap_an[0];

				// Chi tiết lỗi từng phương án nếu có
				res.error.issues.forEach((issue) => {
					if (issue.path[0] === "dap_an" && typeof issue.path[1] === "number") {
						const optIdx = issue.path[1];
						const optField = issue.path[2];
						if (optField !== undefined) {
							errors[`dap_an.${optIdx}.${String(optField)}`] = issue.message;
						}
					}
				});

				return errors;
			}
			return {};
		},
	});

	function handleSubmit(values: SaveQuestionInput) {
		setStatus(null);

		if (question) {
			updateQuestion.mutate(
				{ id: question.id_cau_hoi, data: values },
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
			createQuestion.mutate(values, {
				onSuccess: (res) => {
					showSuccessToast((res as { message?: string })?.message ?? t("createQuestionSuccess"));
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
			<div className={classes.topGrid}>
				<NumberInput
					label={t("fieldQuestionOrder")}
					min={1}
					required
					withAsterisk
					{...form.getInputProps("thu_tu")}
				/>
				<Switch
					label={t("fieldQuestionStatus")}
					description={
						form.values.dang_bat ? t("statusActiveQuestion") : t("statusInactiveQuestion")
					}
					checked={form.values.dang_bat}
					onChange={(event) => form.setFieldValue("dang_bat", event.currentTarget.checked)}
					mt="xs"
				/>
			</div>

			<Textarea
				label={t("fieldQuestionContent")}
				placeholder="Nhập nội dung câu hỏi trắc nghiệm..."
				minRows={2}
				autosize
				required
				withAsterisk
				{...form.getInputProps("noi_dung")}
			/>

			<div className={classes.optionsSection}>
				<Text className={classes.sectionTitle}>{t("colOptions")} (4 phương án)</Text>

				{form.errors.dap_an && (
					<Text size="sm" c="red" fw={500}>
						{form.errors.dap_an}
					</Text>
				)}

				{form.values.dap_an.map((opt, idx) => {
					const letter = LETTERS[idx] ?? String(idx + 1);
					const currentGene = colorMap.get(opt.id_mau_gen);

					return (
						<div key={idx} className={classes.optionCard}>
							<div className={classes.optionHeader}>
								<div className={classes.letterBadge}>{letter}</div>
								<Text size="sm" fw={600}>
									{t("fieldOptionLabel", { letter })}
								</Text>
							</div>

							<div className={classes.optionGrid}>
								<TextInput
									placeholder="Nội dung phương án..."
									required
									withAsterisk
									{...form.getInputProps(`dap_an.${idx}.noi_dung`)}
								/>

								<Select
									placeholder={t("fieldOptionGenePlaceholder")}
									data={geneSelectData}
									value={String(opt.id_mau_gen)}
									onChange={(val) => {
										if (val) {
											form.setFieldValue(`dap_an.${idx}.id_mau_gen`, Number(val));
										}
									}}
									leftSection={
										currentGene ? (
											<span
												className={classes.swatch}
												style={{ backgroundColor: currentGene.ma_hex }}
											/>
										) : undefined
									}
									renderOption={({ option }) => {
										const g = colorMap.get(Number(option.value));
										return (
											<Group gap={8} wrap="nowrap">
												{g && (
													<span className={classes.swatch} style={{ backgroundColor: g.ma_hex }} />
												)}
												<Text size="sm">{option.label}</Text>
											</Group>
										);
									}}
									comboboxProps={{ withinPortal: true }}
									allowDeselect={false}
								/>
							</div>
						</div>
					);
				})}
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
					{isEditing ? t("save") : t("addQuestion")}
				</Button>
			</div>
		</form>
	);
}
