import { AdminLoginForm } from "@/components/admin";
import classes from "./page.module.css";

export default function AdminLoginPage() {
	return (
		<main className={classes.page}>
			<AdminLoginForm />
		</main>
	);
}
