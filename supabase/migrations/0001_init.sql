-- 0001_init: khởi tạo 7 bảng của IR DNA – Find Your Color.
-- Thiết kế chi tiết: .ai/system/thiet_ke_csdl.md

-- ========== NỘI DUNG (admin nhập, xoá mềm) ==========

create table mau_gen (
	id_mau_gen bigint generated always as identity primary key,
	ten_mau text not null,
	ma_hex char(7) not null check (ma_hex ~ '^#[0-9A-Fa-f]{6}$'),
	ten_ma_gen text not null,
	y_nghia text not null,
	linh_vuc text,
	thu_tu int not null,
	created_at timestamptz not null default now(),
	updated_at timestamptz,
	is_deleted boolean not null default false,
	deleted_at timestamptz
);

create table cau_hoi (
	id_cau_hoi bigint generated always as identity primary key,
	noi_dung text not null,
	thu_tu int not null,
	dang_bat boolean not null default true,
	created_at timestamptz not null default now(),
	updated_at timestamptz,
	is_deleted boolean not null default false,
	deleted_at timestamptz
);

create table dap_an (
	id_dap_an bigint generated always as identity primary key,
	id_cau_hoi bigint not null references cau_hoi (id_cau_hoi),
	noi_dung text not null,
	thu_tu int not null, -- A=1, B=2, C=3, D=4
	created_at timestamptz not null default now(),
	updated_at timestamptz,
	is_deleted boolean not null default false,
	deleted_at timestamptz
);

create index dap_an_id_cau_hoi_idx on dap_an (id_cau_hoi);

-- Ma trận điểm: chỉ lưu ô khác 0, không có dòng = 0 điểm.
create table diem_dap_an (
	id_dap_an bigint not null references dap_an (id_dap_an),
	id_mau_gen bigint not null references mau_gen (id_mau_gen),
	diem smallint not null check (diem between 1 and 5),
	primary key (id_dap_an, id_mau_gen)
);

-- ========== PHÁT SINH ==========

create table sinh_vien (
	-- Định dạng chính xác kiểm tra ở server theo cai_dat.dinh_dang_mssv;
	-- ở đây chỉ chặn ký tự không phải số để đổi định dạng không cần migration.
	mssv text primary key check (mssv ~ '^[0-9]{6,15}$'),
	ho_ten text not null,
	created_at timestamptz not null default now(),
	updated_at timestamptz
);

-- Mỗi lần làm bài là 1 dòng; các cột kết quả là ảnh chụp lúc chấm.
create table ket_qua (
	id_ket_qua bigint generated always as identity primary key,
	mssv text not null references sinh_vien (mssv),
	dap_an_da_chon jsonb not null,
	bang_xep_hang jsonb not null,
	id_mau_chinh bigint not null references mau_gen (id_mau_gen),
	ma_hex_rieng char(7) not null,
	created_at timestamptz not null default now()
);

create index ket_qua_mssv_created_at_idx on ket_qua (mssv, created_at desc);

-- ========== CẤU HÌNH ==========

create table cai_dat (
	khoa text primary key,
	gia_tri jsonb not null
);

insert into cai_dat (khoa, gia_tri) values
	('cho_lam_lai', 'true'),
	('dinh_dang_mssv', '"^[0-9]{10}$"'),
	('so_cau_toi_da', '10');

-- ========== BẢO MẬT ==========
-- Bật RLS, không tạo policy: anon/authenticated không đọc ghi được gì.
-- Chỉ server dùng service role key (bỏ qua RLS) truy cập.

alter table mau_gen enable row level security;
alter table cau_hoi enable row level security;
alter table dap_an enable row level security;
alter table diem_dap_an enable row level security;
alter table sinh_vien enable row level security;
alter table ket_qua enable row level security;
alter table cai_dat enable row level security;
