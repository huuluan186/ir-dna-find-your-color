-- 0002_update_quiz_results: align schema with the official quiz scoring rules.
-- Design details: .ai/system/thiet_ke_csdl.md

alter table mau_gen
	add column tu_khoa text[] not null default '{}',
	add column ky_nang text not null default '';

-- Each answer gives exactly one point to at most one color.
alter table diem_dap_an
	drop constraint if exists diem_dap_an_diem_check,
	add constraint diem_dap_an_diem_check check (diem = 1),
	add constraint diem_dap_an_id_dap_an_key unique (id_dap_an);

-- Preserve existing results as single-color results before replacing legacy fields.
alter table ket_qua
	add column top_mau_gen_ids jsonb not null default '[]'::jsonb,
	add column loai_ket_qua text not null default 'don';

update ket_qua
set top_mau_gen_ids = jsonb_build_array(id_mau_chinh);

alter table ket_qua
	add constraint ket_qua_loai_ket_qua_check
		check (loai_ket_qua in ('don', 'ket_hop', 'dong_hang', 'da_sac')),
	add constraint ket_qua_top_mau_gen_ids_array_check
		check (jsonb_typeof(top_mau_gen_ids) = 'array'),
	drop constraint if exists ket_qua_id_mau_chinh_fkey,
	drop column id_mau_chinh,
	drop column ma_hex_rieng;
