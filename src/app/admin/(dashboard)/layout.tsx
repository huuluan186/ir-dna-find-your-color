import { Suspense, type ReactNode } from "react";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin";
import { ROUTES } from "@/constants/routes";
import { isAdmin } from "@/lib/session";

// proxy.ts đã chặn sớm; ở đây kiểm tra lại phiên ngay trước khi hiện dữ liệu
export default function AdminDashboardLayout({ children }: { children: ReactNode }) {
	return (
		<AdminShell>
			<Suspense fallback={null}>
				<AdminGate>{children}</AdminGate>
			</Suspense>
		</AdminShell>
	);
}

async function AdminGate({ children }: { children: ReactNode }) {
	if (!(await isAdmin())) redirect(ROUTES.ADMIN.LOGIN);
	return children;
}
