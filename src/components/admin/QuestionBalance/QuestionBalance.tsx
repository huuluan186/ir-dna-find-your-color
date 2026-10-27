"use client";

import { useMemo } from "react";
import { Badge, Group, Progress, Text } from "@mantine/core";
import { IconAlertCircle, IconCheck, IconScale } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import type { AdminColorRow, AdminQuestionRow } from "@/features/admin/types";
import classes from "./QuestionBalance.module.css";

type QuestionBalanceProps = {
	questions: AdminQuestionRow[];
	colors: AdminColorRow[];
};

export function QuestionBalance({ questions, colors }: QuestionBalanceProps) {
	const t = useTranslations("admin");

	const { stats, isBalanced, target, totalActiveQuestions, totalActiveOptions } = useMemo(() => {
		const activeQuestions = questions.filter((q) => q.dang_bat);
		const totalQuestions = activeQuestions.length;
		const totalOptions = activeQuestions.reduce((acc, q) => acc + q.dap_an.length, 0);
		const numColors = colors.length || 6;
		const targetPerColor = numColors > 0 ? Math.round(totalOptions / numColors) : 8;

		// Đếm số lần xuất hiện của từng mã gen
		const countMap = new Map<number, number>();
		for (const q of activeQuestions) {
			for (const opt of q.dap_an) {
				if (opt.id_mau_gen) {
					countMap.set(opt.id_mau_gen, (countMap.get(opt.id_mau_gen) ?? 0) + 1);
				}
			}
		}

		const colorStats = colors.map((c) => {
			const count = countMap.get(c.id_mau_gen) ?? 0;
			return {
				id_mau_gen: c.id_mau_gen,
				ten_mau: c.ten_mau,
				ma_hex: c.ma_hex,
				ten_ma_gen: c.ten_ma_gen,
				count,
				target: targetPerColor,
				diff: count - targetPerColor,
			};
		});

		const balanced =
			colorStats.length > 0 && colorStats.every((s) => s.count === targetPerColor && s.count > 0);

		return {
			stats: colorStats,
			isBalanced: balanced,
			target: targetPerColor,
			totalActiveQuestions: totalQuestions,
			totalActiveOptions: totalOptions,
		};
	}, [questions, colors]);

	if (colors.length === 0 || totalActiveQuestions === 0) return null;

	return (
		<div className={classes.card}>
			<div className={classes.header}>
				<div className={classes.titleGroup}>
					<IconScale size={18} />
					<Text className={classes.title}>{t("geneBalanceTitle")}</Text>
					<Badge
						variant="light"
						color={isBalanced ? "teal" : "yellow"}
						leftSection={isBalanced ? <IconCheck size={12} /> : <IconAlertCircle size={12} />}
						size="sm"
					>
						{isBalanced ? t("geneBalanceBalanced") : t("geneBalanceImbalanced")}
					</Badge>
				</div>
				<Text className={classes.hint}>
					{t("geneBalanceHint")} ({totalActiveQuestions} câu đang bật · {totalActiveOptions} phương
					án)
				</Text>
			</div>

			<div className={classes.grid}>
				{stats.map((item) => {
					const progressVal =
						target > 0 ? Math.min(100, Math.round((item.count / target) * 100)) : 0;
					const isExact = item.count === target;

					return (
						<div key={item.id_mau_gen} className={classes.tile}>
							<div className={classes.tileTop}>
								<span className={classes.swatch} style={{ backgroundColor: item.ma_hex }} />
								<Text className={classes.geneName} title={`${item.ten_mau} – ${item.ten_ma_gen}`}>
									{item.ten_mau}
								</Text>
							</div>

							<div className={classes.countGroup}>
								<Text
									className={classes.countNumber}
									c={isExact ? "teal" : item.count < target ? "orange" : "grape"}
								>
									{item.count}
								</Text>
								<Text className={classes.targetLabel}>/ {target}</Text>
							</div>

							<Progress
								value={progressVal}
								size="xs"
								radius="xl"
								color={isExact ? "teal" : item.count < target ? "orange" : "grape"}
							/>
						</div>
					);
				})}
			</div>
		</div>
	);
}
