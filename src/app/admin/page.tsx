import { redirect } from "next/navigation";
import { ROUTES } from "@/constants/routes";

// /admin chưa có trang tổng quan, chuyển thẳng tới danh sách sinh viên
export default function AdminPage() {
	redirect(ROUTES.ADMIN.SINH_VIEN);
}
