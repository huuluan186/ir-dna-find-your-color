import { notifications } from "@mantine/notifications";
import { IconCheck, IconX } from "@tabler/icons-react";
import { HttpError } from "./http";

export function showSuccessToast(message: string, title = "Thành công") {
	notifications.show({
		title,
		message,
		color: "green",
		icon: <IconCheck size={18} stroke={2} />,
		autoClose: 3500,
	});
}

export function showErrorToast(
	errorOrMessage: unknown,
	fallbackMessage = "Có lỗi xảy ra, vui lòng thử lại sau",
	title = "Lỗi"
) {
	let message = fallbackMessage;
	if (typeof errorOrMessage === "string" && errorOrMessage.trim()) {
		message = errorOrMessage;
	} else if (
		errorOrMessage instanceof HttpError &&
		typeof (errorOrMessage.data as { message?: string })?.message === "string"
	) {
		message = (errorOrMessage.data as { message: string }).message;
	} else if (errorOrMessage instanceof Error && errorOrMessage.message) {
		message = errorOrMessage.message;
	}

	notifications.show({
		title,
		message,
		color: "red",
		icon: <IconX size={18} stroke={2} />,
		autoClose: 4500,
	});
}
