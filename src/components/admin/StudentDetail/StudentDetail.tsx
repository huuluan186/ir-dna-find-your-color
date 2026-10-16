"use client";

import { Fieldset, SimpleGrid, Text, TextInput } from "@mantine/core";
import { useFormatter, useTranslations } from "next-intl";
import { AdminSkeleton } from "@/components/admin/AdminSkeleton";
import { useStudentDetail } from "@/features/admin/client/hooks";
import classes from "./StudentDetail.module.css";

// Chi tiết một sinh viên dạng form trong modal của bảng danh sách.
// Mọi ô ở đây chỉ để xem nên đều disabled (theme tự in nghiêng chữ trong ô disabled).
export function StudentDetail({ mssv }: { mssv: string }) {
	const t = useTranslations("admin");
	const format = useFormatter();
	const { data: student, isError } = useStudentDetail(mssv);

	if (!student) {
		return isError ? <Text c="dimmed">{t("loadError")}</Text> : <AdminSkeleton variant="detail" />;
	}

	const formatDate = (value: string) =>
		format.dateTime(new Date(value), { dateStyle: "medium", timeStyle: "short" });

	return (
		<Fieldset legend={t("infoTitle")} classNames={{ legend: classes.legend }}>
			<SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md" verticalSpacing="sm">
				<TextInput label={t("colMssv")} value={student.mssv} disabled />
				<TextInput label={t("colName")} value={student.ho_ten} disabled />
				<TextInput label={t("joinedAt")} value={formatDate(student.created_at)} disabled />
				<TextInput
					label={t("updatedAt")}
					value={student.updated_at ? formatDate(student.updated_at) : t("notUpdated")}
					disabled
				/>
				<TextInput label={t("attempts")} value={String(student.so_lan_lam)} disabled />
				<TextInput
					label={t("colLatest")}
					value={student.lan_lam_gan_nhat ? formatDate(student.lan_lam_gan_nhat) : t("never")}
					disabled
				/>
				<TextInput
					label={t("colStatus")}
					value={student.bi_khoa ? t("statusLocked") : t("statusActive")}
					disabled
				/>
				<TextInput
					label={t("lockedAt")}
					value={student.khoa_luc ? formatDate(student.khoa_luc) : "–"}
					disabled
				/>
			</SimpleGrid>
		</Fieldset>
	);
}
