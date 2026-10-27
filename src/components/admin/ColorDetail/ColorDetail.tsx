"use client";

import { Text } from "@mantine/core";
import { useTranslations } from "next-intl";
import { AdminBadge, AdminBadgeGroup } from "@/components/admin/AdminDataTable";
import { AdminFieldset, AdminReadonlyGrid } from "@/components/admin/AdminDetailModal";
import type { AdminColorRow } from "@/features/admin/types";
import classes from "./ColorDetail.module.css";

export function ColorDetail({ color }: { color: AdminColorRow }) {
	const t = useTranslations("admin");

	return (
		<div>
			<div className={classes.header}>
				<span className={classes.swatchLarge} style={{ backgroundColor: color.ma_hex }} />
				<div className={classes.headerInfo}>
					<Text className={classes.title}>
						Gen {color.ten_mau} – {color.ten_ma_gen}
					</Text>
					<Text className={classes.hexCode}>{color.ma_hex}</Text>
				</div>
			</div>

			<div className={classes.body}>
				<AdminFieldset legend={t("fieldBasicInfo")}>
					<AdminReadonlyGrid
						fields={[
							{ label: t("colOrder"), value: String(color.thu_tu) },
							{ label: t("fieldColorHex"), value: color.ma_hex },
							{ label: t("fieldColorName"), value: color.ten_mau },
							{ label: t("fieldGeneName"), value: color.ten_ma_gen },
						]}
					/>
				</AdminFieldset>

				<AdminFieldset legend={t("fieldKeywords")}>
					{color.tu_khoa.length > 0 ? (
						<AdminBadgeGroup gap={8}>
							{color.tu_khoa.map((kw) => (
								<AdminBadge key={kw} uppercase={false} radius="sm" size="md">
									{kw}
								</AdminBadge>
							))}
						</AdminBadgeGroup>
					) : (
						<Text c="dimmed" size="sm">
							–
						</Text>
					)}
				</AdminFieldset>

				<AdminFieldset legend={t("fieldMeaning")}>
					<Text size="sm" style={{ lineHeight: 1.6 }}>
						{color.y_nghia || "–"}
					</Text>
				</AdminFieldset>

				<AdminFieldset legend={t("fieldOrientation")}>
					<AdminReadonlyGrid
						cols={1}
						fields={[
							{ label: t("fieldFields"), value: color.linh_vuc || "–", multiline: true },
							{ label: t("fieldSkills"), value: color.ky_nang || "–", multiline: true },
						]}
					/>
				</AdminFieldset>
			</div>
		</div>
	);
}
