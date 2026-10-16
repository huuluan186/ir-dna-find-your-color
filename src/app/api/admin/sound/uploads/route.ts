import { NextResponse } from "next/server";
import { SOUND } from "@/constants/sound";
import { getUploadType } from "@/features/sound/schema";
import { uploadMusic } from "@/features/sound/server/mutations";
import { isAdmin } from "@/lib/session";

// Kiểm tra vài byte đầu đúng là MP3 (thẻ ID3 hoặc khung MPEG) / M4A (hộp ftyp), không tin đuôi file
function looksLikeAudio(bytes: Uint8Array, ext: string) {
	if (ext === "mp3") {
		const id3 = bytes[0] === 0x49 && bytes[1] === 0x44 && bytes[2] === 0x33;
		const frame = bytes[0] === 0xff && (bytes[1] & 0xe0) === 0xe0;
		return id3 || frame;
	}
	return new TextDecoder().decode(bytes.subarray(4, 8)) === "ftyp";
}

// Bỏ đuôi, gộp khoảng trắng, cắt độ dài: tên hiển thị trong danh sách của admin
function toDisplayName(fileName: string) {
	const name = fileName
		.replace(/\.[^.]+$/, "")
		.replace(/\s+/g, " ")
		.trim();
	return (name || "Nhạc nền").slice(0, SOUND.NAME_MAX_LENGTH);
}

export async function POST(request: Request) {
	if (!(await isAdmin())) return NextResponse.json({ message: "Chưa đăng nhập" }, { status: 401 });

	const form = await request.formData().catch(() => null);
	const file = form?.get("file");
	if (!(file instanceof File) || file.size === 0) {
		return NextResponse.json({ code: "file_missing" }, { status: 400 });
	}
	if (file.size > SOUND.MAX_UPLOAD_BYTES) {
		return NextResponse.json({ code: "file_too_large" }, { status: 413 });
	}

	const uploadType = getUploadType(file.name);
	const bytes = await file.arrayBuffer();
	if (!uploadType || !looksLikeAudio(new Uint8Array(bytes.slice(0, 12)), uploadType.ext)) {
		return NextResponse.json({ code: "file_type" }, { status: 415 });
	}

	try {
		const music = await uploadMusic({
			ten: toDisplayName(file.name),
			bytes,
			ext: uploadType.ext,
			type: uploadType.type,
		});
		return NextResponse.json(music, { status: 201 });
	} catch (error) {
		console.error("Tải nhạc nền lên thất bại:", error);
		return NextResponse.json({ message: "Lỗi hệ thống, vui lòng thử lại sau" }, { status: 500 });
	}
}
