"use client";

import { useEffect, useState } from "react";
import { Button, Text, Title, UnstyledButton } from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { OPTION_LETTERS } from "@/constants/app";
import { useQuiz } from "@/features/quiz/client/hooks";
import { playSfx } from "@/lib/sound";
import classes from "./QuizScreen.module.css";

export function QuizScreen() {
	const t = useTranslations("quiz");
	const { data: questions = [], isError, refetch } = useQuiz();
	const [index, setIndex] = useState(0);
	const [selected, setSelected] = useState<number[]>([]); // id_dap_an theo thứ tự câu
	const [done, setDone] = useState(false);

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

	function next() {
		if (chosen === undefined) return;
		if (isLast) setDone(true);
		else setIndex(index + 1);
	}

	function back() {
		if (index > 0) setIndex(index - 1);
	}

	// Phím 1–4 / A–D chọn đáp án, Enter hoặc → qua câu tiếp, ← về câu trước.
	// Bấm chuột đã có tiếng qua data-sfx (StudentSound); bàn phím không tạo click nên phát ở đây.
	useEffect(() => {
		if (done || !question) return;
		function onKey(event: KeyboardEvent) {
			if (event.metaKey || event.ctrlKey || event.altKey) return;
			if (event.key === "Enter" && event.target instanceof HTMLButtonElement) {
				// Enter trên nút Câu trước/Câu tiếp/vạch tiến trình: để nút tự xử lý (đã có tiếng).
				// Trên đáp án vừa bấm (còn giữ focus): chặn click lặp lại, Enter nghĩa là qua câu tiếp.
				if (event.target.getAttribute("role") !== "radio") return;
				event.preventDefault();
			}
			if (event.key === "Enter" || event.key === "ArrowRight") {
				if (chosen !== undefined) playSfx(isLast ? "success" : "next");
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

	if (done) {
		return (
			<div className={classes.screen}>
				<Title order={2}>{t("doneTitle")}</Title>
				<Text className={classes.note}>{t("doneNote")}</Text>
			</div>
		);
	}

	return (
		<div className={classes.screen}>
			<div className={classes.progress}>
				<div className={classes.progressHead}>
					<p className={classes.counter} aria-live="polite">
						<span className={classes.counterLabel}>{t("questionLabel")}</span>
						<span className={classes.counterCurrent}>{String(index + 1).padStart(2, "0")}</span>
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
							onClick={() => setIndex(i)}
						/>
					))}
				</div>
			</div>

			<Title order={2} key={index} className={classes.question}>
				{question.noi_dung}
			</Title>

			<div className={classes.options} role="radiogroup" aria-label={question.noi_dung}>
				{question.dap_an.map((option, i) => (
					<UnstyledButton
						key={option.id_dap_an}
						role="radio"
						aria-checked={chosen === option.id_dap_an}
						data-selected={chosen === option.id_dap_an || undefined}
						data-sfx="select"
						className={classes.option}
						onClick={() => choose(option.id_dap_an)}
					>
						<span className={classes.letter}>{OPTION_LETTERS[i]}</span>
						<span>{option.noi_dung}</span>
					</UnstyledButton>
				))}
			</div>

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
					disabled={chosen === undefined}
					data-sfx={isLast ? "success" : "next"}
					onClick={next}
				>
					{isLast ? t("finish") : t("next")}
				</Button>
			</div>
		</div>
	);
}
