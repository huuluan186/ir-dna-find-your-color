"use client";

import { useMemo, useState } from "react";
import {
	ActionIcon,
	Badge,
	Button,
	Group,
	Modal,
	Popover,
	Pagination,
	Select,
	Table,
	Text,
	TextInput,
	Tooltip,
	UnstyledButton,
} from "@mantine/core";
import {
	IconChevronDown,
	IconChevronUp,
	IconEye,
	IconLock,
	IconLockOpen,
	IconSearch,
	IconSelector,
} from "@tabler/icons-react";
import { useMediaQuery } from "@mantine/hooks";
import { useFormatter, useTranslations } from "next-intl";
import { ADMIN_TABLE } from "@/constants/app";
import { StudentDetail } from "@/components/admin/StudentDetail";
import { useSetStudentLocked, useStudents } from "@/features/admin/client/hooks";
import type { AdminStudentRow } from "@/features/admin/types";
import classes from "./StudentTable.module.css";

type SortKey = "mssv" | "ho_ten" | "bi_khoa" | "created_at" | "so_lan_lam" | "lan_lam_gan_nhat";
type Sort = { key: SortKey; direction: "asc" | "desc" };

// Cột theo thứ tự hiển thị; key null là cột không sắp xếp được (Vai trò: mọi dòng dữ liệu đều là sinh viên)
const COLUMNS: { key: SortKey | null; labelKey: string; numeric?: boolean }[] = [
	{ key: "mssv", labelKey: "colAccount" },
	{ key: "ho_ten", labelKey: "colName" },
	{ key: null, labelKey: "colRole" },
	{ key: "bi_khoa", labelKey: "colStatus" },
	{ key: "created_at", labelKey: "colJoined" },
	{ key: "so_lan_lam", labelKey: "colAttempts", numeric: true },
	{ key: "lan_lam_gan_nhat", labelKey: "colLatest" },
];

// Bỏ dấu tiếng Việt để tìm "nguyen" ra "Nguyễn"
function normalize(value: string) {
	return value
		.normalize("NFD")
		.replace(/\p{Diacritic}/gu, "")
		.replace(/đ/g, "d")
		.replace(/Đ/g, "D")
		.toLowerCase();
}

const collator = new Intl.Collator("vi", { numeric: true, sensitivity: "base" });

// Tài khoản quản trị dùng mật khẩu chung (ADMIN_PASSWORD), không nằm trong CSDL: chỉ hiện để biết,
// ghim ở đầu trang 1, không khoá được
const SHARED_ADMIN_ACCOUNT = "admin";

// So sánh hai dòng theo một cột; "chưa làm" (null) luôn nằm cuối dù sắp tăng hay giảm
function compareRows(a: AdminStudentRow, b: AdminStudentRow, { key, direction }: Sort) {
	const left = a[key];
	const right = b[key];
	if (left === null || right === null) {
		return left === right ? 0 : left === null ? 1 : -1;
	}
	const result =
		typeof left === "number" && typeof right === "number"
			? left - right
			: collator.compare(String(left), String(right));
	return direction === "asc" ? result : -result;
}

export function StudentTable() {
	const t = useTranslations("admin");
	const format = useFormatter();
	const { data = [], isError, refetch } = useStudents();
	const setLocked = useSetStudentLocked();
	const [search, setSearch] = useState("");
	const [page, setPage] = useState(1);
	// null = chưa chọn, dùng mặc định theo thiết bị (điện thoại ít dòng hơn để bảng vừa màn hình)
	const [pageSizeChoice, setPageSizeChoice] = useState<number | null>(null);
	const isMobile = useMediaQuery(ADMIN_TABLE.MOBILE_QUERY);
	const pageSize =
		pageSizeChoice ??
		(isMobile ? ADMIN_TABLE.DEFAULT_PAGE_SIZE_MOBILE : ADMIN_TABLE.DEFAULT_PAGE_SIZE);
	// Mặc định: người tham gia mới nhất lên đầu
	const [sort, setSort] = useState<Sort>({ key: "created_at", direction: "desc" });
	// Sinh viên xem chi tiết trong modal; giữ mã khi đóng để nội dung không biến mất giữa hiệu ứng đóng
	const [viewing, setViewing] = useState<string | null>(null);
	const [detailOpened, setDetailOpened] = useState(false);

	// Lọc rồi sắp xếp ngay trên trình duyệt, không gọi lại API
	const visible = useMemo(() => {
		const keyword = normalize(search.trim());
		const filtered = keyword
			? data.filter(
					(student) => student.mssv.includes(keyword) || normalize(student.ho_ten).includes(keyword)
				)
			: data;
		return [...filtered].sort((a, b) => compareRows(a, b, sort));
	}, [data, search, sort]);

	function toggleSort(key: SortKey) {
		setSort((current) =>
			current.key === key
				? { key, direction: current.direction === "asc" ? "desc" : "asc" }
				: { key, direction: "asc" }
		);
		setPage(1);
	}

	const pageCount = Math.max(1, Math.ceil(visible.length / pageSize));
	const currentPage = Math.min(page, pageCount);
	const firstIndex = (currentPage - 1) * pageSize;
	const rows = visible.slice(firstIndex, firstIndex + pageSize);
	const keyword = normalize(search.trim());
	const showAdminRow =
		currentPage === 1 &&
		(!keyword ||
			SHARED_ADMIN_ACCOUNT.includes(keyword) ||
			normalize(t("sharedAdminName")).includes(keyword));
	const formatDate = (value: string) =>
		format.dateTime(new Date(value), { dateStyle: "short", timeStyle: "short" });

	return (
		<div className={classes.wrapper}>
			{/* Tiêu đề trang nằm trên banner, số kết quả nằm ở chân bảng */}
			<Group gap="md">
				<TextInput
					className={classes.search}
					placeholder={t("searchPlaceholder")}
					leftSection={<IconSearch size={16} />}
					value={search}
					onChange={(event) => {
						setSearch(event.currentTarget.value);
						setPage(1);
					}}
				/>
			</Group>

			{isError ? (
				<div className={classes.empty}>
					<Text>{t("loadError")}</Text>
					<Button variant="default" size="sm" onClick={() => refetch()}>
						{t("retry")}
					</Button>
				</div>
			) : rows.length === 0 && !showAdminRow ? (
				<div className={classes.empty}>
					<Text c="dimmed">{data.length === 0 ? t("emptyStudents") : t("noMatch")}</Text>
				</div>
			) : (
				<div className={classes.tableCard}>
					{/* Cuộn bên trong khung bảng (cả ngang lẫn dọc) để trang không phải cuộn */}
					<div className={classes.tableScroll}>
						<Table
							highlightOnHover
							stickyHeader
							verticalSpacing="sm"
							horizontalSpacing="md"
							className={classes.table}
						>
							<Table.Thead>
								<Table.Tr>
									{/* Số thứ tự theo cách bảng đang hiển thị (sau lọc, sắp xếp, phân trang), không phải id CSDL */}
									<Table.Th className={classes.indexCell}>#</Table.Th>
									{COLUMNS.map(({ key, labelKey, numeric }) => {
										if (key === null)
											return (
												<Table.Th key={labelKey} className={classes.nowrap}>
													{t(labelKey)}
												</Table.Th>
											);
										const active = sort.key === key;
										const SortIcon = !active
											? IconSelector
											: sort.direction === "asc"
												? IconChevronUp
												: IconChevronDown;
										return (
											<Table.Th
												key={key}
												className={numeric ? classes.number : undefined}
												aria-sort={
													active ? (sort.direction === "asc" ? "ascending" : "descending") : "none"
												}
											>
												<UnstyledButton
													className={classes.sortButton}
													data-active={active || undefined}
													data-numeric={numeric || undefined}
													onClick={() => toggleSort(key)}
												>
													{t(labelKey)}
													<SortIcon size={14} stroke={2} className={classes.sortIcon} />
												</UnstyledButton>
											</Table.Th>
										);
									})}
									<Table.Th className={classes.actionsCell}>{t("colActions")}</Table.Th>
								</Table.Tr>
							</Table.Thead>
							<Table.Tbody>
								{showAdminRow && (
									<Table.Tr className={classes.pinnedRow}>
										<Table.Td className={classes.indexCell}>–</Table.Td>
										<Table.Td className={classes.account}>{SHARED_ADMIN_ACCOUNT}</Table.Td>
										<Table.Td className={classes.nowrap}>{t("sharedAdminName")}</Table.Td>
										<Table.Td>
											<Badge variant="light" color="dna" radius="xl" className={classes.badge}>
												{t("roleAdmin")}
											</Badge>
										</Table.Td>
										<Table.Td>
											<StatusBadge locked={false} />
										</Table.Td>
										<Table.Td className={classes.muted}>–</Table.Td>
										<Table.Td className={classes.number}>–</Table.Td>
										<Table.Td className={classes.muted}>–</Table.Td>
										<Table.Td className={classes.actionsCell}>
											<Tooltip label={t("sharedAdminHint")} withArrow multiline w={240}>
												<ActionIcon
													variant="subtle"
													color="gray"
													size={34}
													data-disabled
													aria-disabled="true"
													aria-label={t("sharedAdminHint")}
												>
													<IconLock size={18} stroke={1.7} />
												</ActionIcon>
											</Tooltip>
										</Table.Td>
									</Table.Tr>
								)}
								{rows.map((student, rowIndex) => {
									const openDetail = () => {
										setViewing(student.mssv);
										setDetailOpened(true);
									};
									return (
										<Table.Tr key={student.mssv} data-locked={student.bi_khoa || undefined}>
											<Table.Td className={classes.indexCell}>{firstIndex + rowIndex + 1}</Table.Td>
											<Table.Td>
												<UnstyledButton className={classes.mssv} onClick={openDetail}>
													{student.mssv}
												</UnstyledButton>
											</Table.Td>
											<Table.Td className={classes.name}>{student.ho_ten}</Table.Td>
											<Table.Td>
												<Badge variant="light" color="gray" radius="xl" className={classes.badge}>
													{t("roleStudent")}
												</Badge>
											</Table.Td>
											<Table.Td>
												<StatusBadge locked={student.bi_khoa} />
											</Table.Td>
											<Table.Td className={classes.muted}>
												{formatDate(student.created_at)}
											</Table.Td>
											<Table.Td className={classes.number}>{student.so_lan_lam}</Table.Td>
											<Table.Td className={classes.muted}>
												{student.lan_lam_gan_nhat
													? formatDate(student.lan_lam_gan_nhat)
													: t("never")}
											</Table.Td>
											<Table.Td className={classes.actionsCell}>
												<Group gap={4} wrap="nowrap" justify="center">
													<Tooltip label={t("viewDetail")} withArrow>
														<ActionIcon
															variant="subtle"
															color="dna"
															size={34}
															onClick={openDetail}
															title={t("viewDetail")}
															aria-label={t("viewDetailOf", { name: student.ho_ten })}
														>
															<IconEye size={18} stroke={1.7} />
														</ActionIcon>
													</Tooltip>
													<LockButton
														student={student}
														onChange={(bi_khoa) =>
															setLocked.mutate({ mssv: student.mssv, bi_khoa })
														}
													/>
												</Group>
											</Table.Td>
										</Table.Tr>
									);
								})}
							</Table.Tbody>
						</Table>
					</div>
					{/* Chân bảng dính liền khung bảng */}
					<div className={classes.footer}>
						<Text className={classes.range}>
							{/* Tổng số đếm ở trình duyệt sau khi lọc; API trả toàn bộ danh sách */}
							{t.rich("showingRange", {
								from: firstIndex + 1,
								to: firstIndex + rows.length,
								total: visible.length,
								b: (chunks) => <strong className={classes.total}>{chunks}</strong>,
							})}
						</Text>
						<Group gap="md" wrap="wrap" className={classes.footerControls}>
							<Group gap={8} wrap="nowrap">
								<Text className={classes.range}>{t("rowsPerPage")}</Text>
								<Select
									aria-label={t("rowsPerPage")}
									size="sm"
									w={76}
									allowDeselect={false}
									comboboxProps={{ withinPortal: true }}
									data={ADMIN_TABLE.PAGE_SIZE_OPTIONS.map(String)}
									value={String(pageSize)}
									onChange={(value) => {
										setPageSizeChoice(Number(value));
										setPage(1);
									}}
								/>
							</Group>
							<Pagination
								total={pageCount}
								value={currentPage}
								onChange={setPage}
								size="sm"
								withEdges={false}
							/>
						</Group>
					</div>
				</div>
			)}

			<Modal
				opened={detailOpened}
				onClose={() => setDetailOpened(false)}
				title={t("detailTitle")}
				size="lg"
				radius={12}
				centered
				classNames={{ title: classes.modalTitle }}
			>
				{viewing && <StudentDetail mssv={viewing} />}
			</Modal>
		</div>
	);
}

function StatusBadge({ locked }: { locked: boolean }) {
	const t = useTranslations("admin");
	return (
		<Badge variant="light" color={locked ? "red" : "green"} radius="xl" className={classes.badge}>
			{locked ? t("statusLocked") : t("statusActive")}
		</Badge>
	);
}

// Khoá thì hỏi lại (sinh viên sẽ không làm bài tiếp được), mở khoá thì làm ngay
function LockButton({
	student,
	onChange,
}: {
	student: AdminStudentRow;
	onChange: (locked: boolean) => void;
}) {
	const t = useTranslations("admin");
	const [confirmOpen, setConfirmOpen] = useState(false);

	if (student.bi_khoa) {
		return (
			<Tooltip label={t("unlock")} withArrow>
				<ActionIcon
					variant="subtle"
					color="green"
					size={34}
					aria-label={t("unlockOf", { name: student.ho_ten })}
					onClick={() => onChange(false)}
				>
					<IconLockOpen size={18} stroke={1.7} />
				</ActionIcon>
			</Tooltip>
		);
	}

	return (
		<Popover opened={confirmOpen} onChange={setConfirmOpen} position="bottom-end" withArrow>
			<Popover.Target>
				<Tooltip label={t("lock")} withArrow disabled={confirmOpen}>
					<ActionIcon
						variant="subtle"
						color="red"
						size={34}
						aria-label={t("lockOf", { name: student.ho_ten })}
						onClick={() => setConfirmOpen((open) => !open)}
					>
						<IconLock size={18} stroke={1.7} />
					</ActionIcon>
				</Tooltip>
			</Popover.Target>
			<Popover.Dropdown className={classes.confirm}>
				<Text size="sm">{t("lockConfirm", { name: student.ho_ten, mssv: student.mssv })}</Text>
				<Group justify="flex-end" gap={8} mt="sm">
					<Button size="xs" variant="default" onClick={() => setConfirmOpen(false)}>
						{t("cancel")}
					</Button>
					<Button
						size="xs"
						color="red"
						onClick={() => {
							setConfirmOpen(false);
							onChange(true);
						}}
					>
						{t("lock")}
					</Button>
				</Group>
			</Popover.Dropdown>
		</Popover>
	);
}
