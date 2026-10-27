"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { Button, Text, Title } from "@mantine/core";
import {
	IconBriefcase,
	IconCompass,
	IconHome,
	IconRefresh,
	IconSparkles,
	IconStars,
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ROUTES } from "@/constants/routes";
import { useLatestResult } from "@/features/quiz/client/hooks";
import type { GeneProfile } from "@/features/quiz/types";
import { fireDnaConfetti } from "@/lib/confetti";
import { playSfx } from "@/lib/sound";
import classes from "./ResultScreen.module.css";

// Tính độ sáng tương đối của mã màu #RRGGBB để tự chọn chữ tối trên nền Vàng (#FDD835)
function isLightHex(hex: string): boolean {
	const clean = hex.replace("#", "").trim();
	if (clean.length !== 6) return false;
	const r = parseInt(clean.slice(0, 2), 16) / 255;
	const g = parseInt(clean.slice(2, 4), 16) / 255;
	const b = parseInt(clean.slice(4, 6), 16) / 255;
	const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
	return luminance > 0.62;
}

function geneCssVars(hex: string, index = 0): CSSProperties {
	const light = isLightHex(hex);
	return {
		"--gene-color": hex,
		"--gene-ink": light ? "#1f1900" : "#ffffff",
		"--gene-accent": light ? "#b28704" : hex,
		"--card-index": index,
	} as CSSProperties;
}

export function ResultScreen() {
	const t = useTranslations("result");
	const router = useRouter();
	const { data: result, isError, refetch } = useLatestResult();
	const celebratedIdRef = useRef<number | null>(null);

	const geneMap = new Map<number, GeneProfile>(
		(result?.genes ?? []).map((gene) => [gene.id_mau_gen, gene])
	);

	const topIds = result?.top_mau_gen_ids ?? [];
	const topSet = new Set(topIds);
	const topGenes = topIds
		.map((id) => geneMap.get(id))
		.filter((gene): gene is GeneProfile => gene !== undefined);
	const topHexColors = topGenes.map((gene) => gene.ma_hex);

	// Tự động bắn pháo hoa + phát hợp âm chúc mừng nhẹ nhàng khi mở kết quả mới
	useEffect(() => {
		if (!result || celebratedIdRef.current === result.id_ket_qua) return;
		celebratedIdRef.current = result.id_ket_qua;
		const hexes = result.top_mau_gen_ids
			.map((id) => result.genes.find((g) => g.id_mau_gen === id)?.ma_hex)
			.filter((hex): hex is string => Boolean(hex));
		playSfx("celebrate");
		void fireDnaConfetti(hexes);
	}, [result]);

	function handleCelebrateAgain() {
		playSfx("celebrate");
		void fireDnaConfetti(topHexColors);
	}

	if (isError) {
		return (
			<div className={classes.screen}>
				<div className={classes.stateBox}>
					<Text className={classes.stateText}>{t("loadError")}</Text>
					<Button variant="default" onClick={() => refetch()}>
						{t("retry")}
					</Button>
				</div>
			</div>
		);
	}

	if (!result) return null;

	const totalPoints = result.bang_xep_hang.reduce((sum, item) => sum + item.diem, 0) || 12;
	const maxPoints = Math.max(...result.bang_xep_hang.map((item) => item.diem), 1);
	const scoreByGeneId = new Map(result.bang_xep_hang.map((item) => [item.id_mau_gen, item.diem]));
	const displayGenes = result.loai_ket_qua === "da_sac" ? result.genes : topGenes;
	const comboTitle = topGenes.map((g) => t("geneShort", { color: g.ten_mau })).join(" × ");

	return (
		<div className={classes.screen}>
			{/* Thanh chúc mừng đầu trang */}
			<header className={classes.header}>
				<div className={classes.headerIdentity}>
					<Text className={classes.station}>{t("station")}</Text>
					<div className={classes.studentMeta}>
						<span className={classes.celebrationPill}>
							<IconSparkles size={15} stroke={2.2} />
							<span>{t("celebrationBadge", { name: result.ho_ten })}</span>
						</span>
						<span className={classes.mssvPill}>{t("studentIdBadge", { mssv: result.mssv })}</span>
					</div>
				</div>

				<Button
					variant="light"
					radius="xl"
					size="sm"
					className={classes.fireworksBtn}
					leftSection={<IconStars size={17} stroke={2} />}
					onClick={handleCelebrateAgain}
				>
					{t("fireworksButton")}
				</Button>
			</header>

			{/* Khối tóm tắt khi kết quả là DNA kết hợp (2 gen), đồng hạng (3–5 gen), hoặc DNA đa sắc (6 gen) */}
			{result.loai_ket_qua !== "don" && (
				<section
					className={classes.summaryBanner}
					data-kind={result.loai_ket_qua}
					style={
						{
							"--combo-first": topGenes[0]?.ma_hex ?? "#1E4FA3",
							"--combo-second": topGenes[1]?.ma_hex ?? "#E53935",
						} as CSSProperties
					}
				>
					<div className={classes.summarySwatches} aria-hidden="true">
						{displayGenes.map((gene) => (
							<span
								key={gene.id_mau_gen}
								className={classes.summarySwatch}
								style={{ backgroundColor: gene.ma_hex }}
							/>
						))}
					</div>
					<span className={classes.kindBadge}>
						{result.loai_ket_qua === "ket_hop"
							? t("kindDualBadge")
							: result.loai_ket_qua === "dong_hang"
								? t("kindMultiBadge")
								: t("kindAllTieBadge")}
					</span>
					<Title order={1} className={classes.summaryTitle}>
						{result.loai_ket_qua === "da_sac" ? t("kindAllTieTitle") : comboTitle}
					</Title>
					<Text className={classes.summaryNotice}>
						{result.loai_ket_qua === "ket_hop"
							? t("kindDualSubtitle")
							: result.loai_ket_qua === "dong_hang"
								? t("kindMultiSubtitle", { count: topGenes.length })
								: t("kindAllTieNotice")}
					</Text>
				</section>
			)}

			{/* Thẻ hồ sơ chi tiết của từng mã gen nổi bật */}
			<section className={classes.geneGrid} data-single={displayGenes.length === 1 || undefined}>
				{displayGenes.map((gene, idx) => {
					const diem = scoreByGeneId.get(gene.id_mau_gen) ?? 0;
					return (
						<article
							key={gene.id_mau_gen}
							className={classes.geneCard}
							style={geneCssVars(gene.ma_hex, idx)}
						>
							<div className={classes.geneCardGlow} aria-hidden="true" />

							<div className={classes.geneCardTop}>
								<span className={classes.geneBadge}>
									<span className={classes.geneDot} />
									{result.loai_ket_qua === "don"
										? t("kindSingleBadge")
										: t("geneShort", { color: gene.ten_mau })}
								</span>
								<span className={classes.scorePill}>
									{t("scoreBadge", { score: diem, total: totalPoints })}
								</span>
							</div>

							<Title order={result.loai_ket_qua === "don" ? 1 : 2} className={classes.geneTitle}>
								{t("geneHeading", { color: gene.ten_mau, title: gene.ten_ma_gen })}
							</Title>

							{gene.tu_khoa.length > 0 && (
								<div className={classes.keywords} aria-label={t("keywordsLabel")}>
									{gene.tu_khoa.map((kw) => (
										<span key={kw} className={classes.keywordChip}>
											{kw}
										</span>
									))}
								</div>
							)}

							<Text className={classes.geneMeaning}>{gene.y_nghia}</Text>

							<div className={classes.geneDetails}>
								<div className={classes.detailBox}>
									<div className={classes.detailLabel}>
										<IconCompass size={17} stroke={2.1} />
										<span>{t("fieldsLabel")}</span>
									</div>
									<Text className={classes.detailContent}>{gene.linh_vuc}</Text>
								</div>

								<div className={classes.detailBox}>
									<div className={classes.detailLabel}>
										<IconBriefcase size={17} stroke={2.1} />
										<span>{t("skillsLabel")}</span>
									</div>
									<Text className={classes.detailContent}>{gene.ky_nang}</Text>
								</div>
							</div>
						</article>
					);
				})}
			</section>

			{/* Bảng phân bố điểm 6 mã gen + Thông điệp cuối trang */}
			<div className={classes.bottomGrid}>
				<section className={classes.rankingCard}>
					<div className={classes.rankingHeader}>
						<Title order={3} className={classes.sectionTitle}>
							{t("rankingTitle")}
						</Title>
						<Text className={classes.rankingSubtitle}>
							{t("rankingSubtitle", { total: totalPoints })}
						</Text>
					</div>

					<div className={classes.rankingList}>
						{result.bang_xep_hang.map((item, idx) => {
							const gene = geneMap.get(item.id_mau_gen);
							const hex = gene?.ma_hex ?? "#1E4FA3";
							const isTop = topSet.has(item.id_mau_gen);
							const barWidth = Math.max((item.diem / maxPoints) * 100, 6);

							return (
								<div
									key={item.id_mau_gen}
									className={classes.rankingRow}
									data-top={isTop || undefined}
									style={
										{
											"--row-color": hex,
											"--row-width": `${barWidth}%`,
											"--row-index": idx,
										} as CSSProperties
									}
								>
									<div className={classes.rankingRowHead}>
										<div className={classes.rankingNameWrap}>
											<span className={classes.rankingSwatch} />
											<span className={classes.rankingName}>
												{t("geneShort", { color: item.ten_mau })}
											</span>
											{gene?.ten_ma_gen && (
												<span className={classes.rankingRole}>· {gene.ten_ma_gen}</span>
											)}
											{isTop && <span className={classes.topBadge}>{t("topTag")}</span>}
										</div>
										<span className={classes.rankingScore}>
											{t("scoreUnit", { score: item.diem, total: totalPoints })}
										</span>
									</div>
									<div className={classes.rankingTrack} aria-hidden="true">
										<span className={classes.rankingFill} />
									</div>
								</div>
							);
						})}
					</div>
				</section>

				<section className={classes.closingCard}>
					<div className={classes.closingContent}>
						<Text className={classes.closingEyebrow}>{t("closingTitle")}</Text>
						<blockquote className={classes.closingQuote}>“{t("closingMessage")}”</blockquote>
					</div>

					<div className={classes.closingActions}>
						{result.cho_lam_lai ? (
							<Button
								size="md"
								radius="md"
								className={classes.primaryAction}
								leftSection={<IconRefresh size={18} stroke={2.2} />}
								onClick={() => router.push(ROUTES.QUIZ)}
							>
								{t("retakeButton")}
							</Button>
						) : (
							<Text className={classes.retakeDisabledNote}>{t("retakeDisabledHint")}</Text>
						)}

						<Button
							size="md"
							radius="md"
							variant="default"
							className={classes.secondaryAction}
							leftSection={<IconHome size={18} stroke={2} />}
							onClick={() => router.push(ROUTES.HOME)}
						>
							{t("backHomeButton")}
						</Button>
					</div>
				</section>
			</div>
		</div>
	);
}
