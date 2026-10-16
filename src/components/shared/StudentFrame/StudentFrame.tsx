import type { ReactNode } from "react";
import { StudentSound } from "../StudentSound";
import classes from "./StudentFrame.module.css";

// Khung giao diện sinh viên: toàn màn hình trên điện thoại, thẻ ~480px ở giữa trên màn hình lớn.
// Kèm nhạc nền và tiếng bấm (StudentSound) cho mọi trang sinh viên.
export function StudentFrame({ children }: { children: ReactNode }) {
	return (
		<div className={classes.outer}>
			<StudentSound />
			<main className={classes.frame}>{children}</main>
		</div>
	);
}
