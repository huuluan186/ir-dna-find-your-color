"use client";

import { useState, type ReactNode } from "react";
import { ActionIcon, Button, Group, Modal, Text, Tooltip, type MantineColor } from "@mantine/core";
import { IconAlertTriangle, IconEdit, IconEye, IconTrash } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import classes from "./AdminRowActions.module.css";

export type AdminIconActionProps = {
	label: string;
	ariaLabel?: string;
	color?: MantineColor;
	size?: number;
	disabled?: boolean;
	tooltipWidth?: number;
	loading?: boolean;
	onClick?: () => void;
	children: ReactNode;
};

// Nút bấm icon trên dòng bảng quản trị, bọc sẵn Tooltip.
// Khi disabled=true thì dùng data-disabled thay vì thuộc tính disabled của HTML để Tooltip vẫn hiện.
export function AdminIconAction({
	label,
	ariaLabel,
	color = "dna",
	size = 34,
	disabled = false,
	tooltipWidth,
	loading = false,
	onClick,
	children,
}: AdminIconActionProps) {
	return (
		<Tooltip label={label} withArrow multiline={tooltipWidth !== undefined} w={tooltipWidth}>
			<ActionIcon
				variant="subtle"
				color={disabled ? "gray" : color}
				size={size}
				loading={loading}
				data-disabled={disabled || undefined}
				aria-disabled={disabled || undefined}
				aria-label={ariaLabel ?? label}
				onClick={disabled ? undefined : onClick}
			>
				{children}
			</ActionIcon>
		</Tooltip>
	);
}

export type AdminConfirmActionProps = {
	label: string;
	ariaLabel?: string;
	confirmTitle?: string;
	confirmText: ReactNode;
	confirmLabel?: string;
	cancelLabel?: string;
	color?: MantineColor;
	size?: number;
	disabled?: boolean;
	loading?: boolean;
	withTooltip?: boolean;
	onConfirm: () => void;
	children: ReactNode;
};

// Nút thao tác nguy hiểm (khoá tài khoản, xoá bản ghi...) mở popup Modal giữa màn hình hỏi xác nhận trước khi chạy
export function AdminConfirmAction({
	label,
	ariaLabel,
	confirmTitle,
	confirmText,
	confirmLabel,
	cancelLabel,
	color = "red",
	size = 34,
	disabled = false,
	loading = false,
	withTooltip = true,
	onConfirm,
	children,
}: AdminConfirmActionProps) {
	const t = useTranslations("admin");
	const [opened, setOpened] = useState(false);

	const button = (
		<ActionIcon
			variant="subtle"
			color={disabled ? "gray" : color}
			size={size}
			loading={loading}
			data-disabled={disabled || undefined}
			aria-disabled={disabled || undefined}
			aria-label={ariaLabel ?? label}
			onClick={disabled ? undefined : () => setOpened(true)}
		>
			{children}
		</ActionIcon>
	);

	return (
		<>
			{withTooltip ? (
				<Tooltip label={label} withArrow disabled={opened}>
					{button}
				</Tooltip>
			) : (
				button
			)}

			<Modal
				opened={opened}
				onClose={() => setOpened(false)}
				centered
				size="sm"
				zIndex={300}
				title={
					<Group gap={8}>
						<IconAlertTriangle size={20} color="var(--mantine-color-red-6)" stroke={2} />
						<Text fw={700} size="md">
							{confirmTitle ?? t("deleteConfirmTitle")}
						</Text>
					</Group>
				}
			>
				<Text size="sm" c="dimmed" style={{ lineHeight: 1.5 }}>
					{confirmText}
				</Text>
				<Group justify="flex-end" gap={10} mt="xl">
					<Button size="sm" variant="default" onClick={() => setOpened(false)} disabled={loading}>
						{cancelLabel ?? t("cancel")}
					</Button>
					<Button
						size="sm"
						color={color}
						loading={loading}
						onClick={() => {
							setOpened(false);
							onConfirm();
						}}
					>
						{confirmLabel ?? label}
					</Button>
				</Group>
			</Modal>
		</>
	);
}

export type AdminToggleActionProps = {
	// Trạng thái đang bật/khoá (VD: bi_khoa = true)
	active: boolean;
	activateLabel: string;
	activateAriaLabel?: string;
	activateConfirmText: ReactNode;
	activateIcon: ReactNode;
	activateColor?: MantineColor;
	deactivateLabel: string;
	deactivateAriaLabel?: string;
	deactivateIcon: ReactNode;
	deactivateColor?: MantineColor;
	onChange: (nextActive: boolean) => void;
};

// Nút bật/tắt 2 chiều: chiều khoá/tắt hỏi xác nhận qua Popover, chiều mở lại chạy ngay
export function AdminToggleAction({
	active,
	activateLabel,
	activateAriaLabel,
	activateConfirmText,
	activateIcon,
	activateColor = "red",
	deactivateLabel,
	deactivateAriaLabel,
	deactivateIcon,
	deactivateColor = "green",
	onChange,
}: AdminToggleActionProps) {
	if (active) {
		return (
			<AdminIconAction
				label={deactivateLabel}
				ariaLabel={deactivateAriaLabel}
				color={deactivateColor}
				onClick={() => onChange(false)}
			>
				{deactivateIcon}
			</AdminIconAction>
		);
	}

	return (
		<AdminConfirmAction
			label={activateLabel}
			ariaLabel={activateAriaLabel}
			confirmText={activateConfirmText}
			color={activateColor}
			onConfirm={() => onChange(true)}
		>
			{activateIcon}
		</AdminConfirmAction>
	);
}

export type AdminRowStandardActionsProps = {
	onView?: () => void;
	viewLabel?: string;
	viewDisabled?: boolean;
	onEdit?: () => void;
	editLabel?: string;
	editDisabled?: boolean;
	onDelete?: () => void;
	deleteLabel?: string;
	deleteTitle?: string;
	deleteConfirmText?: ReactNode;
	deleteDisabled?: boolean;
	isDeleting?: boolean;
};

// Bộ 3 nút thao tác chuẩn cho bảng quản trị: Xem chi tiết (View), Sửa (Edit), Xoá (Delete)
export function AdminRowStandardActions({
	onView,
	viewLabel,
	viewDisabled = false,
	onEdit,
	editLabel,
	editDisabled = false,
	onDelete,
	deleteLabel,
	deleteTitle,
	deleteConfirmText,
	deleteDisabled = false,
	isDeleting = false,
}: AdminRowStandardActionsProps) {
	const t = useTranslations("admin");

	return (
		<>
			{onView && (
				<AdminIconAction
					label={viewLabel ?? t("viewDetail")}
					disabled={viewDisabled}
					color="gray"
					onClick={onView}
				>
					<IconEye size={18} stroke={1.7} />
				</AdminIconAction>
			)}
			{onEdit && (
				<AdminIconAction
					label={editLabel ?? t("edit")}
					disabled={editDisabled}
					color="dna"
					onClick={onEdit}
				>
					<IconEdit size={18} stroke={1.7} />
				</AdminIconAction>
			)}
			{onDelete && (
				<AdminConfirmAction
					label={deleteLabel ?? t("delete")}
					confirmTitle={deleteTitle ?? t("deleteConfirmTitle")}
					confirmText={deleteConfirmText ?? t("deleteConfirm")}
					disabled={deleteDisabled}
					loading={isDeleting}
					color="red"
					onConfirm={onDelete}
				>
					<IconTrash size={18} stroke={1.7} />
				</AdminConfirmAction>
			)}
		</>
	);
}
