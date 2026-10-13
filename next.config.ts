import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	cacheComponents: true,
	partialPrefetching: true,
	// Luật cho AI nằm ở .ai/rules/quy_tac_code.md, không để `next dev` tự chèn vào AGENTS.md
	agentRules: false,
	experimental: {
		optimizePackageImports: ["@mantine/core", "@mantine/hooks"],
	},
};

export default nextConfig;
