"use client";

import { Suspense, type ReactNode } from "react";
import { AppShell, Burger, Button, ScrollArea, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconLogout } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ADMIN_NAV } from "@/constants/admin-nav";
import { ROUTES } from "@/constants/routes";
import { useLogoutAdmin } from "@/features/auth/client/hooks";
import classes from "./AdminShell.module.css";

const ALL_ITEMS = ADMIN_NAV.flatMap((group) => group.items);

// Khung trang quản trị: sidebar cao hết màn hình (logo ở trên), banner tiêu đề trang bên phải.
// Thanh ngôn ngữ/giao diện dùng chung được CSS đặt vào góc phải banner, ngang hàng logo.
export function AdminShell({ children }: { children: ReactNode }) {
	const t = useTranslations("admin");
	const router = useRouter();
	const logout = useLogoutAdmin();
	const [opened, { toggle, close }] = useDisclosure(false);

	function handleLogout() {
		logout.mutate(undefined, {
			onSettled: () => {
				router.replace(ROUTES.ADMIN.LOGIN);
				router.refresh();
			},
		});
	}

	return (
		<AppShell
			data-admin-shell
			data-menu-open={opened || undefined}
			layout="alt"
			header={{ height: 68 }}
			navbar={{ width: 256, breakpoint: "sm", collapsed: { mobile: !opened } }}
			padding={0}
			className={classes.shell}
		>
			<AppShell.Header className={classes.header}>
				<Burger
					opened={opened}
					onClick={toggle}
					hiddenFrom="sm"
					size="sm"
					aria-label={t("openMenu")}
				/>
				{/* usePathname phải nằm trong Suspense (cacheComponents) */}
				<Suspense fallback={<span />}>
					<PageTitle />
				</Suspense>
			</AppShell.Header>

			<AppShell.Navbar className={classes.navbar}>
				<div className={classes.navbarTop}>
					<div className={classes.brand}>
						<span className={classes.brandMark} aria-hidden="true">
							<span />
							<span />
							<span />
						</span>
						<div>
							<Text className={classes.brandName}>{t("brand")}</Text>
							<Text className={classes.brandSub}>{t("brandSub")}</Text>
						</div>
					</div>
					<Burger opened onClick={close} hiddenFrom="sm" size="sm" aria-label={t("closeMenu")} />
				</div>

				<ScrollArea className={classes.navScroll} type="never">
					{/* Dự phòng khi chưa đọc được đường dẫn: menu chưa tô mục đang chọn */}
					<Suspense fallback={<AdminNav pathname={null} onNavigate={close} />}>
						<ActiveAdminNav onNavigate={close} />
					</Suspense>
				</ScrollArea>

				<div className={classes.navbarBottom}>
					<Button
						variant="subtle"
						color="gray"
						fullWidth
						justify="flex-start"
						leftSection={<IconLogout size={18} stroke={1.7} />}
						loading={logout.isPending}
						onClick={handleLogout}
						className={classes.logout}
					>
						{t("logout")}
					</Button>
				</div>
			</AppShell.Navbar>

			<AppShell.Main className={classes.main}>
				<div className={classes.content}>{children}</div>
			</AppShell.Main>
		</AppShell>
	);
}

// Tiêu đề banner theo mục menu đang mở (trang chi tiết dùng chung tiêu đề với trang danh sách)
function PageTitle() {
	const t = useTranslations("admin");
	const pathname = usePathname();
	const item = ALL_ITEMS.find(({ href }) => pathname.startsWith(href));

	return (
		<Text component="h1" className={classes.pageTitle}>
			{item ? t(item.titleKey) : t("brandSub")}
		</Text>
	);
}

function ActiveAdminNav({ onNavigate }: { onNavigate: () => void }) {
	return <AdminNav pathname={usePathname()} onNavigate={onNavigate} />;
}

function AdminNav({ pathname, onNavigate }: { pathname: string | null; onNavigate: () => void }) {
	const t = useTranslations("admin");

	return (
		<nav className={classes.nav}>
			{ADMIN_NAV.map((group) => (
				<div key={group.labelKey} className={classes.group}>
					<Text className={classes.groupLabel}>{t(group.labelKey)}</Text>
					{group.items.map(({ href, labelKey, Icon, ready }) =>
						ready ? (
							<Link
								key={href}
								href={href}
								className={classes.navLink}
								data-active={pathname?.startsWith(href) || undefined}
								aria-current={pathname?.startsWith(href) ? "page" : undefined}
								onClick={onNavigate}
							>
								<Icon size={18} stroke={1.7} />
								{t(labelKey)}
							</Link>
						) : (
							<span key={href} className={classes.navLink} aria-disabled="true" data-disabled>
								<Icon size={18} stroke={1.7} />
								{t(labelKey)}
								<span className={classes.soon}>{t("soon")}</span>
							</span>
						)
					)}
				</div>
			))}
		</nav>
	);
}
