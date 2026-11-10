-- 0006_cap_nhat_dinh_dang_mssv: cho phép mã sinh viên chứa chữ cái (ví dụ: 21DH123456)
alter table sinh_vien drop constraint if exists sinh_vien_mssv_check;

alter table sinh_vien add constraint sinh_vien_mssv_check check (mssv ~ '^[A-Za-z0-9_-]{3,20}$');
