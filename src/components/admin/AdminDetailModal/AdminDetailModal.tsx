"use client";

import { useState, type ReactNode } from "react";
import {
	Fieldset,
	Modal,
	SimpleGrid,
	Text,
	Textarea,
	TextInput,
	type MantineSize,
} from "@mantine/core";
import { useTranslations } from "next-intl";
import { AdminSkeleton } from "@/components/admin/AdminSkeleton";
import classes from "./AdminDetailModal.module.css";

// Quản lý đóng/mở modal xem chi tiết: giữ nguyên giá trị viewing khi đóng để nội dung
// không biến mất đột ngột giữa hiệu ứng đóng modal.
export function useDetailModal<T>() {
	const [viewing, setViewing] = useState<T | null>(null);
	const [opened, setOpened] = useState(false);

	function open(item: T) {
		setViewing(item);
		setOpened(true);
	}

	function close() {
		setOpened(false);
	}

	return { viewing, opened, open, close };
}

export function AdminDetailModal({
	opened,
	onClose,
	title,
	size = "lg",
	zIndex = 300,
	children,
}: {
	opened: boolean;
	onClose: () => void;
	title: ReactNode;
	size?: MantineSize | number;
	zIndex?: number;
	children: ReactNode;
}) {
	return (
		<Modal
			opened={opened}
			onClose={onClose}
			title={title}
			size={size}
			radius={12}
			centered
			zIndex={zIndex}
			classNames={{ title: classes.modalTitle }}
		>
			{children}
		</Modal>
	);
}

// Khung trạng thái tải/lỗi dùng chung cho nội dung chi tiết hoặc trang cấu hình quản trị
export function AdminDetailShell({
	isLoading,
	isError,
	errorText,
	children,
}: {
	isLoading: boolean;
	isError: boolean;
	errorText?: string;
	children: ReactNode;
}) {
	const t = useTranslations("admin");
	if (isLoading || isError) {
		return isError ? (
			<Text c="dimmed">{errorText ?? t("loadError")}</Text>
		) : (
			<AdminSkeleton variant="detail" />
		);
	}
	return <>{children}</>;
}

// Nhóm thông tin có khung viền và tiêu đề legend chuẩn trang quản trị
export function AdminFieldset({
	legend,
	children,
	className,
}: {
	legend: ReactNode;
	children: ReactNode;
	className?: string;
}) {
	return (
		<Fieldset
			legend={legend}
			className={`${classes.fieldset} ${className ?? ""}`}
			classNames={{ legend: classes.legend }}
		>
			{children}
		</Fieldset>
	);
}

export type AdminReadonlyField = {
	label: string;
	value: string;
	multiline?: boolean;
	fullWidth?: boolean;
};

// Lưới các ô chỉ xem (disabled, theme tự in nghiêng chữ; hỗ trợ ô nhiều dòng autosize không bị cắt chữ)
export function AdminReadonlyGrid({
	fields,
	cols = { base: 1, sm: 2 },
}: {
	fields: AdminReadonlyField[];
	cols?: { base?: number; sm?: number; md?: number } | number;
}) {
	return (
		<SimpleGrid cols={cols} spacing="md" verticalSpacing="md">
			{fields.map((field) =>
				field.multiline ? (
					<Textarea
						key={field.label}
						label={field.label}
						value={field.value}
						disabled
						autosize
						minRows={2}
						style={field.fullWidth ? { gridColumn: "1 / -1" } : undefined}
					/>
				) : (
					<TextInput
						key={field.label}
						label={field.label}
						value={field.value}
						disabled
						style={field.fullWidth ? { gridColumn: "1 / -1" } : undefined}
					/>
				)
			)}
		</SimpleGrid>
	);
}
