import { isServer, QueryClient } from "@tanstack/react-query";

function makeQueryClient() {
	return new QueryClient({
		defaultOptions: {
			queries: {
				// Dữ liệu đã prefetch ở server còn mới trong 60 giây, client không gọi lại ngay
				staleTime: 60 * 1000,
				retry: 2,
			},
		},
	});
}

let browserQueryClient: QueryClient | undefined;

// Server: mỗi request một client riêng để dữ liệu không lẫn giữa các sinh viên.
// Trình duyệt: dùng chung một client để giữ cache khi chuyển trang.
export function getQueryClient() {
	if (isServer) return makeQueryClient();
	browserQueryClient ??= makeQueryClient();
	return browserQueryClient;
}
