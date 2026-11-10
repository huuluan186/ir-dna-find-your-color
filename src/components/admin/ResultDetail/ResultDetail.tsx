"use client";

import { useMemo } from "react";
import { Text } from "@mantine/core";
import { useFormatter, useTranslations } from "next-intl";
import { AdminBadge } from "@/components/admin/AdminDataTable";
import { AdminFieldset, AdminReadonlyGrid } from "@/components/admin/AdminDetailModal";
import type { AdminColorRow, AdminResultRow } from "@/features/admin/types";
import type { ScoreKind } from "@/lib/scoring";
import classes from "./ResultDetail.module.css";

type ResultDetailProps = {
	result: AdminResultRow;
	colors: AdminColorRow[];
};

export function ResultDetail({ result, colors }: ResultDetailProps) {
	const t = useTranslations("admin");
	const format = useFormatter();

	const colorMap = useMemo(() => new Map(colors.map((c) => [c.id_mau_gen, c])), [colors]);

	const formatDate = (value: string) =>
		format.dateTime(new Date(value), { dateStyle: "medium", timeStyle: "short" });

	const kindLabel = (kind: ScoreKind) => {
		switch (kind) {
			case "don":
				return t("resultKindDon");
			case "ket_hop":
				return t("resultKindKetHop");
			case "dong_hang":
				return t("resultKindDongHang");
			case "da_sac":
				return t("resultKindDaSac");
		}
	};

	const topGenesText = useMemo(() => {
		if (result.loai_ket_qua === "da_sac") return t("resultKindDaSac");
		return result.top_mau_gen_ids
			.map((id) => {
				const c = colorMap.get(id);
				if (c) return `${c.ten_mau} – ${c.ten_ma_gen}`;
				const fallback = result.bang_xep_hang.find((r) => r.id_mau_gen === id);
				return fallback?.ten_mau ?? `#${id}`;
			})
			.join(" × ");
	}, [result, colorMap, t]);

	const { rankedItems, totalScore } = useMemo(() => {
		const pointMap = new Map(result.bang_xep_hang.map((r) => [r.id_mau_gen, r]));
		const items =
			colors.length > 0
				? colors.map((c) => ({
						id_mau_gen: c.id_mau_gen,
						ten_mau: c.ten_mau,
						ten_ma_gen: c.ten_ma_gen,
						ma_hex: c.ma_hex,
						diem: pointMap.get(c.id_mau_gen)?.diem ?? 0,
					}))
				: result.bang_xep_hang.map((r) => ({
						id_mau_gen: r.id_mau_gen,
						ten_mau: r.ten_mau,
						ten_ma_gen: "",
						ma_hex: "#1E4FA3",
						diem: r.diem,
					}));

		items.sort((a, b) => b.diem - a.diem);
		const sum = items.reduce((acc, item) => acc + item.diem, 0) || 12;
		return { rankedItems: items, totalScore: sum };
	}, [result.bang_xep_hang, colors]);

	const attemptValue = result.la_moi_nhat
		? `${t("attemptBadge", { count: result.lan_thu })} (${t("attemptLatestBadge")})`
		: t("attemptBadge", { count: result.lan_thu });

	return (
		<div className={classes.container}>
			<AdminFieldset legend={t("resultInfoLegend")}>
				<AdminReadonlyGrid
					cols={{ base: 1, sm: 2 }}
					fields={[
						{ label: t("colMssv"), value: result.mssv },
						{ label: t("colName"), value: result.ho_ten },
						{ label: t("colSubmittedAt"), value: formatDate(result.created_at) },
						{ label: t("colAttemptOrder"), value: attemptValue },
						{ label: t("colResultKind"), value: kindLabel(result.loai_ket_qua) },
						{ label: t("colTopGenes"), value: topGenesText },
					]}
				/>
			</AdminFieldset>

			<AdminFieldset legend={t("resultRankingLegend", { total: totalScore })}>
				<div className={classes.rankingList}>
					{rankedItems.map((item) => {
						const isTop = result.top_mau_gen_ids.includes(item.id_mau_gen);
						const pct =
							totalScore > 0 ? Math.min(100, Math.round((item.diem / totalScore) * 100)) : 0;

						return (
							<div key={item.id_mau_gen} className={classes.rankCard} data-top={isTop || undefined}>
								<div className={classes.rankTop}>
									<div className={classes.geneInfo}>
										<span className={classes.swatch} style={{ backgroundColor: item.ma_hex }} />
										<Text className={classes.geneTitle}>
											{item.ten_ma_gen ? `${item.ten_mau} – ${item.ten_ma_gen}` : item.ten_mau}
										</Text>
										{isTop && (
											<AdminBadge color="dna" size="xs">
												{t("resultTopTag")}
											</AdminBadge>
										)}
									</div>
									<Text className={classes.scoreText}>
										{t("resultScoreUnit", { score: item.diem, total: totalScore })}
									</Text>
								</div>

								<div className={classes.progressTrack}>
									<div
										className={classes.progressFill}
										style={{ width: `${pct}%`, backgroundColor: item.ma_hex }}
									/>
								</div>
							</div>
						);
					})}
				</div>
			</AdminFieldset>
		</div>
	);
}
