"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/query-keys";
import type { AdminSound } from "../types";

const SOUND_REFRESH_MS = 30 * 1000;
import {
	deleteMusicRequest,
	fetchAdminSound,
	fetchPublicSound,
	saveSoundSettingsRequest,
	uploadMusicRequest,
} from "./api";

// Trang sinh viên: hỏi lại mỗi 30 giây (chỉ khi tab đang mở) để admin đổi bài/âm lượng thì
// máy đang làm bài nhận được mà không cần tải lại trang. Không thử lại nhiều: thiếu nhạc không chặn làm bài.
export function usePublicSound() {
	return useQuery({
		queryKey: QUERY_KEYS.SOUND,
		queryFn: fetchPublicSound,
		staleTime: SOUND_REFRESH_MS,
		refetchInterval: SOUND_REFRESH_MS,
		retry: 1,
	});
}

export function useAdminSound() {
	return useQuery({ queryKey: QUERY_KEYS.ADMIN.SOUND, queryFn: fetchAdminSound });
}

function useInvalidateSound() {
	const queryClient = useQueryClient();
	return () =>
		Promise.all([
			queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN.SOUND }),
			queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SOUND }),
		]);
}

const SAVE_SETTINGS_KEY = ["admin", "sound", "save"];

// Tự lưu mỗi lần admin thao tác: cập nhật cache ngay (optimistic), lỗi thì trả lại giá trị cũ.
// scope: các lần lưu chạy lần lượt theo thứ tự bấm, không bị lần trước ghi đè lần sau.
// Chỉ tải lại từ server khi lần lưu cuối cùng xong, tránh gọi API thừa khi bấm liên tục.
export function useSaveSoundSettings() {
	const queryClient = useQueryClient();
	const invalidate = useInvalidateSound();
	return useMutation({
		mutationKey: SAVE_SETTINGS_KEY,
		scope: { id: "sound-settings" },
		mutationFn: saveSoundSettingsRequest,
		onMutate: async (settings) => {
			await queryClient.cancelQueries({ queryKey: QUERY_KEYS.ADMIN.SOUND });
			const previous = queryClient.getQueryData<AdminSound>(QUERY_KEYS.ADMIN.SOUND);
			if (previous)
				queryClient.setQueryData<AdminSound>(QUERY_KEYS.ADMIN.SOUND, { ...previous, settings });
			return { previous };
		},
		onError: (_error, _settings, context) => {
			if (context?.previous) queryClient.setQueryData(QUERY_KEYS.ADMIN.SOUND, context.previous);
		},
		onSettled: () => {
			if (queryClient.isMutating({ mutationKey: SAVE_SETTINGS_KEY }) === 1) return invalidate();
		},
	});
}

export function useUploadMusic() {
	const invalidate = useInvalidateSound();
	return useMutation({ mutationFn: uploadMusicRequest, onSuccess: invalidate });
}

export function useDeleteMusic() {
	const invalidate = useInvalidateSound();
	return useMutation({ mutationFn: deleteMusicRequest, onSuccess: invalidate });
}
