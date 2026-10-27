"use client";

import { useMemo, useState } from "react";
import { Button, Group, Select, Text, Tooltip } from "@mantine/core";
import { IconCheck, IconEyeOff, IconPlus } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import {
	AdminCellText,
	AdminDataTable,
	AdminStatusBadge,
	type AdminColumn,
} from "@/components/admin/AdminDataTable";
import { AdminDetailModal, useDetailModal } from "@/components/admin/AdminDetailModal";
import { AdminIconAction, AdminRowStandardActions } from "@/components/admin/AdminRowActions";
import { QuestionBalance } from "@/components/admin/QuestionBalance";
import { QuestionDetail } from "@/components/admin/QuestionDetail";
import { QuestionEditor } from "@/components/admin/QuestionEditor";
import {
	useAdminColors,
	useAdminQuestions,
	useDeleteAdminQuestion,
	useToggleAdminQuestionStatus,
} from "@/features/admin/client/hooks";
import type { AdminQuestionRow } from "@/features/admin/types";
import { showErrorToast, showSuccessToast } from "@/lib/toast";
import classes from "./QuestionTable.module.css";

const LETTERS = ["A", "B", "C", "D", "E", "F"];

type QuestionColumnKey = "thu_tu" | "noi_dung" | "phuong_an" | "dang_bat";

type ModalState = {
	mode: "view" | "edit" | "create";
	question: AdminQuestionRow | null;
};

export function QuestionTable() {
	const t = useTranslations("admin");
	const { data = [], isError, refetch } = useAdminQuestions();
	const { data: colors = [] } = useAdminColors();
	const deleteQuestion = useDeleteAdminQuestion();
	const toggleStatus = useToggleAdminQuestionStatus();
	const modal = useDetailModal<ModalState>();

	const [statusFilter, setStatusFilter] = useState<string | null>(null);
	const [geneFilter, setGeneFilter] = useState<string | null>(null);

	const geneFilterOptions = useMemo(
		() => [
			{ value: "", label: t("filterAll") },
			...colors.map((c) => ({ value: String(c.id_mau_gen), label: c.ten_mau })),
		],
		[colors, t]
	);

	const statusFilterOptions = useMemo(
		() => [
			{ value: "", label: t("filterAll") },
			{ value: "active", label: t("statusActiveQuestion") },
			{ value: "inactive", label: t("statusInactiveQuestion") },
		],
		[t]
	);

	const filteredData = useMemo(() => {
		return data.filter((q) => {
			if (statusFilter === "active" && !q.dang_bat) return false;
			if (statusFilter === "inactive" && q.dang_bat) return false;
			if (geneFilter && !q.dap_an.some((opt) => String(opt.id_mau_gen) === geneFilter)) {
				return false;
			}
			return true;
		});
	}, [data, statusFilter, geneFilter]);

	const maxOrder = useMemo(() => {
		return data.reduce((max, q) => Math.max(max, q.thu_tu), 0);
	}, [data]);

	const columns = useMemo<AdminColumn<AdminQuestionRow, QuestionColumnKey>[]>(
		() => [
			{
				key: "thu_tu",
				label: t("colOrder"),
				numeric: true,
				sortValue: (q) => q.thu_tu,
				render: (q) => <Text className={classes.orderText}>{q.thu_tu}</Text>,
			},
			{
				key: "noi_dung",
				label: t("colQuestionContent"),
				sortValue: (q) => q.noi_dung,
				render: (q) => (
					<AdminCellText maxLines={2} minWidth={260} maxWidth={440}>
						{q.noi_dung}
					</AdminCellText>
				),
			},
			{
				key: "phuong_an",
				label: t("colOptions"),
				render: (q) => (
					<div className={classes.optionsCell}>
						{q.dap_an.map((opt, idx) => {
							const letter = LETTERS[idx] ?? String(idx + 1);
							return (
								<Tooltip
									key={opt.id_dap_an}
									label={`${letter}. ${opt.noi_dung} (${opt.ten_mau} – ${opt.ten_ma_gen})`}
									withArrow
									multiline
									w={240}
								>
									<span
										className={classes.optionBadge}
										style={{
											backgroundColor: `${opt.ma_hex}1a`,
											color: opt.ma_hex,
											borderColor: `${opt.ma_hex}40`,
										}}
									>
										<span className={classes.swatchDot} style={{ backgroundColor: opt.ma_hex }} />
										{letter}
									</span>
								</Tooltip>
							);
						})}
					</div>
				),
			},
			{
				key: "dang_bat",
				label: t("colQuestionStatus"),
				sortValue: (q) => (q.dang_bat ? 1 : 0),
				render: (q) => (
					<AdminStatusBadge
						inactive={!q.dang_bat}
						activeLabel={t("statusActiveQuestion")}
						inactiveLabel={t("statusInactiveQuestion")}
						activeColor="teal"
						inactiveColor="gray"
					/>
				),
			},
		],
		[t]
	);

	function modalTitle() {
		if (!modal.viewing) return t("titleQuestions");
		if (modal.viewing.mode === "create") return t("createQuestionTitle");
		if (modal.viewing.mode === "edit") {
			return t("detailTitleQuestion", { number: modal.viewing.question?.thu_tu ?? "" });
		}
		return t("detailTitleViewQuestion", { number: modal.viewing.question?.thu_tu ?? "" });
	}

	return (
		<>
			{/* Bộ đo cân bằng mã gen đặt trên đầu bảng */}
			<QuestionBalance questions={data} colors={colors} />

			<AdminDataTable
				data={filteredData}
				getRowKey={(q) => String(q.id_cau_hoi)}
				columns={columns}
				defaultSort={{ key: "thu_tu", direction: "asc" }}
				searchPlaceholder={t("searchPlaceholderQuestions")}
				searchFields={(q) => [
					q.noi_dung,
					String(q.thu_tu),
					...q.dap_an.flatMap((opt) => [opt.noi_dung, opt.ten_mau, opt.ten_ma_gen]),
				]}
				filters={
					<Group gap={8} wrap="nowrap">
						<Select
							data={statusFilterOptions}
							value={statusFilter ?? ""}
							onChange={(val) => setStatusFilter(val || null)}
							placeholder={t("filterQuestionStatus")}
							w={140}
							size="sm"
						/>
						<Select
							data={geneFilterOptions}
							value={geneFilter ?? ""}
							onChange={(val) => setGeneFilter(val || null)}
							placeholder={t("filterGenePlaceholder")}
							w={150}
							size="sm"
						/>
					</Group>
				}
				actions={
					<Button
						size="sm"
						leftSection={<IconPlus size={16} />}
						onClick={() => modal.open({ mode: "create", question: null })}
					>
						{t("addQuestion")}
					</Button>
				}
				isError={isError}
				onRetry={() => refetch()}
				emptyText={t("emptyQuestions")}
				renderActions={(q) => (
					<>
						<AdminRowStandardActions
							onView={() => modal.open({ mode: "view", question: q })}
							viewLabel={t("viewDetail")}
							onEdit={() => modal.open({ mode: "edit", question: q })}
							editLabel={t("editQuestionOf", { number: q.thu_tu })}
							onDelete={() =>
								deleteQuestion.mutate(q.id_cau_hoi, {
									onSuccess: (res) => {
										showSuccessToast(
											(res as { message?: string })?.message ?? t("deleteQuestionSuccess")
										);
									},
									onError: (err) => {
										showErrorToast(err, t("saveError"));
									},
								})
							}
							deleteLabel={t("delete")}
							deleteConfirmText={t("deleteConfirmQuestion", { number: q.thu_tu })}
							isDeleting={deleteQuestion.isPending && deleteQuestion.variables === q.id_cau_hoi}
						/>

						{/* Nút bật / tắt trạng thái câu hỏi nhanh */}
						<AdminIconAction
							label={q.dang_bat ? t("toggleQuestionInactive") : t("toggleQuestionActive")}
							color={q.dang_bat ? "gray" : "teal"}
							loading={toggleStatus.isPending && toggleStatus.variables?.id === q.id_cau_hoi}
							onClick={() =>
								toggleStatus.mutate(
									{ id: q.id_cau_hoi, dang_bat: !q.dang_bat },
									{
										onSuccess: (res) => {
											showSuccessToast((res as { message?: string })?.message ?? t("saveSuccess"));
										},
										onError: (err) => {
											showErrorToast(err, t("saveError"));
										},
									}
								)
							}
						>
							{q.dang_bat ? (
								<IconEyeOff size={18} stroke={1.7} />
							) : (
								<IconCheck size={18} stroke={2} />
							)}
						</AdminIconAction>
					</>
				)}
			/>

			<AdminDetailModal opened={modal.opened} onClose={modal.close} title={modalTitle()} size="lg">
				{modal.viewing?.mode === "view" && modal.viewing.question ? (
					<QuestionDetail question={modal.viewing.question} />
				) : modal.viewing ? (
					<QuestionEditor
						question={modal.viewing.question}
						colors={colors}
						defaultNextOrder={maxOrder + 1}
						onClose={modal.close}
					/>
				) : null}
			</AdminDetailModal>
		</>
	);
}
