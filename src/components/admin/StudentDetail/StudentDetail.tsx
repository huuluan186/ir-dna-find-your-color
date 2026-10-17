"use client";

import { useFormatter, useTranslations } from "next-intl";
import {
	AdminDetailShell,
	AdminFieldset,
	AdminReadonlyGrid,
} from "@/components/admin/AdminDetailModal";
import { useStudentDetail } from "@/features/admin/client/hooks";

// Chi tiết một sinh viên dạng form trong modal của bảng danh sách.
// Mọi ô ở đây chỉ để xem nên đều disabled (theme tự in nghiêng chữ trong ô disabled).
export function StudentDetail({ mssv }: { mssv: string }) {
	const t = useTranslations("admin");
	const format = useFormatter();
	const { data: student, isError } = useStudentDetail(mssv);

	const formatDate = (value: string) =>
		format.dateTime(new Date(value), { dateStyle: "medium", timeStyle: "short" });

	return (
		<AdminDetailShell isLoading={!student} isError={isError}>
			{student && (
				<AdminFieldset legend={t("infoTitle")}>
					<AdminReadonlyGrid
						fields={[
							{ label: t("colMssv"), value: student.mssv },
							{ label: t("colName"), value: student.ho_ten },
							{ label: t("joinedAt"), value: formatDate(student.created_at) },
							{
								label: t("updatedAt"),
								value: student.updated_at ? formatDate(student.updated_at) : t("notUpdated"),
							},
							{ label: t("attempts"), value: String(student.so_lan_lam) },
							{
								label: t("colLatest"),
								value: student.lan_lam_gan_nhat ? formatDate(student.lan_lam_gan_nhat) : t("never"),
							},
							{
								label: t("colStatus"),
								value: student.bi_khoa ? t("statusLocked") : t("statusActive"),
							},
							{
								label: t("lockedAt"),
								value: student.khoa_luc ? formatDate(student.khoa_luc) : "–",
							},
						]}
					/>
				</AdminFieldset>
			)}
		</AdminDetailShell>
	);
}
