import type { ReactNode } from "react";
import classes from "./StudentFrame.module.css";

// Khung giao diện sinh viên: toàn màn hình trên điện thoại, thẻ ~480px ở giữa trên màn hình lớn.
export function StudentFrame({ children }: { children: ReactNode }) {
	return (
		<div className={classes.outer}>
			<main className={classes.frame}>{children}</main>
		</div>
	);
}
