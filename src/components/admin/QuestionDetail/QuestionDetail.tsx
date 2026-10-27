"use client";

import { Badge, Text } from "@mantine/core";
import { useTranslations } from "next-intl";
import { AdminFieldset, AdminReadonlyGrid } from "@/components/admin/AdminDetailModal";
import type { AdminQuestionRow } from "@/features/admin/types";
import classes from "./QuestionDetail.module.css";

const LETTERS = ["A", "B", "C", "D", "E", "F"];

type QuestionDetailProps = {
	question: AdminQuestionRow;
};

export function QuestionDetail({ question }: QuestionDetailProps) {
	const t = useTranslations("admin");

	return (
		<div className={classes.container}>
			<AdminFieldset legend={t("fieldBasicInfo")}>
				<AdminReadonlyGrid
					cols={{ base: 1, sm: 2 }}
					fields={[
						{
							label: t("fieldQuestionOrder"),
							value: String(question.thu_tu),
						},
						{
							label: t("fieldQuestionStatus"),
							value: question.dang_bat ? t("statusActiveQuestion") : t("statusInactiveQuestion"),
						},
						{
							label: t("fieldQuestionContent"),
							value: question.noi_dung,
							multiline: true,
							fullWidth: true,
						},
					]}
				/>
			</AdminFieldset>

			<AdminFieldset legend={t("colOptions")}>
				<div className={classes.optionsList}>
					{question.dap_an.map((opt, idx) => {
						const letter = LETTERS[idx] ?? String(idx + 1);
						return (
							<div key={opt.id_dap_an} className={classes.optionCard}>
								<div className={classes.letterBadge}>{letter}</div>
								<div className={classes.optionBody}>
									<Text className={classes.optionText}>{opt.noi_dung}</Text>
									<div
										className={classes.genePill}
										style={{
											backgroundColor: `${opt.ma_hex}22`,
											color: opt.ma_hex,
											border: `1px solid ${opt.ma_hex}44`,
										}}
									>
										<span className={classes.geneSwatch} style={{ backgroundColor: opt.ma_hex }} />
										<span>
											{opt.ten_mau} – {opt.ten_ma_gen} (+1 điểm)
										</span>
									</div>
								</div>
							</div>
						);
					})}
				</div>
			</AdminFieldset>
		</div>
	);
}
