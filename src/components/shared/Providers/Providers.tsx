"use client";

import type { ReactNode } from "react";
import { MantineProvider } from "@mantine/core";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { getQueryClient } from "@/lib/query-client";
import { theme } from "@/theme";
import { AppPreferencesProvider } from "@/components/shared/AppPreferences";

export function Providers({ children }: { children: ReactNode }) {
	return (
		<QueryClientProvider client={getQueryClient()}>
			<MantineProvider theme={theme} defaultColorScheme="light">
				<AppPreferencesProvider>{children}</AppPreferencesProvider>
			</MantineProvider>
			{process.env.NODE_ENV === "development" && (
				<ReactQueryDevtools buttonPosition="bottom-left" />
			)}
		</QueryClientProvider>
	);
}
