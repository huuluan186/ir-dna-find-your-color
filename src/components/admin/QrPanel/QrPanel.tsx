"use client";

import { useMemo, useRef, useState, useSyncExternalStore } from "react";
import {
	ActionIcon,
	Button,
	Group,
	SegmentedControl,
	Switch,
	Text,
	TextInput,
	Tooltip,
} from "@mantine/core";
import { useClipboard } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import {
	IconCheck,
	IconCopy,
	IconDownload,
	IconExternalLink,
	IconFileVector,
	IconPrinter,
	IconWorld,
} from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { QRCodeCanvas, QRCodeSVG } from "qrcode.react";
import { AdminDetailShell } from "@/components/admin/AdminDetailModal";
import { DNA_COLORS, QR_DEFAULTS } from "@/constants/app";
import { useAdminColors } from "@/features/admin/client/hooks";
import type { AdminColorRow } from "@/features/admin/types";
import classes from "./QrPanel.module.css";

type ErrorLevel = "M" | "Q" | "H";
type ExportSize = (typeof QR_DEFAULTS.EXPORT_SIZES)[number];

const noopSubscribe = () => () => {};

function getDefaultOrigin(): string {
	if (
		typeof window !== "undefined" &&
		window.location.origin &&
		(QR_DEFAULTS.FALLBACK_URL.includes("localhost") || !process.env.NEXT_PUBLIC_APP_URL)
	) {
		return window.location.origin;
	}
	return QR_DEFAULTS.FALLBACK_URL;
}

export function QrPanel() {
	const t = useTranslations("admin");
	const { data, isError } = useAdminColors();

	return (
		<AdminDetailShell isLoading={!data} isError={isError} errorText={t("loadError")}>
			{data && <QrPanelContent colors={data} />}
		</AdminDetailShell>
	);
}

function QrPanelContent({ colors }: { colors: AdminColorRow[] }) {
	const t = useTranslations("admin");
	const clipboard = useClipboard({ timeout: 2000 });
	const svgRef = useRef<SVGSVGElement | null>(null);
	const canvasRef = useRef<HTMLCanvasElement | null>(null);

	const defaultUrl = useSyncExternalStore(
		noopSubscribe,
		getDefaultOrigin,
		() => QR_DEFAULTS.FALLBACK_URL
	);
	const [customUrl, setCustomUrl] = useState<string | null>(null);
	const targetUrl = customUrl ?? defaultUrl;

	const [fgColor, setFgColor] = useState<string>(QR_DEFAULTS.DEFAULT_FG_COLOR);
	const [exportSize, setExportSize] = useState<ExportSize>(QR_DEFAULTS.DEFAULT_EXPORT_SIZE);
	const [errorLevel, setErrorLevel] = useState<ErrorLevel>("H");
	const [includeMargin, setIncludeMargin] = useState<boolean>(true);

	const qrValue = targetUrl.trim() || QR_DEFAULTS.FALLBACK_URL;
	const marginSize = includeMargin ? 4 : 0;

	// Bảng màu chọn cho mã QR: Đen chuẩn, Xanh IR DNA và các màu gen (trừ màu quá sáng như Vàng)
	const colorChoices = useMemo(() => {
		const presets: { key: string; label: string; hex: string }[] = [
			{ key: "black", label: t("qrColorBlack"), hex: QR_DEFAULTS.DEFAULT_FG_COLOR },
			{ key: "dna", label: t("qrColorDna"), hex: QR_DEFAULTS.DNA_FG_COLOR },
		];
		const seen = new Set(presets.map((p) => p.hex.toUpperCase()));

		for (const c of colors) {
			const upper = c.ma_hex.toUpperCase();
			if (seen.has(upper) || upper === "#FDD835") continue;
			seen.add(upper);
			presets.push({
				key: `gene-${c.id_mau_gen}`,
				label: c.ten_mau,
				hex: c.ma_hex,
			});
		}
		return presets;
	}, [colors, t]);

	function handleCopyUrl() {
		clipboard.copy(qrValue);
		notifications.show({
			color: "teal",
			message: t("qrCopiedUrl"),
		});
	}

	function handleUseCurrentOrigin() {
		if (typeof window !== "undefined" && window.location.origin) {
			setCustomUrl(window.location.origin);
		}
	}

	function handleDownloadPng() {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const dataUrl = canvas.toDataURL("image/png");
		const link = document.createElement("a");
		link.href = dataUrl;
		link.download = `${QR_DEFAULTS.FILE_NAME_PREFIX}-${exportSize}px.png`;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);

		notifications.show({
			color: "teal",
			message: t("qrDownloadedPng"),
		});
	}

	function handleDownloadSvg() {
		const svg = svgRef.current;
		if (!svg) return;
		const serializer = new XMLSerializer();
		let source = serializer.serializeToString(svg);
		if (!source.includes('xmlns="http://www.w3.org/2000/svg"')) {
			source = source.replace("<svg", '<svg xmlns="http://www.w3.org/2000/svg"');
		}
		const blob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		link.download = `${QR_DEFAULTS.FILE_NAME_PREFIX}.svg`;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(url);

		notifications.show({
			color: "teal",
			message: t("qrDownloadedSvg"),
		});
	}

	function handlePrintPoster() {
		if (typeof window !== "undefined") {
			window.print();
		}
	}

	const barColors = colors.length > 0 ? colors.map((c) => c.ma_hex) : DNA_COLORS;

	return (
		<div className={classes.wrapper}>
			<div className={classes.topGrid}>
				{/* Cột trái: Thẻ Poster QR Trạm 2 */}
				<section className={`${classes.posterCard} ${classes.posterSection}`}>
					<div className={classes.dnaBar} aria-hidden="true">
						{barColors.map((hex, index) => (
							<span key={`${hex}-${index}`} style={{ backgroundColor: hex }} />
						))}
					</div>

					<span className={classes.stationBadge}>{t("qrStationBadge")}</span>

					<Text component="h2" className={classes.posterHeading}>
						{t("qrPosterHeading")}
					</Text>

					<Text className={classes.posterSubheading}>{t("qrPosterSubheading")}</Text>

					<div className={classes.qrFrame}>
						<QRCodeSVG
							ref={svgRef}
							value={qrValue}
							size={QR_DEFAULTS.PREVIEW_SIZE}
							bgColor={QR_DEFAULTS.BG_COLOR}
							fgColor={fgColor}
							level={errorLevel}
							marginSize={marginSize}
							title={t("qrPosterHeading")}
						/>
					</div>

					{/* Canvas độ phân giải cao ẩn để xuất PNG sắc nét theo kích thước đã chọn */}
					<div className={classes.hiddenCanvas} aria-hidden="true">
						<QRCodeCanvas
							ref={canvasRef}
							value={qrValue}
							size={exportSize}
							bgColor={QR_DEFAULTS.BG_COLOR}
							fgColor={fgColor}
							level={errorLevel}
							marginSize={marginSize}
						/>
					</div>

					<Text className={classes.posterUrl}>{qrValue}</Text>
					<Text className={classes.posterScanHint}>{t("qrScanCta")}</Text>
				</section>

				{/* Cột phải: Tuỳ chỉnh URL, màu sắc, kích thước và Xuất file */}
				<section className={`${classes.card} ${classes.hideOnPrint}`}>
					<div className={classes.cardHead}>
						<Text component="h2" className={classes.cardTitle}>
							{t("qrConfigTitle")}
						</Text>
						<Text className={classes.cardHint}>{t("qrConfigHint")}</Text>
					</div>

					<div className={classes.configBody}>
						<div className={classes.fieldBlock}>
							<div className={classes.urlHeader}>
								<Text className={classes.fieldLabel}>{t("qrUrlLabel")}</Text>
								<Button
									variant="subtle"
									size="compact-xs"
									leftSection={<IconWorld size={14} />}
									onClick={handleUseCurrentOrigin}
								>
									{t("qrUseCurrentOrigin")}
								</Button>
							</div>
							<div className={classes.urlInputRow}>
								<TextInput
									value={targetUrl}
									onChange={(event) => setCustomUrl(event.currentTarget.value)}
									placeholder={t("qrUrlPlaceholder")}
									aria-label={t("qrUrlLabel")}
									className={classes.urlInput}
								/>
								<Group gap={6} wrap="nowrap">
									<Tooltip label={clipboard.copied ? t("qrCopiedUrl") : t("qrCopyUrl")}>
										<ActionIcon
											variant="default"
											size={36}
											aria-label={t("qrCopyUrl")}
											onClick={handleCopyUrl}
										>
											{clipboard.copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
										</ActionIcon>
									</Tooltip>
									<Tooltip label={t("qrOpenUrl")}>
										<ActionIcon
											component="a"
											href={qrValue}
											target="_blank"
											rel="noopener noreferrer"
											variant="default"
											size={36}
											aria-label={t("qrOpenUrl")}
										>
											<IconExternalLink size={16} />
										</ActionIcon>
									</Tooltip>
								</Group>
							</div>
						</div>

						<div className={classes.fieldBlock}>
							<Text className={classes.fieldLabel}>{t("qrColorLabel")}</Text>
							<div className={classes.swatchGrid}>
								{colorChoices.map((item) => {
									const active = fgColor.toUpperCase() === item.hex.toUpperCase();
									return (
										<button
											key={item.key}
											type="button"
											className={classes.colorOption}
											data-active={active || undefined}
											onClick={() => setFgColor(item.hex)}
										>
											<span className={classes.colorDot} style={{ backgroundColor: item.hex }} />
											<span>{item.label}</span>
										</button>
									);
								})}
							</div>
						</div>

						<div className={classes.optionsGrid}>
							<div className={classes.fieldBlock}>
								<Text className={classes.fieldLabel}>{t("qrSizeLabel")}</Text>
								<SegmentedControl
									value={String(exportSize)}
									onChange={(val) => setExportSize(Number(val) as ExportSize)}
									data={[
										{ value: "512", label: t("qrSize512") },
										{ value: "1024", label: t("qrSize1024") },
										{ value: "2048", label: t("qrSize2048") },
									]}
									size="xs"
									fullWidth
								/>
							</div>

							<div className={classes.fieldBlock}>
								<Text className={classes.fieldLabel}>{t("qrErrorLevelLabel")}</Text>
								<SegmentedControl
									value={errorLevel}
									onChange={(val) => setErrorLevel(val as ErrorLevel)}
									data={[
										{ value: "M", label: t("qrErrorLevelM") },
										{ value: "Q", label: t("qrErrorLevelQ") },
										{ value: "H", label: t("qrErrorLevelH") },
									]}
									size="xs"
									fullWidth
								/>
							</div>
						</div>

						<Switch
							checked={includeMargin}
							onChange={(event) => setIncludeMargin(event.currentTarget.checked)}
							label={t("qrIncludeMargin")}
							size="md"
						/>

						<div className={classes.exportRow}>
							<Button
								className={classes.exportButton}
								leftSection={<IconDownload size={16} stroke={1.8} />}
								onClick={handleDownloadPng}
							>
								{t("qrDownloadPng", { size: exportSize })}
							</Button>
							<Button
								variant="default"
								className={classes.exportButton}
								leftSection={<IconFileVector size={16} stroke={1.8} />}
								onClick={handleDownloadSvg}
							>
								{t("qrDownloadSvg")}
							</Button>
							<Button
								variant="default"
								className={classes.exportButton}
								leftSection={<IconPrinter size={16} stroke={1.8} />}
								onClick={handlePrintPoster}
							>
								{t("qrPrintPoster")}
							</Button>
						</div>
					</div>
				</section>
			</div>
		</div>
	);
}
