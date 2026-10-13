import type { Metadata, Viewport } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import { ColorSchemeScript, mantineHtmlProps } from "@mantine/core";
import "@mantine/core/styles.css";
import { Providers } from "@/components/shared/Providers";
import { APP } from "@/constants/app";

const beVietnamPro = Be_Vietnam_Pro({
	subsets: ["vietnamese", "latin"],
	weight: ["400", "500", "600", "800"],
	display: "swap",
	variable: "--font-be-vietnam-pro",
});

export const metadata: Metadata = {
	title: APP.NAME,
	description: APP.DESCRIPTION,
	applicationName: APP.SHORT_NAME,
};

export const viewport: Viewport = {
	width: "device-width",
	initialScale: 1,
	// Cho nội dung tràn vào vùng tai thỏ, phần đệm do env(safe-area-inset-*) lo
	viewportFit: "cover",
	themeColor: "#1e4fa3",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="vi" className={beVietnamPro.variable} {...mantineHtmlProps}>
			<head>
				<ColorSchemeScript defaultColorScheme="light" />
			</head>
			<body>
				<Providers>{children}</Providers>
			</body>
		</html>
	);
}
