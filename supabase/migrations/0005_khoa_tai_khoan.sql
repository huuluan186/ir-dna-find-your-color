-- 0005_khoa_tai_khoan: admin khoá/mở tài khoản sinh viên ở trang "Quản lý người dùng".
-- Bị khoá: không đăng nhập được, phiên đang mở bị đưa về màn chào khi vào trang làm bài. Kết quả cũ giữ nguyên.
-- Thiết kế chi tiết: .ai/system/thiet_ke_csdl.md

alter table sinh_vien
	add column bi_khoa boolean not null default false,
	-- Thời điểm khoá gần nhất; mở khoá thì về null
	add column khoa_luc timestamptz;
