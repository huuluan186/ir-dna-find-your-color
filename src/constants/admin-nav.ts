import {
	IconChartPie,
	IconDna2,
	IconListDetails,
	IconQrcode,
	IconUsers,
	IconVolume,
	type Icon,
} from "@tabler/icons-react";
import { ROUTES } from "./routes";

// Menu sidebar trang quản trị. labelKey (tên trong menu) và titleKey (tiêu đề trên banner)
// là khoá dịch trong src/messages (nhóm "admin").
// ready: false là mục chưa làm, hiện mờ kèm nhãn "Sắp có"; làm xong trang thì đổi sang true.
export type AdminNavItem = {
	href: string;
	labelKey: string;
	titleKey: string;
	Icon: Icon;
	ready: boolean;
};
export type AdminNavGroup = { labelKey: string; items: AdminNavItem[] };

export const ADMIN_NAV: AdminNavGroup[] = [
	{
		labelKey: "navGroupData",
		items: [
			{
				href: ROUTES.ADMIN.SINH_VIEN,
				labelKey: "navStudents",
				titleKey: "titleStudents",
				Icon: IconUsers,
				ready: true,
			},
		],
	},
	{
		labelKey: "navGroupContent",
		items: [
			{
				href: ROUTES.ADMIN.MAU_GEN,
				labelKey: "navGenes",
				titleKey: "titleGenes",
				Icon: IconDna2,
				ready: false,
			},
			{
				href: ROUTES.ADMIN.CAU_HOI,
				labelKey: "navQuestions",
				titleKey: "titleQuestions",
				Icon: IconListDetails,
				ready: false,
			},
		],
	},
	{
		labelKey: "navGroupReports",
		items: [
			{
				href: ROUTES.ADMIN.KET_QUA,
				labelKey: "navResults",
				titleKey: "titleResults",
				Icon: IconChartPie,
				ready: false,
			},
			{
				href: ROUTES.ADMIN.QR,
				labelKey: "navQr",
				titleKey: "titleQr",
				Icon: IconQrcode,
				ready: false,
			},
		],
	},
	{
		labelKey: "navGroupSystem",
		items: [
			{
				href: ROUTES.ADMIN.AM_THANH,
				labelKey: "navSound",
				titleKey: "titleSound",
				Icon: IconVolume,
				ready: true,
			},
		],
	},
];
