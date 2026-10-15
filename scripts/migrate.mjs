// Chạy các file trong supabase/migrations/ lên CSDL trong biến DB_URL (chỉ file chưa chạy).
// Local: npm run db:migrate (đọc .env.local). Vercel: gọi từ vercel-build, chỉ chạy ở Production.
import { spawnSync } from "node:child_process";

if (process.env.VERCEL && process.env.VERCEL_ENV !== "production") {
	console.log("Bỏ qua migration: không phải môi trường Production.");
	process.exit(0);
}

if (!process.env.DB_URL) {
	console.error("Thiếu biến môi trường DB_URL (chuỗi Session pooler của Supabase).");
	process.exit(1);
}

const result = spawnSync("npx", ["supabase", "db", "push", "--db-url", process.env.DB_URL], {
	stdio: "inherit",
	shell: true,
});
process.exit(result.status ?? 1);
