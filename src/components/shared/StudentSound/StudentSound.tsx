"use client";

import { useEffect } from "react";
import { usePublicSound } from "@/features/sound/client/hooks";
import { enterStudentPage, leaveStudentPage, playSfx, setMusic, type SfxName } from "@/lib/sound";

const CLICKABLE = "[data-sfx], button, a[href], [role='radio'], [role='button']";

// Gắn trong StudentFrame: bật nhạc nền admin đã chọn và tiếng bấm cho mọi nút của trang sinh viên.
// Nút nào cần tiếng khác thì đặt data-sfx="select|next|back|page|success", không muốn có tiếng thì data-sfx="none".
export function StudentSound() {
	const { data } = usePublicSound();

	useEffect(() => {
		enterStudentPage(window.location.pathname);
		return leaveStudentPage;
	}, []);

	useEffect(() => {
		if (data) void setMusic(data.src, data.volume, data.effects);
	}, [data]);

	useEffect(() => {
		function onClick(event: MouseEvent) {
			const target = event.target instanceof Element ? event.target.closest(CLICKABLE) : null;
			if (!target || target.matches(":disabled, [aria-disabled='true'], [data-disabled]")) return;
			const name = target.getAttribute("data-sfx") ?? "tap";
			if (name !== "none") playSfx(name as SfxName);
		}
		// Pha capture: chạy trước onClick của React. Nếu chạy sau, nút "Câu tiếp theo" đã bị disabled
		// (câu mới chưa chọn đáp án) nên bị bỏ qua, không có tiếng.
		document.addEventListener("click", onClick, true);
		return () => document.removeEventListener("click", onClick, true);
	}, []);

	return null;
}
