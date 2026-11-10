"use client";

import { useMemo, type CSSProperties } from "react";
import { Badge, SegmentedControl, Text, Tooltip, UnstyledButton } from "@mantine/core";
import { IconChartPie } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import type { AdminColorRow, AdminResultRow } from "@/features/admin/types";
import type { ScoreKind } from "@/lib/scoring";
import classes from "./ResultStats.module.css";

export type ResultScope = "latest" | "all";

type ResultStatsProps = {
	results: AdminResultRow[];
	colors: AdminColorRow[];
	scope: ResultScope;
	onScopeChange: (scope: ResultScope) => void;
	selectedGeneId: string | null;
	onSelectGeneId: (geneId: string | null) => void;
	selectedKind: string | null;
	onSelectKind: (kind: string | null) => void;
};

export function ResultStats({
	results,
	colors,
	scope,
	onScopeChange,
	selectedGeneId,
	onSelectGeneId,
	selectedKind,
	onSelectKind,
}: ResultStatsProps) {
	const t = useTranslations("admin");

	const { uniqueStudents, totalAttempts, colorStats, totalTopAppearances, kindCounts } =
		useMemo(() => {
			const latestRows = results.filter((r) => r.la_moi_nhat);
			const activeRows = scope === "latest" ? latestRows : results;
			const total = activeRows.length;

			const countByGene = new Map<number, number>();
			const byKind: Record<ScoreKind, number> = {
				don: 0,
				ket_hop: 0,
				dong_hang: 0,
				da_sac: 0,
			};

			for (const row of activeRows) {
				byKind[row.loai_ket_qua] = (byKind[row.loai_ket_qua] ?? 0) + 1;
				for (const geneId of row.top_mau_gen_ids) {
					countByGene.set(geneId, (countByGene.get(geneId) ?? 0) + 1);
				}
			}

			const stats = colors.map((c) => {
				const count = countByGene.get(c.id_mau_gen) ?? 0;
				const percent = total > 0 ? Math.round((count / total) * 100) : 0;
				return {
					id_mau_gen: c.id_mau_gen,
					ten_mau: c.ten_mau,
					ma_hex: c.ma_hex,
					ten_ma_gen: c.ten_ma_gen,
					count,
					percent,
				};
			});

			const sumAppearances = stats.reduce((acc, item) => acc + item.count, 0);

			return {
				uniqueStudents: latestRows.length,
				totalAttempts: results.length,
				colorStats: stats,
				totalTopAppearances: sumAppearances,
				kindCounts: byKind,
			};
		}, [results, colors, scope]);

	if (colors.length === 0) return null;

	const kindItems: { key: ScoreKind; label: string; count: number }[] = [
		{ key: "don", label: t("resultKindDonShort"), count: kindCounts.don },
		{ key: "ket_hop", label: t("resultKindKetHopShort"), count: kindCounts.ket_hop },
		{ key: "dong_hang", label: t("resultKindDongHangShort"), count: kindCounts.dong_hang },
		{ key: "da_sac", label: t("resultKindDaSacShort"), count: kindCounts.da_sac },
	];

	return (
		<div className={classes.card}>
			<div className={classes.header}>
				<div className={classes.titleGroup}>
					<IconChartPie size={18} />
					<Text className={classes.title}>{t("resultStatsTitle")}</Text>
					<Badge variant="light" color="dna" size="sm">
						{t("resultStatsStudentsBadge", { count: uniqueStudents })}
					</Badge>
					<Badge variant="light" color="gray" size="sm">
						{t("resultStatsAttemptsBadge", { count: totalAttempts })}
					</Badge>
				</div>

				<div className={classes.headerControls}>
					<SegmentedControl
						size="xs"
						className={classes.scopeControl}
						value={scope}
						onChange={(val) => onScopeChange(val as ResultScope)}
						data={[
							{ value: "latest", label: t("resultScopeLatest") },
							{ value: "all", label: t("resultScopeAll") },
						]}
					/>
				</div>
			</div>

			{totalTopAppearances > 0 && (
				<div className={classes.stackedBar}>
					{colorStats
						.filter((item) => item.count > 0)
						.map((item) => {
							const widthPercent = (item.count / totalTopAppearances) * 100;
							return (
								<Tooltip
									key={item.id_mau_gen}
									label={`${item.ten_mau} – ${item.ten_ma_gen}: ${item.count} (${item.percent}%)`}
									withArrow
								>
									<div
										className={classes.stackedSegment}
										style={{
											width: `${widthPercent}%`,
											backgroundColor: item.ma_hex,
										}}
										onClick={() => {
											const idStr = String(item.id_mau_gen);
											onSelectGeneId(selectedGeneId === idStr ? null : idStr);
										}}
									/>
								</Tooltip>
							);
						})}
				</div>
			)}

			<div className={classes.grid}>
				{colorStats.map((item) => {
					const idStr = String(item.id_mau_gen);
					const isActive = selectedGeneId === idStr;

					return (
						<UnstyledButton
							key={item.id_mau_gen}
							className={classes.tile}
							data-active={isActive || undefined}
							style={{ "--tile-accent": item.ma_hex } as CSSProperties}
							onClick={() => onSelectGeneId(isActive ? null : idStr)}
						>
							<div className={classes.tileTop}>
								<span className={classes.swatch} style={{ backgroundColor: item.ma_hex }} />
								<Text className={classes.geneName} title={`${item.ten_mau} – ${item.ten_ma_gen}`}>
									{item.ten_mau}
								</Text>
							</div>

							<div className={classes.countGroup}>
								<Text className={classes.countNumber}>{item.count}</Text>
								<Text className={classes.percentLabel}>{item.percent}%</Text>
							</div>

							<div className={classes.progressTrack}>
								<div
									className={classes.progressFill}
									style={{
										width: `${Math.min(100, item.percent)}%`,
										backgroundColor: item.ma_hex,
									}}
								/>
							</div>
						</UnstyledButton>
					);
				})}
			</div>

			<div className={classes.kindFooter}>
				<div className={classes.kindGroup}>
					{kindItems.map((k) => {
						const active = selectedKind === k.key;
						return (
							<UnstyledButton
								key={k.key}
								className={classes.kindPill}
								data-active={active || undefined}
								onClick={() => onSelectKind(active ? null : k.key)}
							>
								<span>{k.label}:</span>
								<span className={classes.kindCount}>{k.count}</span>
							</UnstyledButton>
						);
					})}
				</div>
				<Text className={classes.hint}>{t("resultStatsHint")}</Text>
			</div>
		</div>
	);
}
