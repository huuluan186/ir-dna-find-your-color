"use client";

import { useMemo, useState, type CSSProperties, type HTMLAttributes, type ReactNode } from "react";
import {
	Badge,
	Button,
	Group,
	Pagination,
	Select,
	Table,
	Text,
	TextInput,
	UnstyledButton,
	type MantineColor,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { IconChevronDown, IconChevronUp, IconSearch, IconSelector } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { ADMIN_TABLE } from "@/constants/app";
import classes from "./AdminDataTable.module.css";

export type SortDirection = "asc" | "desc";
export type SortValue = string | number | boolean | null | undefined;
export type SortState<K extends string = string> = { key: K; direction: SortDirection };

export type AdminColumn<T, K extends string = string> = {
	key: K;
	label: ReactNode;
	// Hàm lấy giá trị để sắp xếp; không truyền thì cột chỉ hiển thị, không bấm sắp xếp được
	sortValue?: (row: T) => SortValue;
	numeric?: boolean;
	nowrap?: boolean;
	className?: string;
	render: (row: T, index: number) => ReactNode;
};

export type AdminDataTableProps<T, K extends string = string> = {
	data: T[];
	getRowKey: (row: T) => string | number;
	columns: AdminColumn<T, K>[];
	defaultSort?: SortState<K>;
	// Danh sách trường văn bản của dòng để tìm kiếm không dấu ngay trên trình duyệt
	searchFields?: (row: T) => (string | null | undefined)[];
	searchPlaceholder?: string;
	// Bộ lọc đặt bên trái cạnh ô tìm kiếm (Select box...)
	filters?: ReactNode;
	// Nút thao tác ngoài bảng đặt phía trên bên phải (Nút thêm mới, xuất file...)
	actions?: ReactNode;
	// Thành phần phụ đặt bên phải ô tìm kiếm (giữ để tương thích ngược)
	toolbar?: ReactNode;
	// Dòng ghim ở đầu trang 1; nhận từ khoá đã bỏ dấu để tự ẩn/hiện khi tìm kiếm
	pinnedRows?: (keyword: string) => ReactNode;
	// Thuộc tính HTML gắn thêm cho <Table.Tr> (VD: data-locked)
	rowProps?: (row: T) => HTMLAttributes<HTMLTableRowElement> & Record<`data-${string}`, unknown>;
	// Cột "Thao tác" dính ở mép phải; truyền vào thì tự thêm cột Thao tác
	renderActions?: (row: T) => ReactNode;
	isError?: boolean;
	onRetry?: () => void;
	// Câu thông báo khi danh sách gốc chưa có bản ghi nào
	emptyText: string;
	// Câu thông báo khi lọc tìm kiếm không có bản ghi khớp (mặc định dùng admin.noMatch)
	noMatchText?: string;
};

// Bỏ dấu tiếng Việt để tìm "nguyen" ra "Nguyễn"
export function normalizeSearch(value: string) {
	return value
		.normalize("NFD")
		.replace(/\p{Diacritic}/gu, "")
		.replace(/đ/g, "d")
		.replace(/Đ/g, "D")
		.toLowerCase()
		.trim();
}

// Kiểm tra từ khoá đã bỏ dấu có xuất hiện trong bất kỳ trường nào hay không
export function matchesSearch(keyword: string, ...values: (string | null | undefined)[]) {
	if (!keyword) return true;
	return values.some((val) => val != null && normalizeSearch(val).includes(keyword));
}

const collator = new Intl.Collator("vi", { numeric: true, sensitivity: "base" });

// So sánh hai giá trị ô bảng; giá trị rỗng (null/undefined) luôn nằm cuối dù sắp tăng hay giảm
function compareValues(left: SortValue, right: SortValue, direction: SortDirection) {
	if (left == null || right == null) {
		return left === right ? 0 : left == null ? 1 : -1;
	}
	const result =
		typeof left === "number" && typeof right === "number"
			? left - right
			: typeof left === "boolean" && typeof right === "boolean"
				? Number(left) - Number(right)
				: collator.compare(String(left), String(right));
	return direction === "asc" ? result : -result;
}

export const adminTableClasses = classes;

// Bảng dữ liệu dùng chung cho các menu quản trị: tìm kiếm không dấu, sắp xếp cột, phân trang client
export function AdminDataTable<T, K extends string = string>({
	data,
	getRowKey,
	columns,
	defaultSort,
	searchFields,
	searchPlaceholder,
	filters,
	actions,
	toolbar,
	pinnedRows,
	rowProps,
	renderActions,
	isError = false,
	onRetry,
	emptyText,
	noMatchText,
}: AdminDataTableProps<T, K>) {
	const t = useTranslations("admin");
	const [search, setSearch] = useState("");
	const [page, setPage] = useState(1);
	// null = chưa chọn, dùng mặc định theo thiết bị (điện thoại ít dòng hơn để bảng vừa màn hình)
	const [pageSizeChoice, setPageSizeChoice] = useState<number | null>(null);
	const isMobile = useMediaQuery(ADMIN_TABLE.MOBILE_QUERY);
	const pageSize =
		pageSizeChoice ??
		(isMobile ? ADMIN_TABLE.DEFAULT_PAGE_SIZE_MOBILE : ADMIN_TABLE.DEFAULT_PAGE_SIZE);
	const [sort, setSort] = useState<SortState<K> | null>(defaultSort ?? null);

	const keyword = useMemo(() => normalizeSearch(search), [search]);

	// Lọc rồi sắp xếp ngay trên trình duyệt, không gọi lại API
	const visible = useMemo(() => {
		const filtered =
			keyword && searchFields
				? data.filter((row) => matchesSearch(keyword, ...searchFields(row)))
				: data;
		if (!sort) return filtered;
		const activeCol = columns.find((col) => col.key === sort.key);
		const getValue = activeCol?.sortValue;
		if (!getValue) return filtered;
		return [...filtered].sort((a, b) => compareValues(getValue(a), getValue(b), sort.direction));
	}, [data, keyword, searchFields, sort, columns]);

	function toggleSort(key: K) {
		setSort((current) =>
			current?.key === key
				? { key, direction: current.direction === "asc" ? "desc" : "asc" }
				: { key, direction: "asc" }
		);
		setPage(1);
	}

	const pageCount = Math.max(1, Math.ceil(visible.length / pageSize));
	const currentPage = Math.min(page, pageCount);
	const firstIndex = (currentPage - 1) * pageSize;
	const rows = visible.slice(firstIndex, firstIndex + pageSize);
	const pinnedContent = currentPage === 1 && pinnedRows ? pinnedRows(keyword) : null;
	const hasPinned = Boolean(pinnedContent);
	const showToolbar = Boolean(searchFields || filters || actions || toolbar);

	return (
		<div className={classes.wrapper}>
			{showToolbar && (
				<div className={classes.toolbar}>
					<div className={classes.toolbarLeft}>
						{searchFields && (
							<TextInput
								className={classes.search}
								placeholder={searchPlaceholder ?? t("searchPlaceholder")}
								leftSection={<IconSearch size={16} />}
								value={search}
								onChange={(event) => {
									setSearch(event.currentTarget.value);
									setPage(1);
								}}
							/>
						)}
						{filters}
					</div>
					{(actions || toolbar) && <div className={classes.toolbarRight}>{actions ?? toolbar}</div>}
				</div>
			)}

			{isError ? (
				<div className={classes.empty}>
					<Text>{t("loadError")}</Text>
					{onRetry && (
						<Button variant="default" size="sm" onClick={onRetry}>
							{t("retry")}
						</Button>
					)}
				</div>
			) : rows.length === 0 && !hasPinned ? (
				<div className={classes.empty}>
					<Text c="dimmed">{data.length === 0 ? emptyText : (noMatchText ?? t("noMatch"))}</Text>
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
									{columns.map(({ key, label, sortValue, numeric, nowrap }) => {
										const thClass = numeric ? classes.number : nowrap ? classes.nowrap : undefined;
										if (!sortValue) {
											return (
												<Table.Th key={key} className={thClass}>
													{label}
												</Table.Th>
											);
										}
										const active = sort?.key === key;
										const SortIcon = !active
											? IconSelector
											: sort.direction === "asc"
												? IconChevronUp
												: IconChevronDown;
										return (
											<Table.Th
												key={key}
												className={thClass}
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
													{label}
													<SortIcon size={14} stroke={2} className={classes.sortIcon} />
												</UnstyledButton>
											</Table.Th>
										);
									})}
									{renderActions && (
										<Table.Th className={classes.actionsCell}>{t("colActions")}</Table.Th>
									)}
								</Table.Tr>
							</Table.Thead>
							<Table.Tbody>
								{pinnedContent}
								{rows.map((row, rowIndex) => (
									<Table.Tr key={getRowKey(row)} {...rowProps?.(row)}>
										<Table.Td className={classes.indexCell}>{firstIndex + rowIndex + 1}</Table.Td>
										{columns.map((col) => {
											const tdClass =
												col.className ??
												(col.numeric ? classes.number : col.nowrap ? classes.nowrap : undefined);
											return (
												<Table.Td key={col.key} className={tdClass}>
													{col.render(row, firstIndex + rowIndex)}
												</Table.Td>
											);
										})}
										{renderActions && (
											<Table.Td className={classes.actionsCell}>
												<Group gap={4} wrap="nowrap" justify="center">
													{renderActions(row)}
												</Group>
											</Table.Td>
										)}
									</Table.Tr>
								))}
							</Table.Tbody>
						</Table>
					</div>
					{/* Chân bảng dính liền khung bảng */}
					<div className={classes.footer}>
						<Text className={classes.range}>
							{t.rich("showingRange", {
								from: rows.length === 0 ? 0 : firstIndex + 1,
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
		</div>
	);
}

// Dòng ghim cố định ở đầu trang 1, tự căn cột "#" và cột "Thao tác" dính phải
export function AdminPinnedRow({
	children,
	actions,
}: {
	children: ReactNode;
	actions?: ReactNode;
}) {
	return (
		<Table.Tr className={classes.pinnedRow}>
			<Table.Td className={classes.indexCell}>–</Table.Td>
			{children}
			{actions !== undefined && (
				<Table.Td className={classes.actionsCell}>
					<Group gap={4} wrap="nowrap" justify="center">
						{actions}
					</Group>
				</Table.Td>
			)}
		</Table.Tr>
	);
}

// Nút bấm trong ô bảng để mở chi tiết (mặc định dùng font monospace cho mã SV / mã định danh)
export function AdminCellButton({
	monospace = true,
	onClick,
	children,
}: {
	monospace?: boolean;
	onClick: () => void;
	children: ReactNode;
}) {
	return (
		<UnstyledButton
			className={classes.cellButton}
			data-monospace={monospace || undefined}
			onClick={onClick}
		>
			{children}
		</UnstyledButton>
	);
}

// Nhãn pill dùng chung trên bảng và danh sách quản trị, không bị cắt chữ khi bảng co
export function AdminBadge({
	color = "gray",
	uppercase = true,
	radius = "xl",
	size = "sm",
	children,
	className,
}: {
	color?: MantineColor;
	uppercase?: boolean;
	radius?: "xs" | "sm" | "md" | "lg" | "xl";
	size?: "xs" | "sm" | "md" | "lg" | "xl";
	children: ReactNode;
	className?: string;
}) {
	return (
		<Badge
			variant="light"
			color={color}
			radius={radius}
			size={size}
			className={`${classes.badge} ${className ?? ""}`}
			data-uppercase={uppercase || undefined}
		>
			{children}
		</Badge>
	);
}

// Nhóm chứa các nhãn/từ khoá, tự động xuống dòng và không co vỡ chữ
export function AdminBadgeGroup({
	children,
	gap = 6,
	minWidth,
	maxWidth,
}: {
	children: ReactNode;
	gap?: number | string;
	minWidth?: number | string;
	maxWidth?: number | string;
}) {
	return (
		<div
			className={classes.badgeGroup}
			style={
				{
					gap: typeof gap === "number" ? `${gap}px` : gap,
					...(minWidth
						? { "--min-width": typeof minWidth === "number" ? `${minWidth}px` : minWidth }
						: {}),
					...(maxWidth
						? { "--max-width": typeof maxWidth === "number" ? `${maxWidth}px` : maxWidth }
						: {}),
				} as CSSProperties
			}
		>
			{children}
		</div>
	);
}

export type AdminCellTextProps = {
	children: ReactNode;
	/**
	 * Số dòng tối đa hiển thị. Khi vượt quá số dòng này mới cắt '...' (mặc định: 2 dòng)
	 * @default 2
	 */
	maxLines?: number;
	/**
	 * Chiều rộng tối thiểu của nội dung ô để bảng giữ layout đẹp
	 * @default 180
	 */
	minWidth?: number | string;
	/**
	 * Chiều rộng tối đa của nội dung ô
	 * @default 320
	 */
	maxWidth?: number | string;
	/**
	 * Màu chữ mờ nhẹ (dimmed) cho nội dung mô tả phụ
	 * @default false
	 */
	dimmed?: boolean;
	title?: string;
	className?: string;
};

// Ô văn bản dùng chung cho các bảng quản trị: tự xuống dòng nhiều dòng, vượt quá chiều cao quy định mới cắt '...'
export function AdminCellText({
	children,
	maxLines = 2,
	minWidth = 180,
	maxWidth = 320,
	dimmed = false,
	title,
	className,
}: AdminCellTextProps) {
	const tooltip = title ?? (typeof children === "string" ? children : undefined);
	return (
		<div
			className={`${classes.cellText} ${className ?? ""}`}
			data-dimmed={dimmed || undefined}
			title={tooltip}
			style={
				{
					"--line-clamp": maxLines,
					"--min-width": typeof minWidth === "number" ? `${minWidth}px` : minWidth,
					"--max-width": typeof maxWidth === "number" ? `${maxWidth}px` : maxWidth,
				} as CSSProperties
			}
		>
			{children}
		</div>
	);
}

// Nhãn trạng thái 2 chiều (mặc định: Hoạt động / Đã khoá; có thể truyền nhãn riêng cho Bật / Tắt)
export function AdminStatusBadge({
	inactive,
	activeLabel,
	inactiveLabel,
	activeColor = "green",
	inactiveColor = "red",
}: {
	inactive: boolean;
	activeLabel?: string;
	inactiveLabel?: string;
	activeColor?: MantineColor;
	inactiveColor?: MantineColor;
}) {
	const t = useTranslations("admin");
	return (
		<AdminBadge color={inactive ? inactiveColor : activeColor}>
			{inactive ? (inactiveLabel ?? t("statusLocked")) : (activeLabel ?? t("statusActive"))}
		</AdminBadge>
	);
}
