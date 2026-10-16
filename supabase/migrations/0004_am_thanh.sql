-- 0004_am_thanh: nhạc nền và hiệu ứng âm thanh do admin chọn ở trang "Hệ thống → Âm thanh".
-- Nhạc có sẵn nằm trong public/sounds/bgm (khai báo ở src/constants/sound.ts), không lưu CSDL.
-- Nhạc admin tải lên: file nằm trong Supabase Storage (bucket am-thanh), mỗi file một dòng nhac_nen.
-- Thiết kế chi tiết: .ai/system/thiet_ke_csdl.md, .ai/system/am_thanh.md

create table nhac_nen (
	id_nhac_nen bigint generated always as identity primary key,
	ten text not null check (char_length(ten) between 1 and 100),
	-- Đường dẫn file trong bucket am-thanh, ví dụ nhac-nen/2f1c...e9.mp3
	duong_dan text not null unique,
	kich_thuoc int not null check (kich_thuoc between 1 and 4194304),
	loai_file text not null check (loai_file in ('audio/mpeg', 'audio/mp4')),
	created_at timestamptz not null default now()
);
alter table nhac_nen enable row level security;

-- nhac_nen: null là tắt nhạc nền; {"nguon":"co_san","ma":"..."} hoặc {"nguon":"tai_len","id_nhac_nen":n}
-- am_luong: 0–100. hieu_ung: bật tiếng khi bấm nút, chọn đáp án, chuyển trang.
insert into cai_dat (khoa, gia_tri) values
	('am_thanh', '{"nhac_nen": {"nguon": "co_san", "ma": "outer-space"}, "am_luong": 40, "hieu_ung": true}')
on conflict (khoa) do nothing;

-- Bucket công khai chỉ để trình duyệt tải file nhạc về phát; ghi/xoá chỉ qua server (service role).
-- Giới hạn 4 MB khớp SOUND.MAX_UPLOAD_BYTES (Vercel chặn body > 4,5 MB).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('am-thanh', 'am-thanh', true, 4194304, array['audio/mpeg', 'audio/mp4'])
on conflict (id) do nothing;
