import { NextResponse } from "next/server";
import { listAdminColors, listAdminResults } from "@/features/admin/server/queries";
import type { ScoreKind } from "@/lib/scoring";
import { isAdmin } from "@/lib/session";

const KIND_LABELS: Record<ScoreKind, string> = {
	don: "1 mã gen nổi bật",
	ket_hop: "DNA kết hợp (2 mã gen)",
	dong_hang: "Đồng hạng (≥ 3 mã gen)",
	da_sac: "DNA đa sắc (6 mã gen)",
};

function normalizeText(value: string) {
	return value
		.normalize("NFD")
		.replace(/\p{Diacritic}/gu, "")
		.replace(/đ/g, "d")
		.replace(/Đ/g, "D")
		.toLowerCase()
		.trim();
}

function escapeCsvCell(value: string | number | null | undefined): string {
	const str = value == null ? "" : String(value);
	if (/[",\r\n]/.test(str)) {
		return `"${str.replace(/"/g, '""')}"`;
	}
	return str;
}

function formatDateTimeVn(iso: string): string {
	try {
		return new Intl.DateTimeFormat("vi-VN", {
			timeZone: "Asia/Ho_Chi_Minh",
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
			hour: "2-digit",
			minute: "2-digit",
			second: "2-digit",
			hour12: false,
		}).format(new Date(iso));
	} catch {
		return iso;
	}
}

export async function GET(request: Request) {
	if (!(await isAdmin())) return NextResponse.json({ message: "Chưa đăng nhập" }, { status: 401 });

	try {
		const { searchParams } = new URL(request.url);
		const scope = searchParams.get("scope");
		const geneId = searchParams.get("geneId");
		const kind = searchParams.get("kind");
		const keyword = normalizeText(searchParams.get("q") ?? "");

		const [results, colors] = await Promise.all([listAdminResults(), listAdminColors()]);
		const colorMap = new Map(colors.map((c) => [c.id_mau_gen, c]));

		const filtered = results.filter((row) => {
			if (scope === "latest" && !row.la_moi_nhat) return false;
			if (kind && row.loai_ket_qua !== kind) return false;
			if (geneId && !row.top_mau_gen_ids.includes(Number(geneId))) return false;
			if (keyword) {
				const topNames = row.top_mau_gen_ids.flatMap((id) => {
					const c = colorMap.get(id);
					return c ? [c.ten_mau, c.ten_ma_gen] : [];
				});
				const fields = [row.mssv, row.ho_ten, KIND_LABELS[row.loai_ket_qua], ...topNames];
				const matched = fields.some((val) => val && normalizeText(val).includes(keyword));
				if (!matched) return false;
			}
			return true;
		});

		const headers = [
			"STT",
			"Mã SV",
			"Họ và tên",
			"Lần làm",
			"Lượt gần nhất",
			"Loại kết quả",
			"Mã gen nổi bật",
			...colors.map((c) => `Điểm ${c.ten_mau}`),
			"Thời gian nộp",
		];

		const lines: string[] = [headers.map(escapeCsvCell).join(",")];

		filtered.forEach((row, index) => {
			const topGenesText =
				row.loai_ket_qua === "da_sac"
					? "DNA đa sắc (Cả 6 mã gen)"
					: row.top_mau_gen_ids
							.map((id) => {
								const c = colorMap.get(id);
								if (c) return `${c.ten_mau} (${c.ten_ma_gen})`;
								const fallback = row.bang_xep_hang.find((r) => r.id_mau_gen === id);
								return fallback?.ten_mau ?? `#${id}`;
							})
							.join(" × ");

			const pointByColor = new Map(row.bang_xep_hang.map((r) => [r.id_mau_gen, r.diem]));

			const cells = [
				index + 1,
				row.mssv,
				row.ho_ten,
				row.lan_thu,
				row.la_moi_nhat ? "Có" : "Không",
				KIND_LABELS[row.loai_ket_qua] ?? row.loai_ket_qua,
				topGenesText,
				...colors.map((c) => pointByColor.get(c.id_mau_gen) ?? 0),
				formatDateTimeVn(row.created_at),
			];

			lines.push(cells.map(escapeCsvCell).join(","));
		});

		// Thêm UTF-8 BOM (\uFEFF) để Microsoft Excel mở tiếng Việt không bị lỗi font
		const csvContent = `\uFEFF${lines.join("\r\n")}`;
		const datePart = new Date().toISOString().slice(0, 10);

		return new Response(csvContent, {
			status: 200,
			headers: {
				"Content-Type": "text/csv; charset=utf-8",
				"Content-Disposition": `attachment; filename="ir-dna-ket-qua-${datePart}.csv"`,
				"Cache-Control": "no-store",
			},
		});
	} catch (error) {
		console.error("Xuất CSV kết quả thất bại:", error);
		return NextResponse.json({ message: "Lỗi hệ thống, vui lòng thử lại sau" }, { status: 500 });
	}
}
