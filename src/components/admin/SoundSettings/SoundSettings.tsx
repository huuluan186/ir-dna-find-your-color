"use client";

import { useEffect, useRef, useState } from "react";
import {
	ActionIcon,
	Badge,
	Button,
	FileButton,
	Group,
	Radio,
	Slider,
	Stack,
	Switch,
	Text,
} from "@mantine/core";
import { useDebouncedCallback } from "@mantine/hooks";
import {
	IconPlayerPauseFilled,
	IconPlayerPlayFilled,
	IconTrash,
	IconUpload,
} from "@tabler/icons-react";
import { useFormatter, useTranslations } from "next-intl";
import { AdminDetailShell } from "@/components/admin/AdminDetailModal";
import { AdminConfirmAction } from "@/components/admin/AdminRowActions";
import { BGM_PRESETS, SOUND } from "@/constants/sound";
import { getSoundErrorCode } from "@/features/sound/client/api";
import {
	useAdminSound,
	useDeleteMusic,
	useSaveSoundSettings,
	useUploadMusic,
} from "@/features/sound/client/hooks";
import type { MusicChoice, SoundErrorCode, SoundSettings } from "@/features/sound/schema";
import type { AdminSound, UploadedMusic } from "@/features/sound/types";
import { playPreview, setPreviewVolume, stopPreview } from "@/lib/sound";
import classes from "./SoundSettings.module.css";

const ERROR_KEYS: Record<SoundErrorCode, string> = {
	file_missing: "errorFileMissing",
	file_too_large: "errorFileTooLarge",
	file_type: "errorFileType",
	in_use: "errorInUse",
	not_found: "errorNotFound",
};

const MAX_MB = SOUND.MAX_UPLOAD_BYTES / 1024 / 1024;
const DEFAULT_CHOICE: MusicChoice = { nguon: "co_san", ma: SOUND.DEFAULT_PRESET };
// Kéo thanh âm lượng: chỉ lưu khi ngừng kéo một lúc
const VOLUME_SAVE_DELAY_MS = 400;

// Radio cần giá trị chuỗi: "co_san:<mã>" hoặc "tai_len:<id>"
function choiceToKey(choice: MusicChoice) {
	return choice.nguon === "co_san" ? `co_san:${choice.ma}` : `tai_len:${choice.id_nhac_nen}`;
}

function keyToChoice(key: string): MusicChoice {
	const [nguon, value] = key.split(":");
	return nguon === "tai_len"
		? { nguon: "tai_len", id_nhac_nen: Number(value) }
		: { nguon: "co_san", ma: value as (typeof BGM_PRESETS)[number]["ma"] };
}

// Trang "Hệ thống → Âm thanh": bật/tắt nhạc nền, âm lượng, hiệu ứng, chọn bài, tải lên/xoá bài.
// Không có nút Lưu: mỗi thao tác tự lưu (xem useSaveSoundSettings).
export function SoundSettings() {
	const t = useTranslations("adminSound");
	const { data, isError } = useAdminSound();

	return (
		<AdminDetailShell isLoading={!data} isError={isError} errorText={t("loadError")}>
			{data && <SoundSettingsPanel data={data} />}
		</AdminDetailShell>
	);
}

type Notice = { tone: "ok" | "error"; text: string };

function SoundSettingsPanel({ data }: { data: AdminSound }) {
	const t = useTranslations("adminSound");
	const format = useFormatter();
	const save = useSaveSoundSettings();
	const upload = useUploadMusic();
	const remove = useDeleteMusic();
	const resetFileRef = useRef<() => void>(null);
	const [playing, setPlaying] = useState<string | null>(null);
	const [notice, setNotice] = useState<Notice | null>(null);

	// Cài đặt trong cache (đã cập nhật ngay khi bấm nhờ optimistic update)
	const { settings } = data;
	// Bản mới nhất để ghép thay đổi: cập nhật ngay khi bấm (trước khi cache kịp đổi) và khi cache đổi
	const settingsRef = useRef(settings);
	useEffect(() => {
		settingsRef.current = settings;
	}, [settings]);

	// Bài đã chọn được giữ lại khi tắt nhạc, để bật lại thì phát đúng bài cũ
	const [lastChoice, setLastChoice] = useState<MusicChoice>(settings.nhac_nen ?? DEFAULT_CHOICE);
	const choice = settings.nhac_nen ?? lastChoice;
	const enabled = settings.nhac_nen !== null;

	// Giá trị thanh âm lượng trong lúc đang kéo, chưa lưu
	const [volumeDraft, setVolumeDraft] = useState<number | null>(null);
	const volume = volumeDraft ?? settings.am_luong;

	// Rời trang thì dừng bài đang nghe thử
	useEffect(() => stopPreview, []);

	useEffect(() => setPreviewVolume(volume / 100), [volume]);

	function errorText(error: unknown) {
		const code = getSoundErrorCode(error);
		return code ? t(ERROR_KEYS[code], { size: MAX_MB }) : t("errorServer");
	}

	// Ghép thay đổi vào cài đặt mới nhất (qua ref, để lần lưu trễ của thanh âm lượng không ghi đè
	// thay đổi khác vừa bấm) rồi lưu
	function saveSettings(patch: Partial<SoundSettings>, onSettled?: () => void) {
		const next = { ...settingsRef.current, ...patch };
		settingsRef.current = next;
		setNotice(null);
		save.mutate(next, {
			onSuccess: () => setNotice({ tone: "ok", text: t("saved") }),
			onError: (error) => setNotice({ tone: "error", text: errorText(error) }),
			onSettled,
		});
	}

	// Bỏ giá trị tạm sau khi lưu xong (cache đã có giá trị mới), trừ khi admin đang kéo tiếp
	const saveVolume = useDebouncedCallback((value: number) => {
		saveSettings({ am_luong: value }, () =>
			setVolumeDraft((draft) => (draft === value ? null : draft))
		);
	}, VOLUME_SAVE_DELAY_MS);

	function selectMusic(key: string) {
		const next = keyToChoice(key);
		setLastChoice(next);
		saveSettings({ nhac_nen: next });
	}

	function togglePreview(key: string, src: string) {
		if (playing === key) {
			stopPreview();
			setPlaying(null);
			return;
		}
		setPlaying(key);
		void playPreview(src, Math.max(volume, 20) / 100, () =>
			setPlaying((current) => (current === key ? null : current))
		);
	}

	function handleUpload(file: File | null) {
		resetFileRef.current?.();
		if (!file) return;
		setNotice(null);
		if (file.size > SOUND.MAX_UPLOAD_BYTES) {
			setNotice({ tone: "error", text: t("errorFileTooLarge", { size: MAX_MB }) });
			return;
		}
		upload.mutate(file, {
			onSuccess: () => setNotice({ tone: "ok", text: t("uploaded") }),
			onError: (error) => setNotice({ tone: "error", text: errorText(error) }),
		});
	}

	function handleDelete(music: UploadedMusic) {
		const key = `tai_len:${music.id_nhac_nen}`;
		setNotice(null);
		remove.mutate(music.id_nhac_nen, {
			onSuccess: () => {
				if (playing === key) togglePreview(key, music.src);
				if (choiceToKey(lastChoice) === key) setLastChoice(DEFAULT_CHOICE);
				setNotice({ tone: "ok", text: t("deleted", { name: music.ten }) });
			},
			onError: (error) => setNotice({ tone: "error", text: errorText(error) }),
		});
	}

	const presetRows = BGM_PRESETS.map((preset) => (
		<TrackRow
			key={preset.ma}
			value={`co_san:${preset.ma}`}
			name={t(preset.labelKey)}
			meta={t("presetMeta")}
			badge={t("presetBadge")}
			disabled={!enabled}
			playing={playing === `co_san:${preset.ma}`}
			onPreview={() => togglePreview(`co_san:${preset.ma}`, preset.src)}
		/>
	));

	const uploadRows = data.uploads.map((music) => (
		<TrackRow
			key={music.id_nhac_nen}
			value={`tai_len:${music.id_nhac_nen}`}
			name={music.ten}
			meta={t("uploadMeta", {
				size: format.number(music.kich_thuoc / 1024 / 1024, { maximumFractionDigits: 1 }),
				date: format.dateTime(new Date(music.created_at), { dateStyle: "short" }),
			})}
			badge={t("uploadBadge")}
			disabled={!enabled}
			playing={playing === `tai_len:${music.id_nhac_nen}`}
			onPreview={() => togglePreview(`tai_len:${music.id_nhac_nen}`, music.src)}
			onDelete={() => handleDelete(music)}
			deleting={remove.isPending && remove.variables === music.id_nhac_nen}
		/>
	));

	const saving = save.isPending || volumeDraft !== null;
	const status: { tone?: string; text: string } = saving
		? { tone: "pending", text: t("saving") }
		: (notice ?? { text: t("autoSaveHint") });

	return (
		<div className={classes.wrapper}>
			<Text
				className={classes.notice}
				data-tone={status.tone}
				role={status.tone === "error" ? "alert" : "status"}
			>
				{status.text}
			</Text>

			<section className={classes.card}>
				<div className={classes.cardHead}>
					<Text component="h2" className={classes.cardTitle}>
						{t("playbackTitle")}
					</Text>
					<Text className={classes.cardHint}>{t("playbackHint")}</Text>
				</div>
				<Stack gap="lg">
					<Switch
						checked={enabled}
						onChange={(event) =>
							saveSettings({ nhac_nen: event.currentTarget.checked ? lastChoice : null })
						}
						label={t("musicEnabled")}
						size="md"
					/>
					<div>
						<Group justify="space-between" mb={8}>
							<Text className={classes.fieldLabel}>{t("volume")}</Text>
							<Text className={classes.volumeValue}>{volume}%</Text>
						</Group>
						<Slider
							value={volume}
							onChange={(value) => {
								setVolumeDraft(value);
								saveVolume(value);
							}}
							min={0}
							max={100}
							step={5}
							label={(value) => `${value}%`}
							disabled={!enabled}
							aria-label={t("volume")}
							className={classes.slider}
						/>
					</div>
					<Switch
						checked={settings.hieu_ung}
						onChange={(event) => saveSettings({ hieu_ung: event.currentTarget.checked })}
						label={t("effects")}
						description={t("effectsHint")}
						size="md"
					/>
				</Stack>
			</section>

			<section className={classes.card}>
				<div className={classes.libraryHead}>
					<div className={classes.cardHead}>
						<Text component="h2" className={classes.cardTitle}>
							{t("libraryTitle")}
						</Text>
						<Text className={classes.cardHint}>{t("libraryHint", { size: MAX_MB })}</Text>
					</div>
					<FileButton resetRef={resetFileRef} accept={SOUND.UPLOAD_ACCEPT} onChange={handleUpload}>
						{(props) => (
							<Button
								{...props}
								variant="default"
								className={classes.uploadButton}
								leftSection={<IconUpload size={16} stroke={1.8} />}
								loading={upload.isPending}
							>
								{t("upload")}
							</Button>
						)}
					</FileButton>
				</div>

				<Radio.Group
					value={choiceToKey(choice)}
					onChange={selectMusic}
					aria-label={t("libraryTitle")}
				>
					<div className={classes.list}>
						{presetRows}
						{uploadRows}
					</div>
				</Radio.Group>
				{!enabled && <Text className={classes.cardHint}>{t("musicOffHint")}</Text>}
			</section>
		</div>
	);
}

function TrackRow({
	value,
	name,
	meta,
	badge,
	disabled,
	playing,
	onPreview,
	onDelete,
	deleting,
}: {
	value: string;
	name: string;
	meta: string;
	badge: string;
	disabled: boolean;
	playing: boolean;
	onPreview: () => void;
	onDelete?: () => void;
	deleting?: boolean;
}) {
	const t = useTranslations("adminSound");
	const previewLabel = playing ? t("stopPreview") : t("preview");

	return (
		<div className={classes.track}>
			<ActionIcon
				variant={playing ? "filled" : "default"}
				radius="xl"
				size={36}
				aria-label={`${previewLabel}: ${name}`}
				aria-pressed={playing}
				onClick={onPreview}
			>
				{playing ? <IconPlayerPauseFilled size={15} /> : <IconPlayerPlayFilled size={15} />}
			</ActionIcon>
			<Radio
				value={value}
				label={name}
				description={meta}
				disabled={disabled}
				className={classes.radio}
				classNames={{ label: classes.trackName, body: classes.radioBody }}
			/>
			<Badge variant="light" color="gray" radius="xl" className={classes.badge}>
				{badge}
			</Badge>
			{onDelete && (
				<AdminConfirmAction
					label={t("delete")}
					ariaLabel={`${t("delete")}: ${name}`}
					confirmText={t("deleteConfirm", { name })}
					cancelLabel={t("cancel")}
					size={36}
					loading={deleting}
					withTooltip={false}
					onConfirm={onDelete}
				>
					<IconTrash size={17} stroke={1.7} />
				</AdminConfirmAction>
			)}
		</div>
	);
}
