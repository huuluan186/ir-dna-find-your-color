// Gọi API của chính app (JSON). Không cần axios: fetch có sẵn, chỉ gói phần lặp lại.
// ponytail: chưa có interceptor/timeout, thêm khi cần (ví dụ tự chuyển về / khi hết phiên).

// Lỗi khi server trả status ngoài 2xx; data là JSON server trả về (nếu có)
export class HttpError extends Error {
	constructor(
		public status: number,
		public data: unknown
	) {
		super(`HTTP ${status}`);
	}
}

async function request<T>(method: string, url: string, body?: unknown): Promise<T> {
	const response = await fetch(url, {
		method,
		headers: body === undefined ? undefined : { "Content-Type": "application/json" },
		body: body === undefined ? undefined : JSON.stringify(body),
	});

	const data = await response.json().catch(() => null);
	if (!response.ok) throw new HttpError(response.status, data);
	return data as T;
}

export const http = {
	get: <T>(url: string) => request<T>("GET", url),
	post: <T>(url: string, body?: unknown) => request<T>("POST", url, body),
	put: <T>(url: string, body?: unknown) => request<T>("PUT", url, body),
	delete: <T>(url: string) => request<T>("DELETE", url),
};
