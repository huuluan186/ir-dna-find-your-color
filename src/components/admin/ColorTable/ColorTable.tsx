"use client";

import { useMemo, useState } from "react";
import { Button, Select, Text } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import {
	AdminBadge,
	AdminBadgeGroup,
	AdminCellText,
	AdminDataTable,
	type AdminColumn,
} from "@/components/admin/AdminDataTable";
import { AdminDetailModal, useDetailModal } from "@/components/admin/AdminDetailModal";
import { AdminRowStandardActions } from "@/components/admin/AdminRowActions";
import { ColorDetail } from "@/components/admin/ColorDetail";
import { ColorEditor } from "@/components/admin/ColorEditor";
import { useAdminColors, useDeleteAdminColor } from "@/features/admin/client/hooks";
import type { AdminColorRow } from "@/features/admin/types";
import { showErrorToast, showSuccessToast } from "@/lib/toast";
import classes from "./ColorTable.module.css";

type ColorColumnKey = "mau" | "ten_mau" | "ten_ma_gen" | "tu_khoa" | "linh_vuc" | "ky_nang";

type ModalState = {
	mode: "view" | "edit" | "create";
	color: AdminColorRow | null;
};

export function ColorTable() {
	const t = useTranslations("admin");
	const { data = [], isError, refetch } = useAdminColors();
	const deleteColor = useDeleteAdminColor();
	const modal = useDetailModal<ModalState>();
	const [selectedColorFilter, setSelectedColorFilter] = useState<string | null>(null);

	const filterOptions = useMemo(
		() => [
			{ value: "", label: t("filterAll") },
			...data.map((color) => ({ value: String(color.id_mau_gen), label: color.ten_mau })),
		],
		[data, t]
	);

	const filteredData = useMemo(() => {
		if (!selectedColorFilter) return data;
		return data.filter((color) => String(color.id_mau_gen) === selectedColorFilter);
	}, [data, selectedColorFilter]);

	const columns = useMemo<AdminColumn<AdminColorRow, ColorColumnKey>[]>(
		() => [
			{
				key: "mau",
				label: t("colColor"),
				render: (color) => (
					<div className={classes.colorCell}>
						<span className={classes.swatch} style={{ backgroundColor: color.ma_hex }} />
						<span className={classes.hexCode}>{color.ma_hex}</span>
					</div>
				),
			},
			{
				key: "ten_mau",
				label: t("fieldColorName"),
				sortValue: (color) => color.ten_mau,
				render: (color) => color.ten_mau,
			},
			{
				key: "ten_ma_gen",
				label: t("colGeneName"),
				sortValue: (color) => color.ten_ma_gen,
				render: (color) => <Text className={classes.geneName}>{color.ten_ma_gen}</Text>,
			},
			{
				key: "tu_khoa",
				label: t("colKeywords"),
				render: (color) => (
					<AdminBadgeGroup>
						{color.tu_khoa.map((kw) => (
							<AdminBadge key={kw} uppercase={false} radius="sm">
								{kw}
							</AdminBadge>
						))}
					</AdminBadgeGroup>
				),
			},
			{
				key: "linh_vuc",
				label: t("colFields"),
				render: (color) => (
					<AdminCellText dimmed maxLines={2}>
						{color.linh_vuc || "–"}
					</AdminCellText>
				),
			},
			{
				key: "ky_nang",
				label: t("colSkills"),
				render: (color) => (
					<AdminCellText dimmed maxLines={2}>
						{color.ky_nang || "–"}
					</AdminCellText>
				),
			},
		],
		[t]
	);

	function modalTitle() {
		if (!modal.viewing) return t("titleGenes");
		if (modal.viewing.mode === "create") return t("createGeneTitle");
		if (modal.viewing.mode === "edit") {
			return t("detailTitleGene", { name: modal.viewing.color?.ten_mau ?? "" });
		}
		return t("detailTitleViewGene", { name: modal.viewing.color?.ten_mau ?? "" });
	}

	return (
		<>
			<AdminDataTable
				data={filteredData}
				getRowKey={(color) => String(color.id_mau_gen)}
				columns={columns}
				searchPlaceholder={t("searchPlaceholderGenes")}
				searchFields={(color) => [
					color.ten_mau,
					color.ten_ma_gen,
					color.ma_hex,
					...color.tu_khoa,
					color.linh_vuc,
					color.ky_nang,
				]}
				filters={
					<Select
						data={filterOptions}
						value={selectedColorFilter ?? ""}
						onChange={(val) => setSelectedColorFilter(val || null)}
						placeholder={t("filterGenePlaceholder")}
						w={180}
						size="sm"
					/>
				}
				actions={
					<Button
						size="sm"
						leftSection={<IconPlus size={16} />}
						onClick={() => modal.open({ mode: "create", color: null })}
					>
						{t("addColor")}
					</Button>
				}
				isError={isError}
				onRetry={() => refetch()}
				emptyText={t("emptyGenes")}
				renderActions={(color) => (
					<AdminRowStandardActions
						onView={() => modal.open({ mode: "view", color })}
						viewLabel={t("viewDetailOf", { name: color.ten_mau })}
						onEdit={() => modal.open({ mode: "edit", color })}
						editLabel={t("editGeneOf", { name: color.ten_mau })}
						onDelete={() =>
							deleteColor.mutate(color.id_mau_gen, {
								onSuccess: (res) => {
									showSuccessToast((res as { message?: string })?.message ?? t("deleteSuccess"));
								},
								onError: (err) => {
									showErrorToast(err, t("saveError"));
								},
							})
						}
						deleteLabel={t("delete")}
						deleteConfirmText={t("deleteConfirmColor", { name: color.ten_mau })}
						isDeleting={deleteColor.isPending && deleteColor.variables === color.id_mau_gen}
					/>
				)}
			/>

			<AdminDetailModal opened={modal.opened} onClose={modal.close} title={modalTitle()} size="lg">
				{modal.viewing?.mode === "view" && modal.viewing.color ? (
					<ColorDetail color={modal.viewing.color} />
				) : modal.viewing ? (
					<ColorEditor color={modal.viewing.color} onClose={modal.close} />
				) : null}
			</AdminDetailModal>
		</>
	);
}
