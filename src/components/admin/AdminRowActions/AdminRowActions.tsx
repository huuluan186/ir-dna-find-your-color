"use client";

import { useState, type ReactNode } from "react";
import {
	ActionIcon,
	Button,
	Group,
	Popover,
	Text,
	Tooltip,
	type MantineColor,
} from "@mantine/core";
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
	confirmText: ReactNode;
	confirmLabel?: string;
	cancelLabel?: string;
	color?: MantineColor;
	size?: number;
	loading?: boolean;
	withTooltip?: boolean;
	onConfirm: () => void;
	children: ReactNode;
};

// Nút thao tác nguy hiểm (khoá tài khoản, xoá bản ghi...) có Popover hỏi xác nhận trước khi chạy
export function AdminConfirmAction({
	label,
	ariaLabel,
	confirmText,
	confirmLabel,
	cancelLabel,
	color = "red",
	size = 34,
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
			color={color}
			size={size}
			loading={loading}
			aria-label={ariaLabel ?? label}
			onClick={() => setOpened((prev) => !prev)}
		>
			{children}
		</ActionIcon>
	);

	return (
		<Popover opened={opened} onChange={setOpened} position="bottom-end" withArrow>
			<Popover.Target>
				{withTooltip ? (
					<Tooltip label={label} withArrow disabled={opened}>
						{button}
					</Tooltip>
				) : (
					button
				)}
			</Popover.Target>
			<Popover.Dropdown className={classes.confirm}>
				<Text size="sm">{confirmText}</Text>
				<Group justify="flex-end" gap={8} mt="sm">
					<Button size="xs" variant="default" onClick={() => setOpened(false)}>
						{cancelLabel ?? t("cancel")}
					</Button>
					<Button
						size="xs"
						color={color}
						onClick={() => {
							setOpened(false);
							onConfirm();
						}}
					>
						{confirmLabel ?? label}
					</Button>
				</Group>
			</Popover.Dropdown>
		</Popover>
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
