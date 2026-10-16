"use client";

import { useEffect, useMemo, useState } from "react";
import { Button, Text, Title, UnstyledButton } from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { OPTION_LETTERS } from "@/constants/app";
import { score } from "@/lib/scoring";
import { MOCK_CAU_HOI, MOCK_MAU_GEN } from "@/mock-data/quiz";
import classes from "./QuizScreen.module.css";

const QUESTIONS = MOCK_CAU_HOI.filter((q) => q.dang_bat).sort((a, b) => a.thu_tu - b.thu_tu);

export function QuizScreen() {
	const t = useTranslations("quiz");
	const [index, setIndex] = useState(0);
	const [selected, setSelected] = useState<number[]>([]); // id_dap_an theo thứ tự câu
	const [done, setDone] = useState(false);

	const question = QUESTIONS[index];
	const chosen = selected[index];
	const isLast = index === QUESTIONS.length - 1;
	const answeredCount = selected.filter((id) => id !== undefined).length;
	// Câu xa nhất được nhảy tới: câu chưa trả lời đầu tiên
	const firstUnanswered = QUESTIONS.findIndex((_, i) => selected[i] === undefined);
	const reachable = firstUnanswered === -1 ? QUESTIONS.length - 1 : firstUnanswered;

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

	// Phím 1–4 / A–D chọn đáp án, Enter hoặc → qua câu tiếp, ← về câu trước
	useEffect(() => {
		if (done) return;
		function onKey(event: KeyboardEvent) {
			if (event.metaKey || event.ctrlKey || event.altKey) return;
			if (event.key === "Enter" || event.key === "ArrowRight") {
				next();
				return;
			}
			if (event.key === "ArrowLeft") {
				back();
				return;
			}
			const key = event.key.toUpperCase();
			const pos = /^[1-4]$/.test(key) ? Number(key) - 1 : OPTION_LETTERS.indexOf(key);
			const option = pos >= 0 ? question.dap_an[pos] : undefined;
			if (option) choose(option.id_dap_an);
		}
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	});

	const result = useMemo(() => {
		if (!done) return null;
		return score({
			colorIds: MOCK_MAU_GEN.map((g) => g.id_mau_gen),
			questions: QUESTIONS.map((q) => ({
				id: q.id_cau_hoi,
				options: q.dap_an.map((o) => ({ id: o.id_dap_an, colorId: o.id_mau_gen })),
			})),
			selected,
		});
	}, [done, selected]);

	if (result) {
		const top = MOCK_MAU_GEN.filter((g) => result.topColorIds.includes(g.id_mau_gen));
		return (
			<div className={classes.screen}>
				<Title order={2}>{t("doneTitle")}</Title>
				<Text className={classes.note}>{t("doneNote")}</Text>
				<ul className={classes.topList}>
					{top.map((g) => (
						<li key={g.id_mau_gen}>
							<span className={classes.dot} style={{ backgroundColor: g.ma_hex }} />
							{g.ten_mau} – {g.ten_ma_gen}
						</li>
					))}
				</ul>
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
						<span className={classes.counterTotal}>/{QUESTIONS.length}</span>
					</p>
					<Text className={classes.answered}>
						{t("answered", { count: answeredCount, total: QUESTIONS.length })}
					</Text>
				</div>
				<div
					className={classes.segments}
					role="progressbar"
					aria-valuemin={0}
					aria-valuemax={QUESTIONS.length}
					aria-valuenow={answeredCount}
					aria-label={t("counter", { current: index + 1, total: QUESTIONS.length })}
				>
					{QUESTIONS.map((q, i) => (
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
						leftSection={<IconArrowLeft size={18} stroke={2.2} />}
						onClick={back}
					>
						{t("back")}
					</Button>
				)}
				<Button className={classes.next} disabled={chosen === undefined} onClick={next}>
					{isLast ? t("finish") : t("next")}
				</Button>
			</div>
		</div>
	);
}
