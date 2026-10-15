"use client";

import { useEffect, useMemo, useState } from "react";
import { Button, Progress, Text, Title, UnstyledButton } from "@mantine/core";
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

	// Phím 1–4 / A–D chọn đáp án, Enter qua câu tiếp
	useEffect(() => {
		if (done) return;
		function onKey(event: KeyboardEvent) {
			if (event.metaKey || event.ctrlKey || event.altKey) return;
			if (event.key === "Enter") {
				next();
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
			<div>
				<Text className={classes.counter}>
					{t("counter", { current: index + 1, total: QUESTIONS.length })}
				</Text>
				<Progress value={((index + 1) / QUESTIONS.length) * 100} size="sm" radius="xl" />
			</div>

			<Title order={2} className={classes.question}>
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

			<Button className={classes.next} fullWidth disabled={chosen === undefined} onClick={next}>
				{isLast ? t("finish") : t("next")}
			</Button>
		</div>
	);
}
