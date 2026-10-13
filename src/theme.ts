import { createTheme, type MantineColorsTuple } from "@mantine/core";

// Xanh lam IR DNA (#1E4FA3 ở vị trí 6). Màu của 6 mã gen lấy từ CSDL, không khai báo ở đây.
const dna: MantineColorsTuple = [
	"#eaf0fb",
	"#d2ddf2",
	"#a2b8e5",
	"#6f91d9",
	"#4670ce",
	"#2d5cc8",
	"#1e4fa3",
	"#17428c",
	"#0f3a7f",
	"#003170",
];

export const theme = createTheme({
	primaryColor: "dna",
	primaryShade: { light: 6, dark: 4 },
	colors: { dna },
	fontFamily: "var(--font-be-vietnam-pro), system-ui, sans-serif",
	headings: { fontFamily: "var(--font-be-vietnam-pro), system-ui, sans-serif", fontWeight: "800" },
	defaultRadius: "md",
	cursorType: "pointer",
	components: {
		// Ô nhập ≥ 16px để iOS không tự phóng to, nút cao ≥ 44px
		Button: { defaultProps: { size: "md" } },
		TextInput: { defaultProps: { size: "md" } },
		PasswordInput: { defaultProps: { size: "md" } },
	},
});
