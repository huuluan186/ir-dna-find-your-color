"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { Button, Text, Title, UnstyledButton } from "@mantine/core";
import { IconArrowLeft, IconArrowRight, IconCheck, IconSparkles } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { DNA_COLORS, OPTION_LETTERS } from "@/constants/app";
import { ROUTES } from "@/constants/routes";
import { useQuiz, useSubmitQuiz } from "@/features/quiz/client/hooks";
import { HttpError } from "@/lib/http";
import { playSfx } from "@/lib/sound";
import classes from "./QuizScreen.module.css";

const MIN_DECODE_MS = 1550;

function getSubmitErrorCode(error: unknown): string | null {
	if (
		error instanceof HttpError &&
		error.data &&
		typeof error.data === "object" &&
		"code" in error.data
	) {
		return String((error.data as { code?: unknown }).code);
	}
	return null;
}

export function QuizScreen() {
	const t = useTranslations("quiz");
	const router = useRouter();
	const { data: questions = [], isError, refetch } = useQuiz();
	const submitMutation = useSubmitQuiz();

	const [index, setIndex] = useState(0);
	const [direction, setDirection] = useState<"forward" | "backward">("forward");
	const [selected, setSelected] = useState<number[]>([]); // id_dap_an theo thứ tự câu
	const [decoding, setDecoding] = useState(false);

	const question = questions[index];
	const chosen = selected[index];
	const isLast = index === questions.length - 1;
	const answeredCount = selected.filter((id) => id !== undefined).length;
	// Câu xa nhất được nhảy tới: câu chưa trả lời đầu tiên
	const firstUnanswered = questions.findIndex((_, i) => selected[i] === undefined);
	const reachable = firstUnanswered === -1 ? questions.length - 1 : firstUnanswered;

	function choose(optionId: number) {
		setSelected((prev) => {
			const next = [...prev];
			next[index] = optionId;
			return next;
		});
	}

	async function submitAnswers() {
		if (decoding) return;
		setDecoding(true);
		playSfx("decode");
		const waitMinDecode = new Promise((resolve) => setTimeout(resolve, MIN_DECODE_MS));
		try {
			await Promise.all([submitMutation.mutateAsync({ selected }), waitMinDecode]);
			router.push(ROUTES.RESULT);
		} catch {
			setDecoding(false);
		}
	}

	function next() {
		if (chosen === undefined || decoding) return;
		if (isLast) {
			void submitAnswers();
		} else {
			setDirection("forward");
			setIndex(index + 1);
		}
	}

	function back() {
		if (index > 0 && !decoding) {
			setDirection("backward");
			setIndex(index - 1);
		}
	}

	function jumpTo(targetIndex: number) {
		if (targetIndex === index || decoding) return;
		setDirection(targetIndex > index ? "forward" : "backward");
		setIndex(targetIndex);
	}

	// Phím 1–4 / A–D chọn đáp án, Enter hoặc → qua câu tiếp, ← về câu trước.
	// Bấm chuột đã có tiếng qua data-sfx (StudentSound); bàn phím không tạo click nên phát ở đây.
	useEffect(() => {
		if (decoding || !question) return;
		function onKey(event: KeyboardEvent) {
			if (event.metaKey || event.ctrlKey || event.altKey) return;
			if (event.key === "Enter" && event.target instanceof HTMLButtonElement) {
				// Enter trên nút Câu trước/Câu tiếp/vạch tiến trình: để nút tự xử lý (đã có tiếng).
				// Trên đáp án vừa bấm (còn giữ focus): chặn click lặp lại, Enter nghĩa là qua câu tiếp.
				if (event.target.getAttribute("role") !== "radio") return;
				event.preventDefault();
			}
			if (event.key === "Enter" || event.key === "ArrowRight") {
				if (chosen !== undefined && !isLast) playSfx("next");
				next();
				return;
			}
			if (event.key === "ArrowLeft") {
				if (index > 0) playSfx("back");
				back();
				return;
			}
			const key = event.key.toUpperCase();
			const pos = /^[1-4]$/.test(key) ? Number(key) - 1 : OPTION_LETTERS.indexOf(key);
			const option = pos >= 0 ? question.dap_an[pos] : undefined;
			if (option) {
				playSfx("select");
				choose(option.id_dap_an);
			}
		}
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	});

	if (isError) {
		return (
			<div className={classes.screen}>
				<Text className={classes.note}>{t("loadError")}</Text>
				<Button variant="default" onClick={() => refetch()}>
					{t("retry")}
				</Button>
			</div>
		);
	}

	if (!question) {
		return (
			<div className={classes.screen}>
				<Text className={classes.note}>{t("emptyQuiz")}</Text>
			</div>
		);
	}

	if (decoding) {
		return (
			<div className={classes.screen} aria-live="polite">
				<div className={classes.decodeCard}>
					<div className={classes.decodeRing} aria-hidden="true">
						<div className={classes.decodeCore} />
						{DNA_COLORS.map((hex, i) => (
							<span
								key={hex}
								className={classes.decodeOrb}
								style={
									{
										"--orb-color": hex,
										"--orb-index": i,
										"--orb-total": DNA_COLORS.length,
									} as CSSProperties
								}
							/>
						))}
					</div>
					<Text className={classes.decodeBadge}>{t("decodingBadge")}</Text>
					<Title order={2} className={classes.decodeTitle}>
						{t("decodingTitle")}
					</Title>
					<Text className={classes.decodeHint}>{t("decodingHint")}</Text>
					<div className={classes.decodeBar} aria-hidden="true">
						<span className={classes.decodeBarFill} />
					</div>
				</div>
			</div>
		);
	}

	const errorCode = submitMutation.isError ? getSubmitErrorCode(submitMutation.error) : null;

	return (
		<div className={classes.screen}>
			<div className={classes.progress}>
				<div className={classes.progressHead}>
					<p className={classes.counter} aria-live="polite">
						<span className={classes.counterLabel}>{t("questionLabel")}</span>
						<span key={index} className={classes.counterCurrent}>
							{String(index + 1).padStart(2, "0")}
						</span>
						<span className={classes.counterTotal}>/{questions.length}</span>
					</p>
					<Text className={classes.answered}>
						{t("answered", { count: answeredCount, total: questions.length })}
					</Text>
				</div>
				<div
					className={classes.segments}
					role="progressbar"
					aria-valuemin={0}
					aria-valuemax={questions.length}
					aria-valuenow={answeredCount}
					aria-label={t("counter", { current: index + 1, total: questions.length })}
				>
					{questions.map((q, i) => (
						<button
							key={q.id_cau_hoi}
							type="button"
							className={classes.segment}
							data-done={selected[i] !== undefined || undefined}
							data-current={i === index || undefined}
							disabled={i > reachable}
							aria-label={t("goTo", { number: i + 1 })}
							aria-current={i === index ? "step" : undefined}
							onClick={() => jumpTo(i)}
						/>
					))}
				</div>
			</div>

			<div key={question.id_cau_hoi} className={classes.stage} data-direction={direction}>
				<Title order={2} className={classes.question}>
					{question.noi_dung}
				</Title>

				<div className={classes.options} role="radiogroup" aria-label={question.noi_dung}>
					{question.dap_an.map((option, i) => {
						const isSelected = chosen === option.id_dap_an;
						return (
							<UnstyledButton
								key={option.id_dap_an}
								role="radio"
								aria-checked={isSelected}
								data-selected={isSelected || undefined}
								data-sfx="select"
								className={classes.option}
								style={{ "--option-index": i } as CSSProperties}
								onClick={() => choose(option.id_dap_an)}
							>
								<span className={classes.letter}>
									{isSelected ? <IconCheck size={16} stroke={2.8} /> : OPTION_LETTERS[i]}
								</span>
								<span className={classes.optionText}>{option.noi_dung}</span>
							</UnstyledButton>
						);
					})}
				</div>
			</div>

			{submitMutation.isError && (
				<div className={classes.errorBanner} role="alert">
					<Text className={classes.errorText}>
						{errorCode === "retake_disabled"
							? t("retakeDisabledError")
							: errorCode === "account_locked"
								? t("accountLockedError")
								: t("submitError")}
					</Text>
					{errorCode === "retake_disabled" && (
						<Button size="xs" variant="light" onClick={() => router.push(ROUTES.RESULT)}>
							{t("viewExistingResult")}
						</Button>
					)}
				</div>
			)}

			<div className={classes.actions}>
				{index > 0 && (
					<Button
						className={classes.back}
						variant="default"
						data-sfx="back"
						leftSection={<IconArrowLeft size={18} stroke={2.2} />}
						onClick={back}
					>
						{t("back")}
					</Button>
				)}
				<Button
					className={classes.next}
					data-finish={isLast && chosen !== undefined ? true : undefined}
					disabled={chosen === undefined}
					data-sfx={isLast ? undefined : "next"}
					rightSection={
						isLast ? (
							<IconSparkles size={19} stroke={2.2} />
						) : (
							<IconArrowRight size={18} stroke={2.2} />
						)
					}
					onClick={next}
				>
					{isLast ? t("finish") : t("next")}
				</Button>
			</div>
		</div>
	);
}
