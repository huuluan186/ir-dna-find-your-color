"use client";

import { useCallback, useMemo } from "react";
import { Table } from "@mantine/core";
import { IconEye, IconLock, IconLockOpen } from "@tabler/icons-react";
import { useFormatter, useTranslations } from "next-intl";
import {
	AdminBadge,
	AdminCellButton,
	AdminDataTable,
	AdminPinnedRow,
	AdminStatusBadge,
	adminTableClasses,
	matchesSearch,
	type AdminColumn,
} from "@/components/admin/AdminDataTable";
import { AdminDetailModal, useDetailModal } from "@/components/admin/AdminDetailModal";
import { AdminIconAction, AdminToggleAction } from "@/components/admin/AdminRowActions";
import { StudentDetail } from "@/components/admin/StudentDetail";
import { useSetStudentLocked, useStudents } from "@/features/admin/client/hooks";
import type { AdminStudentRow } from "@/features/admin/types";

type StudentColumnKey =
	"mssv" | "ho_ten" | "role" | "bi_khoa" | "created_at" | "so_lan_lam" | "lan_lam_gan_nhat";

// Tài khoản quản trị dùng mật khẩu chung (ADMIN_PASSWORD), không nằm trong CSDL: chỉ hiện để biết,
// ghim ở đầu trang 1, không khoá được
const SHARED_ADMIN_ACCOUNT = "admin";

export function StudentTable() {
	const t = useTranslations("admin");
	const format = useFormatter();
	const { data = [], isError, refetch } = useStudents();
	const setLocked = useSetStudentLocked();
	const detailModal = useDetailModal<string>();

	const formatDate = useCallback(
		(value: string) => format.dateTime(new Date(value), { dateStyle: "short", timeStyle: "short" }),
		[format]
	);

	const columns = useMemo<AdminColumn<AdminStudentRow, StudentColumnKey>[]>(
		() => [
			{
				key: "mssv",
				label: t("colAccount"),
				sortValue: (student) => student.mssv,
				render: (student) => (
					<AdminCellButton onClick={() => detailModal.open(student.mssv)}>
						{student.mssv}
					</AdminCellButton>
				),
			},
			{
				key: "ho_ten",
				label: t("colName"),
				sortValue: (student) => student.ho_ten,
				className: adminTableClasses.name,
				render: (student) => student.ho_ten,
			},
			{
				key: "role",
				label: t("colRole"),
				nowrap: true,
				render: () => <AdminBadge color="gray">{t("roleStudent")}</AdminBadge>,
			},
			{
				key: "bi_khoa",
				label: t("colStatus"),
				sortValue: (student) => student.bi_khoa,
				render: (student) => <AdminStatusBadge inactive={student.bi_khoa} />,
			},
			{
				key: "created_at",
				label: t("colJoined"),
				sortValue: (student) => student.created_at,
				className: adminTableClasses.muted,
				render: (student) => formatDate(student.created_at),
			},
			{
				key: "so_lan_lam",
				label: t("colAttempts"),
				sortValue: (student) => student.so_lan_lam,
				numeric: true,
				render: (student) => student.so_lan_lam,
			},
			{
				key: "lan_lam_gan_nhat",
				label: t("colLatest"),
				sortValue: (student) => student.lan_lam_gan_nhat,
				className: adminTableClasses.muted,
				render: (student) =>
					student.lan_lam_gan_nhat ? formatDate(student.lan_lam_gan_nhat) : t("never"),
			},
		],
		[t, formatDate, detailModal]
	);

	return (
		<>
			<AdminDataTable
				data={data}
				getRowKey={(student) => student.mssv}
				columns={columns}
				defaultSort={{ key: "created_at", direction: "desc" }}
				searchPlaceholder={t("searchPlaceholder")}
				searchFields={(student) => [student.mssv, student.ho_ten]}
				rowProps={(student) => ({ "data-locked": student.bi_khoa || undefined })}
				isError={isError}
				onRetry={() => refetch()}
				emptyText={t("emptyStudents")}
				pinnedRows={(keyword) =>
					matchesSearch(keyword, SHARED_ADMIN_ACCOUNT, t("sharedAdminName")) ? (
						<AdminPinnedRow
							actions={
								<AdminIconAction label={t("sharedAdminHint")} disabled tooltipWidth={240}>
									<IconLock size={18} stroke={1.7} />
								</AdminIconAction>
							}
						>
							<Table.Td className={adminTableClasses.account}>{SHARED_ADMIN_ACCOUNT}</Table.Td>
							<Table.Td className={adminTableClasses.nowrap}>{t("sharedAdminName")}</Table.Td>
							<Table.Td>
								<AdminBadge color="dna">{t("roleAdmin")}</AdminBadge>
							</Table.Td>
							<Table.Td>
								<AdminStatusBadge inactive={false} />
							</Table.Td>
							<Table.Td className={adminTableClasses.muted}>–</Table.Td>
							<Table.Td className={adminTableClasses.number}>–</Table.Td>
							<Table.Td className={adminTableClasses.muted}>–</Table.Td>
						</AdminPinnedRow>
					) : null
				}
				renderActions={(student) => (
					<>
						<AdminIconAction
							label={t("viewDetail")}
							ariaLabel={t("viewDetailOf", { name: student.ho_ten })}
							onClick={() => detailModal.open(student.mssv)}
						>
							<IconEye size={18} stroke={1.7} />
						</AdminIconAction>
						<AdminToggleAction
							active={student.bi_khoa}
							activateLabel={t("lock")}
							activateAriaLabel={t("lockOf", { name: student.ho_ten })}
							activateConfirmText={t("lockConfirm", {
								name: student.ho_ten,
								mssv: student.mssv,
							})}
							activateIcon={<IconLock size={18} stroke={1.7} />}
							deactivateLabel={t("unlock")}
							deactivateAriaLabel={t("unlockOf", { name: student.ho_ten })}
							deactivateIcon={<IconLockOpen size={18} stroke={1.7} />}
							onChange={(bi_khoa) => setLocked.mutate({ mssv: student.mssv, bi_khoa })}
						/>
					</>
				)}
			/>

			<AdminDetailModal
				opened={detailModal.opened}
				onClose={detailModal.close}
				title={t("detailTitle")}
			>
				{detailModal.viewing && <StudentDetail mssv={detailModal.viewing} />}
			</AdminDetailModal>
		</>
	);
}
