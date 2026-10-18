# ÂM THANH: NHẠC NỀN & HIỆU ỨNG

Đọc file này khi sửa nhạc nền, tiếng bấm, nút bật/tắt tiếng hoặc trang admin "Cài đặt hệ thống → Âm thanh".

## 1. Thành phần

| Phần | File | Ghi chú |
| :--- | :--- | :--- |
| Lõi phát âm thanh | `src/lib/sound.ts` | Nhạc nền: Howler (Web Audio, lặp, tăng/giảm dần). Hiệu ứng: ZzFX (tạo tiếng bằng code, không file). Import động, chỉ chạy ở trình duyệt |
| Gắn vào trang sinh viên | `src/components/shared/StudentSound/` | Nằm trong `StudentFrame`, nên mọi trang sinh viên (cả màn đăng nhập) đều có nhạc |
| Nút bật/tắt tiếng | `src/components/shared/AppPreferences/` | Chỉ hiện ở trang sinh viên khi admin đang bật nhạc nền (`hasMusic`); nhớ lựa chọn trong `localStorage` (`STORAGE_KEYS.MUTED`) |
| Nhạc có sẵn | `public/sounds/bgm/`, `ASSETS.BGM`, `BGM_PRESETS` (`src/constants/sound.ts`) | |
| Cài đặt | `cai_dat.am_thanh`, bảng `nhac_nen`, bucket `am-thanh` | Migration `0004_am_thanh.sql`, chi tiết ở `thiet_ke_csdl.md` |
| API | `GET /api/sound` (công khai), `GET/PUT /api/admin/sound`, `POST /api/admin/sound/uploads`, `DELETE /api/admin/sound/uploads/[id]` | `src/features/sound/` |
| Trang admin | `/admin/am-thanh`, `src/components/admin/SoundSettings/` | Bật/tắt nhạc, âm lượng, hiệu ứng, chọn bài, nghe thử, tải lên, xoá. Không có nút Lưu: mỗi thao tác tự lưu (optimistic update, các lần lưu chạy lần lượt theo `scope`; thanh âm lượng chỉ lưu khi ngừng kéo 0,4 giây) |

## 2. Luật phát

- Trình duyệt chặn tự phát. Howler tự mở khoá AudioContext ở lần chạm/bấm/gõ phím đầu tiên (kể cả Safari iOS, trình duyệt trong Zalo); nhạc gọi `play()` trước đó sẽ tự bắt đầu lúc ấy. ZzFX dùng chung AudioContext của Howler.
- Tiếng bấm: `StudentSound` nghe mọi click trên trang sinh viên. Nút cần tiếng riêng đặt `data-sfx="select|next|back|page|success"`, muốn im thì `data-sfx="none"`. Bàn phím không tạo click nên `QuizScreen` tự gọi `playSfx`.
- Chuyển giữa hai trang sinh viên: phát tiếng `page`, nhạc nền chạy tiếp không ngắt.
- Trang sinh viên hỏi lại `GET /api/sound` mỗi 30 giây khi tab đang mở (`usePublicSound`), nên admin đổi bài/âm lượng/hiệu ứng thì máy đang mở trang nhận trong tối đa 30 giây, không cần tải lại. Đổi bài: bài cũ giảm dần, bài mới tăng dần.
- Tham số tiếng ZzFX nằm ở đầu `src/lib/sound.ts`; thử và chỉnh ở <https://killedbyapixel.github.io/ZzFX/>.

## 3. Tải nhạc lên

- Chỉ MP3/M4A (Safari iOS không phát OGG), tối đa **4 MB** vì Vercel chặn body > 4,5 MB. Server kiểm tra đuôi file **và** vài byte đầu (thẻ ID3/khung MPEG, hộp `ftyp`).
- Đổi giới hạn thì sửa cả `SOUND.MAX_UPLOAD_BYTES` và `file_size_limit` của bucket (migration mới).
- Không xoá được bài đang dùng làm nhạc nền. Bài đang chọn bị mất thì `/api/sound` quay về bài mặc định `SOUND.DEFAULT_PRESET`.

## 4. Nguồn nhạc có sẵn (đều CC0, không bắt buộc ghi công)

| File | Bài gốc | Tác giả | Nguồn | Ghi chú |
| :--- | :--- | :--- | :--- | :--- |
| `funky-house.mp3` | Funky House | Of Far Different Nature | <https://opengameart.org/content/funky-house> | Giữ nguyên file MP3 gốc |
| `happy-vibes.mp3` | Happy Vibes | Ruskerdax | <https://opengameart.org/node/160228> | Giữ nguyên file MP3 gốc |
| `happy-clappy.mp3` | Happy Clappy Loop | OwlishMedia | <https://opengameart.org/content/happy-clappy-loop> | Chuyển từ WAV sang MP3 128 kbps |
| `outer-space.mp3` | Outer Space Loop | wipics | <https://opengameart.org/content/outer-space-loop> | Giữ nguyên file MP3 gốc |
| `upbeat-synth.mp3` | Menu music 1 | wipics | <https://opengameart.org/content/menu-music-1> | Chuyển từ WAV sang MP3 128 kbps |
| `chill-loop.mp3` | Menu chill music | etrock | <https://opengameart.org/content/menu-chill-music> | Chuyển từ WAV sang MP3 128 kbps |

Hiệu ứng: thư viện ZzFX (MIT, Frank Force), không dùng file âm thanh.

Thêm bài có sẵn: chỉ lấy bài **CC0** (kiểm tra mục License trên trang gốc), định dạng MP3, chép vào `public/sounds/bgm/`, khai báo `ASSETS.BGM` + `BGM_PRESETS`, thêm khoá dịch `preset...` (nhóm `adminSound`) và ghi nguồn vào bảng trên.
