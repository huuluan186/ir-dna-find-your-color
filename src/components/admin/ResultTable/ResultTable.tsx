"use client";

import { useCallback, useMemo, useState } from "react";
import { Button, Group, Select, Text, Tooltip } from "@mantine/core";
import { IconDna2, IconDownload, IconFilter } from "@tabler/icons-react";
import { useFormatter, useTranslations } from "next-intl";
import {
	AdminBadge,
	AdminCellButton,
	AdminDataTable,
	adminTableClasses,
	type AdminColumn,
} from "@/components/admin/AdminDataTable";
import { AdminDetailModal, useDetailModal } from "@/components/admin/AdminDetailModal";
import { AdminRowStandardActions } from "@/components/admin/AdminRowActions";
import { ResultDetail } from "@/components/admin/ResultDetail";
import { ResultStats, type ResultScope } from "@/components/admin/ResultStats";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import {
	useAdminColors,
	useAdminResults,
	useDeleteAdminResult,
} from "@/features/admin/client/hooks";
import type { AdminResultRow } from "@/features/admin/types";
import type { ScoreKind } from "@/lib/scoring";
import { showErrorToast, showSuccessToast } from "@/lib/toast";
import classes from "./ResultTable.module.css";

type ResultColumnKey =
	"mssv" | "ho_ten" | "top_genes" | "loai_ket_qua" | "diem_6_gen" | "created_at";

const KIND_COLOR: Record<ScoreKind, string> = {
	don: "blue",
	ket_hop: "grape",
	dong_hang: "orange",
	da_sac: "teal",
};

export function ResultTable() {
	const t = useTranslations("admin");
	const format = useFormatter();
	const { data = [], isError, refetch } = useAdminResults();
	const { data: colors = [] } = useAdminColors();
	const deleteResult = useDeleteAdminResult();
	const detailModal = useDetailModal<AdminResultRow>();

	const [scope, setScope] = useState<ResultScope>("latest");
	const [geneFilter, setGeneFilter] = useState<string | null>(null);
	const [kindFilter, setKindFilter] = useState<string | null>(null);

	const colorMap = useMemo(() => new Map(colors.map((c) => [c.id_mau_gen, c])), [colors]);

	const formatDate = useCallback(
		(value: string) => format.dateTime(new Date(value), { dateStyle: "short", timeStyle: "short" }),
		[format]
	);

	const kindShortLabel = useCallback(
		(kind: ScoreKind) => {
			switch (kind) {
				case "don":
					return t("resultKindDonShort");
				case "ket_hop":
					return t("resultKindKetHopShort");
				case "dong_hang":
					return t("resultKindDongHangShort");
				case "da_sac":
					return t("resultKindDaSacShort");
			}
		},
		[t]
	);

	const geneFilterOptions = useMemo(
		() => [
			{ value: "", label: t("filterAllGenes") },
			...colors.map((c) => ({ value: String(c.id_mau_gen), label: c.ten_mau })),
		],
		[colors, t]
	);

	const kindFilterOptions = useMemo(
		() => [
			{ value: "", label: t("resultKindAll") },
			{ value: "don", label: t("resultKindDon") },
			{ value: "ket_hop", label: t("resultKindKetHop") },
			{ value: "dong_hang", label: t("resultKindDongHang") },
			{ value: "da_sac", label: t("resultKindDaSac") },
		],
		[t]
	);

	const selectedGene = useMemo(
		() => colors.find((c) => String(c.id_mau_gen) === geneFilter),
		[colors, geneFilter]
	);

	const filteredData = useMemo(() => {
		return data.filter((row) => {
			if (scope === "latest" && !row.la_moi_nhat) return false;
			if (kindFilter && row.loai_ket_qua !== kindFilter) return false;
			if (geneFilter && !row.top_mau_gen_ids.includes(Number(geneFilter))) return false;
			return true;
		});
	}, [data, scope, kindFilter, geneFilter]);

	function handleExportCsv() {
		const params = new URLSearchParams();
		params.set("scope", scope);
		if (geneFilter) params.set("geneId", geneFilter);
		if (kindFilter) params.set("kind", kindFilter);
		const link = document.createElement("a");
		link.href = `${API_ENDPOINTS.ADMIN.EXPORT}?${params.toString()}`;
		link.download = "";
		document.body.appendChild(link);
		link.click();
		link.remove();
	}

	const columns = useMemo<AdminColumn<AdminResultRow, ResultColumnKey>[]>(
		() => [
			{
				key: "mssv",
				label: t("colMssv"),
				sortValue: (row) => row.mssv,
				render: (row) => (
					<AdminCellButton onClick={() => detailModal.open(row)}>{row.mssv}</AdminCellButton>
				),
			},
			{
				key: "ho_ten",
				label: t("colName"),
				sortValue: (row) => row.ho_ten,
				render: (row) => (
					<div className={classes.nameCell}>
						<span className={adminTableClasses.name}>{row.ho_ten}</span>
						{(row.lan_thu > 1 || !row.la_moi_nhat) && (
							<span className={classes.attemptTag}>
								{t("attemptBadge", { count: row.lan_thu })}
							</span>
						)}
					</div>
				),
			},
			{
				key: "top_genes",
				label: t("colTopGenes"),
				sortValue: (row) => {
					const firstId = row.top_mau_gen_ids[0];
					return colorMap.get(firstId)?.thu_tu ?? firstId ?? 99;
				},
				render: (row) => {
					if (row.loai_ket_qua === "da_sac") {
						return <AdminBadge color="teal">{t("resultKindDaSacShort")}</AdminBadge>;
					}
					return (
						<div className={classes.genesCell}>
							{row.top_mau_gen_ids.map((id) => {
								const c = colorMap.get(id);
								const hex = c?.ma_hex ?? "#1E4FA3";
								const name =
									c?.ten_mau ??
									row.bang_xep_hang.find((r) => r.id_mau_gen === id)?.ten_mau ??
									`#${id}`;
								const tooltipLabel = c ? `${c.ten_mau} – ${c.ten_ma_gen}` : name;

								return (
									<Tooltip key={id} label={tooltipLabel} withArrow>
										<span
											className={classes.geneBadge}
											style={{
												backgroundColor: `${hex}1a`,
												borderColor: `${hex}55`,
											}}
										>
											<span className={classes.swatchDot} style={{ backgroundColor: hex }} />
											{name}
										</span>
									</Tooltip>
								);
							})}
						</div>
					);
				},
			},
			{
				key: "loai_ket_qua",
				label: t("colResultKind"),
				nowrap: true,
				sortValue: (row) => row.top_mau_gen_ids.length,
				render: (row) => (
					<AdminBadge color={KIND_COLOR[row.loai_ket_qua]}>
						{kindShortLabel(row.loai_ket_qua)}
					</AdminBadge>
				),
			},
			{
				key: "diem_6_gen",
				label: t("colScoreMap"),
				render: (row) => {
					const pointMap = new Map(row.bang_xep_hang.map((r) => [r.id_mau_gen, r.diem]));
					const items =
						colors.length > 0
							? colors.map((c) => ({
									id: c.id_mau_gen,
									name: c.ten_mau,
									title: c.ten_ma_gen,
									hex: c.ma_hex,
									diem: pointMap.get(c.id_mau_gen) ?? 0,
								}))
							: row.bang_xep_hang.map((r) => ({
									id: r.id_mau_gen,
									name: r.ten_mau,
									title: "",
									hex: "#1E4FA3",
									diem: r.diem,
								}));

					return (
						<div className={classes.scoresCell}>
							{items.map((item) => {
								const isTop = row.top_mau_gen_ids.includes(item.id);
								return (
									<Tooltip
										key={item.id}
										label={`${item.name}${item.title ? ` – ${item.title}` : ""}: ${item.diem}/12`}
										withArrow
									>
										<span className={classes.scorePill} data-top={isTop || undefined}>
											<span className={classes.swatchDot} style={{ backgroundColor: item.hex }} />
											{item.diem}
										</span>
									</Tooltip>
								);
							})}
						</div>
					);
				},
			},
			{
				key: "created_at",
				label: t("colSubmittedAt"),
				nowrap: true,
				sortValue: (row) => row.created_at,
				className: adminTableClasses.muted,
				render: (row) => formatDate(row.created_at),
			},
		],
		[t, colorMap, colors, formatDate, kindShortLabel, detailModal]
	);

	return (
		<>
			<ResultStats
				results={data}
				colors={colors}
				scope={scope}
				onScopeChange={setScope}
				selectedGeneId={geneFilter}
				onSelectGeneId={setGeneFilter}
				selectedKind={kindFilter}
				onSelectKind={setKindFilter}
			/>

			<AdminDataTable
				data={filteredData}
				getRowKey={(row) => row.id_ket_qua}
				columns={columns}
				defaultSort={{ key: "created_at", direction: "desc" }}
				searchPlaceholder={t("searchPlaceholderResults")}
				searchFields={(row) => [
					row.mssv,
					row.ho_ten,
					kindShortLabel(row.loai_ket_qua),
					...row.top_mau_gen_ids.flatMap((id) => {
						const c = colorMap.get(id);
						return c ? [c.ten_mau, c.ten_ma_gen] : [];
					}),
				]}
				rowProps={(row) => ({ "data-locked": row.bi_khoa || undefined })}
				filters={
					<div className={classes.filtersGroup}>
						<Select
							data={geneFilterOptions}
							value={geneFilter ?? ""}
							onChange={(val) => setGeneFilter(val || null)}
							placeholder={t("filterGenePlaceholder")}
							aria-label={t("filterGenePlaceholder")}
							title={t("filterGenePlaceholder")}
							leftSection={
								selectedGene ? (
									<span
										className={classes.swatchDot}
										style={{ backgroundColor: selectedGene.ma_hex, width: 10, height: 10 }}
									/>
								) : (
									<IconDna2 size={14} />
								)
							}
							renderOption={({ option }) => {
								const g = colors.find((c) => String(c.id_mau_gen) === option.value);
								return (
									<Group gap={8} wrap="nowrap">
										{g && (
											<span
												className={classes.swatchDot}
												style={{ backgroundColor: g.ma_hex, width: 10, height: 10 }}
											/>
										)}
										<Text size="sm">{option.label}</Text>
									</Group>
								);
							}}
							w={170}
							size="sm"
							allowDeselect={false}
							comboboxProps={{ withinPortal: true }}
						/>
						<Select
							data={kindFilterOptions}
							value={kindFilter ?? ""}
							onChange={(val) => setKindFilter(val || null)}
							placeholder={t("filterByKind")}
							aria-label={t("filterByKind")}
							title={t("filterByKind")}
							leftSection={<IconFilter size={14} />}
							w={195}
							size="sm"
							allowDeselect={false}
							comboboxProps={{ withinPortal: true }}
						/>
					</div>
				}
				actions={
					<Tooltip label={t("exportCsvTooltip")} withArrow>
						<Button
							size="sm"
							variant="default"
							leftSection={<IconDownload size={16} />}
							disabled={filteredData.length === 0}
							onClick={handleExportCsv}
						>
							{t("exportCsv")}
						</Button>
					</Tooltip>
				}
				isError={isError}
				onRetry={() => refetch()}
				emptyText={t("emptyResults")}
				renderActions={(row) => (
					<AdminRowStandardActions
						onView={() => detailModal.open(row)}
						viewLabel={t("viewDetail")}
						onDelete={() =>
							deleteResult.mutate(row.id_ket_qua, {
								onSuccess: (res) => {
									showSuccessToast(res.message ?? t("deleteResultSuccess"));
								},
								onError: (err) => {
									showErrorToast(err, t("saveError"));
								},
							})
						}
						deleteLabel={t("deleteResult")}
						deleteConfirmText={t("deleteConfirmResult", {
							attempt: row.lan_thu,
							name: row.ho_ten,
							mssv: row.mssv,
						})}
						isDeleting={deleteResult.isPending && deleteResult.variables === row.id_ket_qua}
					/>
				)}
			/>

			<AdminDetailModal
				opened={detailModal.opened}
				onClose={detailModal.close}
				title={t("detailTitleResult", { id: detailModal.viewing?.id_ket_qua ?? "" })}
				size="lg"
			>
				{detailModal.viewing && <ResultDetail result={detailModal.viewing} colors={colors} />}
			</AdminDetailModal>
		</>
	);
}
