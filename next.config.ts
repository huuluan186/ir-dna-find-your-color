import type { NextConfig } from "next";
import { ROUTE_TO_PAGE_DIR } from "./src/constants/routes";

// Chỉ những trang có URL khác tên thư mục mới cần map
const aliases = ROUTE_TO_PAGE_DIR.filter(([url, pageDir]) => url !== pageDir);

const nextConfig: NextConfig = {
	cacheComponents: true,
	partialPrefetching: true,
	// Luật cho AI nằm ở .ai/rules/quy_tac_code.md, không để `next dev` tự chèn vào AGENTS.md
	agentRules: false,
	experimental: {
		// Tắt bộ nhớ đệm trên đĩa của Turbopack khi dev: từng gặp dev server chạy code cũ sau khi sửa file.
		// Khởi động chậm hơn vài giây nhưng Ctrl+C rồi `npm run dev` là sạch. Build vẫn giữ cache.
		turbopackFileSystemCacheForDev: false,
		optimizePackageImports: ["@mantine/core", "@mantine/hooks"],
	},
	// URL trong ROUTES hiển thị nội dung của thư mục trang thật (thanh địa chỉ giữ nguyên URL đẹp)
	async rewrites() {
		return aliases.flatMap(([url, pageDir]) => [
			{ source: url, destination: pageDir },
			{ source: `${url}/:path*`, destination: `${pageDir}/:path*` },
		]);
	},
	// Ai gõ thẳng đường dẫn thư mục nội bộ thì chuyển sang URL chính thức
	async redirects() {
		return aliases.flatMap(([url, pageDir]) => [
			{ source: pageDir, destination: url, permanent: false },
			{ source: `${pageDir}/:path*`, destination: `${url}/:path*`, permanent: false },
		]);
	},
};

export default nextConfig;
