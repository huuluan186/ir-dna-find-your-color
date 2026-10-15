// Nội dung chính thức theo docs/noi-dung-web.md, hiện vẫn nằm trong mock-data đến khi có CSDL.
// Giao diện đọc dữ liệu này phải gắn badge "P" (prototype) theo quy_tac_code.md mục 4.

export type MockMauGen = {
	id_mau_gen: number;
	ten_mau: string;
	ma_hex: string;
	ten_ma_gen: string;
	tu_khoa: string[];
	y_nghia: string;
	linh_vuc: string;
	ky_nang: string;
	thu_tu: number;
};

export type MockDapAn = {
	id_dap_an: number;
	noi_dung: string;
	thu_tu: number; // A=1, B=2, C=3, D=4
	id_mau_gen: number;
};

export type MockCauHoi = {
	id_cau_hoi: number;
	noi_dung: string;
	thu_tu: number;
	dang_bat: boolean;
	dap_an: MockDapAn[];
};

export const MOCK_MAU_GEN: MockMauGen[] = [
	{
		id_mau_gen: 1,
		ten_mau: "Đỏ",
		ma_hex: "#E53935",
		ten_ma_gen: "Người dẫn dắt",
		tu_khoa: ["Chủ động", "Quyết đoán", "Dám thử thách"],
		y_nghia:
			"Bạn có xu hướng thích chủ động, đảm nhận trách nhiệm và giúp tập thể tiến về phía trước.",
		linh_vuc: "Ngoại giao, chính sách quốc tế, đối ngoại, quản lý dự án quốc tế.",
		ky_nang: "Đàm phán, lãnh đạo, tư duy chiến lược.",
		thu_tu: 1,
	},
	{
		id_mau_gen: 2,
		ten_mau: "Cam",
		ma_hex: "#FB8C00",
		ten_ma_gen: "Người kết nối",
		tu_khoa: ["Hòa đồng", "Giao tiếp", "Hợp tác"],
		y_nghia:
			"Bạn có xu hướng yêu thích giao tiếp, kết nối mọi người và xây dựng môi trường hợp tác tích cực.",
		linh_vuc: "Truyền thông quốc tế, ngoại giao văn hóa, tổ chức sự kiện, PR.",
		ky_nang: "Giao tiếp liên văn hóa, thuyết trình, xây dựng quan hệ.",
		thu_tu: 2,
	},
	{
		id_mau_gen: 3,
		ten_mau: "Vàng",
		ma_hex: "#FDD835",
		ten_ma_gen: "Người truyền cảm hứng",
		tu_khoa: ["Sáng tạo", "Nhiệt tình", "Truyền tải thông điệp"],
		y_nghia:
			"Bạn có xu hướng yêu thích những ý tưởng mới và cách thể hiện có sức thu hút, giúp thông điệp trở nên gần gũi và dễ lan tỏa.",
		linh_vuc: "Truyền thông quốc tế, marketing quốc tế, truyền thông thương hiệu.",
		ky_nang: "Kể chuyện, nghiên cứu công chúng, lập kế hoạch truyền thông.",
		thu_tu: 3,
	},
	{
		id_mau_gen: 4,
		ten_mau: "Xanh lá",
		ma_hex: "#43A047",
		ten_ma_gen: "Người kiến tạo",
		tu_khoa: ["Đồng cảm", "Trách nhiệm", "Hướng đến cộng đồng"],
		y_nghia:
			"Bạn có xu hướng quan tâm đến con người, đề cao sự hợp tác và mong muốn tạo ra những thay đổi tích cực cho cộng đồng.",
		linh_vuc: "Tổ chức quốc tế, NGO, phát triển cộng đồng, điều phối dự án quốc tế.",
		ky_nang: "Quản lý dự án, làm việc nhóm, phân tích vấn đề xã hội.",
		thu_tu: 4,
	},
	{
		id_mau_gen: 5,
		ten_mau: "Xanh dương",
		ma_hex: "#1E4FA3",
		ten_ma_gen: "Người phân tích",
		tu_khoa: ["Logic", "Cẩn thận", "Khách quan"],
		y_nghia:
			"Bạn có xu hướng muốn tìm hiểu bản chất vấn đề, đối chiếu thông tin và phân tích trước khi đưa ra nhận định.",
		linh_vuc: "Luật quốc tế, kinh tế quốc tế, nghiên cứu và phân tích chính sách.",
		ky_nang: "Nghiên cứu, viết báo cáo, phân tích dữ liệu, tư duy pháp lý.",
		thu_tu: 5,
	},
	{
		id_mau_gen: 6,
		ten_mau: "Tím",
		ma_hex: "#8E24AA",
		ten_ma_gen: "Người sáng tạo chiến lược",
		tu_khoa: ["Tầm nhìn", "Đổi mới", "Tư duy đa chiều"],
		y_nghia:
			"Bạn có xu hướng nhìn vấn đề từ nhiều góc độ, liên kết các yếu tố và tìm hướng phát triển dài hạn.",
		linh_vuc: "Chiến lược toàn cầu, tư vấn quốc tế, phân tích xu hướng.",
		ky_nang: "Tư duy hệ thống, giải quyết vấn đề, ngoại ngữ và thích nghi với thay đổi.",
		thu_tu: 6,
	},
];

// ID đáp án = id câu hỏi * 10 + thứ tự lựa chọn (11 là câu 1, đáp án A).
// Mã gen từng phương án lấy nguyên theo bảng đáp án nội bộ trong docs/noi-dung-web.md.
export const MOCK_CAU_HOI: MockCauHoi[] = [
	{
		id_cau_hoi: 1,
		noi_dung: "Khi tham gia một dự án mới, bạn hào hứng nhất với điều gì?",
		thu_tu: 1,
		dang_bat: true,
		dap_an: [
			{
				id_dap_an: 11,
				noi_dung: "Nghĩ ra ý tưởng độc đáo để dự án trở nên thú vị và thu hút hơn.",
				thu_tu: 1,
				id_mau_gen: 3,
			},
			{
				id_dap_an: 12,
				noi_dung: "Tìm hiểu dự án có thể giúp ích cho ai và tạo ra giá trị gì cho cộng đồng.",
				thu_tu: 2,
				id_mau_gen: 4,
			},
			{
				id_dap_an: 13,
				noi_dung: "Tìm kiếm thông tin, phân tích yêu cầu và xác định vấn đề cần giải quyết.",
				thu_tu: 3,
				id_mau_gen: 5,
			},
			{
				id_dap_an: 14,
				noi_dung: "Xây dựng định hướng tổng thể và tìm cách để dự án đạt hiệu quả lâu dài.",
				thu_tu: 4,
				id_mau_gen: 6,
			},
		],
	},
	{
		id_cau_hoi: 2,
		noi_dung:
			"Nếu được tự chọn một hoạt động ngoại khóa ở HUFLIT, bạn muốn tham gia hoạt động nào nhất?",
		thu_tu: 2,
		dang_bat: true,
		dap_an: [
			{
				id_dap_an: 21,
				noi_dung: "Ứng cử vị trí trưởng ban hoặc điều phối một sự kiện để dẫn dắt đội nhóm.",
				thu_tu: 1,
				id_mau_gen: 1,
			},
			{
				id_dap_an: 22,
				noi_dung: "Tham gia dự án tình nguyện hoặc chương trình hỗ trợ cộng đồng.",
				thu_tu: 2,
				id_mau_gen: 4,
			},
			{
				id_dap_an: 23,
				noi_dung:
					"Tham gia hội thảo học thuật, nghiên cứu vấn đề quốc tế hoặc phân tích chính sách.",
				thu_tu: 3,
				id_mau_gen: 5,
			},
			{
				id_dap_an: 24,
				noi_dung: "Tham gia cuộc thi hoạch định chiến lược hoặc dự báo xu hướng quốc tế.",
				thu_tu: 4,
				id_mau_gen: 6,
			},
		],
	},
	{
		id_cau_hoi: 3,
		noi_dung: "Khi làm việc nhóm, vai trò nào khiến bạn cảm thấy phù hợp nhất?",
		thu_tu: 3,
		dang_bat: true,
		dap_an: [
			{
				id_dap_an: 31,
				noi_dung: "Người chủ động đưa ra quyết định và giúp nhóm đi đúng hướng.",
				thu_tu: 1,
				id_mau_gen: 1,
			},
			{
				id_dap_an: 32,
				noi_dung: "Người kết nối các thành viên, tạo không khí thoải mái và thúc đẩy hợp tác.",
				thu_tu: 2,
				id_mau_gen: 2,
			},
			{
				id_dap_an: 33,
				noi_dung: "Người kiểm tra thông tin, rà soát chi tiết và phát hiện những điểm chưa hợp lý.",
				thu_tu: 3,
				id_mau_gen: 5,
			},
			{
				id_dap_an: 34,
				noi_dung: "Người nhìn tổng thể tiến độ, dự đoán khó khăn và đề xuất phương án tối ưu.",
				thu_tu: 4,
				id_mau_gen: 6,
			},
		],
	},
	{
		id_cau_hoi: 4,
		noi_dung: "Khi gặp một vấn đề quốc tế mà bạn chưa hiểu rõ, bạn thường muốn làm gì đầu tiên?",
		thu_tu: 4,
		dang_bat: true,
		dap_an: [
			{
				id_dap_an: 41,
				noi_dung: "Tìm đọc tin tức, tài liệu từ nhiều nguồn đáng tin cậy để nắm rõ sự việc.",
				thu_tu: 1,
				id_mau_gen: 5,
			},
			{
				id_dap_an: 42,
				noi_dung: "Trao đổi với người khác để nghe thêm những góc nhìn và trải nghiệm khác nhau.",
				thu_tu: 2,
				id_mau_gen: 2,
			},
			{
				id_dap_an: 43,
				noi_dung: "Tìm cách diễn giải vấn đề bằng một câu chuyện hoặc ví dụ dễ hiểu.",
				thu_tu: 3,
				id_mau_gen: 3,
			},
			{
				id_dap_an: 44,
				noi_dung: "Xem xét mối liên hệ giữa các yếu tố và dự đoán những hệ quả dài hạn.",
				thu_tu: 4,
				id_mau_gen: 6,
			},
		],
	},
	{
		id_cau_hoi: 5,
		noi_dung: "Trong một chương trình giao lưu quốc tế, bạn muốn đóng góp bằng cách nào nhất?",
		thu_tu: 5,
		dang_bat: true,
		dap_an: [
			{
				id_dap_an: 51,
				noi_dung: "Đại diện nhóm phát biểu, thương lượng hoặc điều phối các quyết định quan trọng.",
				thu_tu: 1,
				id_mau_gen: 1,
			},
			{
				id_dap_an: 52,
				noi_dung: "Trò chuyện với người tham gia, kết nối các nền văn hóa và xây dựng quan hệ.",
				thu_tu: 2,
				id_mau_gen: 2,
			},
			{
				id_dap_an: 53,
				noi_dung: "Tạo nội dung, hình ảnh hoặc hoạt động giúp thông điệp của chương trình lan tỏa.",
				thu_tu: 3,
				id_mau_gen: 3,
			},
			{
				id_dap_an: 54,
				noi_dung:
					"Chủ động hỗ trợ những người còn bỡ ngỡ, ngại giao tiếp để mọi người đều cảm thấy được chào đón.",
				thu_tu: 4,
				id_mau_gen: 4,
			},
		],
	},
	{
		id_cau_hoi: 6,
		noi_dung: "Theo bạn, thế mạnh nào mô tả bản thân mình rõ nhất?",
		thu_tu: 6,
		dang_bat: true,
		dap_an: [
			{
				id_dap_an: 61,
				noi_dung: "Dễ bắt chuyện, biết lắng nghe và phối hợp với nhiều kiểu người.",
				thu_tu: 1,
				id_mau_gen: 2,
			},
			{
				id_dap_an: 62,
				noi_dung: "Có nhiều ý tưởng, thích sáng tạo và truyền tải thông điệp.",
				thu_tu: 2,
				id_mau_gen: 3,
			},
			{
				id_dap_an: 63,
				noi_dung: "Biết quan tâm, kiên nhẫn và sẵn sàng hỗ trợ người khác.",
				thu_tu: 3,
				id_mau_gen: 4,
			},
			{
				id_dap_an: 64,
				noi_dung: "Quyết đoán, dám nhận trách nhiệm và không ngại đứng ra dẫn dắt.",
				thu_tu: 4,
				id_mau_gen: 1,
			},
		],
	},
	{
		id_cau_hoi: 7,
		noi_dung: "Nếu được phát triển một kỹ năng trong năm tới, bạn sẽ ưu tiên điều gì?",
		thu_tu: 7,
		dang_bat: true,
		dap_an: [
			{
				id_dap_an: 71,
				noi_dung: "Sáng tạo nội dung, kể chuyện và xây dựng chiến dịch truyền thông.",
				thu_tu: 1,
				id_mau_gen: 3,
			},
			{
				id_dap_an: 72,
				noi_dung: "Tìm hiểu nhu cầu cộng đồng và tham gia tổ chức các hoạt động thiện nguyện.",
				thu_tu: 2,
				id_mau_gen: 4,
			},
			{
				id_dap_an: 73,
				noi_dung: "Nghiên cứu, phân tích dữ liệu, viết báo cáo và tư duy phản biện.",
				thu_tu: 3,
				id_mau_gen: 5,
			},
			{
				id_dap_an: 74,
				noi_dung: "Tư duy chiến lược, dự báo xu hướng và thích nghi với thay đổi.",
				thu_tu: 4,
				id_mau_gen: 6,
			},
		],
	},
	{
		id_cau_hoi: 8,
		noi_dung:
			"Nhóm của bạn chỉ còn hai ngày để hoàn thành dự án và đang gặp khó khăn. Bạn muốn đảm nhận phần nào nhất?",
		thu_tu: 8,
		dang_bat: true,
		dap_an: [
			{
				id_dap_an: 81,
				noi_dung: "Xác định việc ưu tiên, phân công nhiệm vụ và giúp nhóm đưa ra quyết định nhanh.",
				thu_tu: 1,
				id_mau_gen: 1,
			},
			{
				id_dap_an: 82,
				noi_dung:
					"Trao đổi với các thành viên, tháo gỡ hiểu lầm và giúp mọi người phối hợp tốt hơn.",
				thu_tu: 2,
				id_mau_gen: 2,
			},
			{
				id_dap_an: 83,
				noi_dung:
					"Chăm chút phần trình bày, slide và cách kể câu chuyện của dự án sao cho thật cuốn hút.",
				thu_tu: 3,
				id_mau_gen: 3,
			},
			{
				id_dap_an: 84,
				noi_dung: "Kiểm tra những phần còn thiếu, tìm lỗi và rà soát chất lượng nội dung.",
				thu_tu: 4,
				id_mau_gen: 5,
			},
		],
	},
	{
		id_cau_hoi: 9,
		noi_dung: "Điều gì khiến bạn cảm thấy tự hào nhất sau khi hoàn thành một hoạt động?",
		thu_tu: 9,
		dang_bat: true,
		dap_an: [
			{
				id_dap_an: 91,
				noi_dung: "Mình đã chủ động chịu trách nhiệm và giúp nhóm đạt được mục tiêu.",
				thu_tu: 1,
				id_mau_gen: 1,
			},
			{
				id_dap_an: 92,
				noi_dung: "Mình đã gặp được những người mới và xây dựng những mối quan hệ tốt.",
				thu_tu: 2,
				id_mau_gen: 2,
			},
			{
				id_dap_an: 93,
				noi_dung: "Có người nói với mình rằng hoạt động đã thực sự giúp ích cho họ.",
				thu_tu: 3,
				id_mau_gen: 4,
			},
			{
				id_dap_an: 94,
				noi_dung:
					"Mình đã tìm ra một hướng đi mới và nhìn thấy tiềm năng phát triển trong tương lai.",
				thu_tu: 4,
				id_mau_gen: 6,
			},
		],
	},
	{
		id_cau_hoi: 10,
		noi_dung: "Khi có ý kiến bất đồng trong nhóm, bạn thường làm gì?",
		thu_tu: 10,
		dang_bat: true,
		dap_an: [
			{
				id_dap_an: 101,
				noi_dung:
					"Dùng một ví dụ thú vị hoặc cách diễn đạt sáng tạo để giảm căng thẳng và giúp mọi người dễ hiểu nhau hơn.",
				thu_tu: 1,
				id_mau_gen: 3,
			},
			{
				id_dap_an: 102,
				noi_dung: "Quan tâm đến cảm xúc và quyền lợi của các thành viên để tìm giải pháp phù hợp.",
				thu_tu: 2,
				id_mau_gen: 4,
			},
			{
				id_dap_an: 103,
				noi_dung: "Đối chiếu lý lẽ, dữ kiện và phân tích ưu nhược điểm của từng quan điểm.",
				thu_tu: 3,
				id_mau_gen: 5,
			},
			{
				id_dap_an: 104,
				noi_dung: "Xem xét ảnh hưởng lâu dài của các phương án và tìm giải pháp cân bằng tổng thể.",
				thu_tu: 4,
				id_mau_gen: 6,
			},
		],
	},
	{
		id_cau_hoi: 11,
		noi_dung: "Trong lĩnh vực Quan hệ quốc tế, chủ đề nào khiến bạn muốn tìm hiểu sâu hơn?",
		thu_tu: 11,
		dang_bat: true,
		dap_an: [
			{
				id_dap_an: 111,
				noi_dung: "Ngoại giao, đàm phán quốc tế và quá trình đưa ra quyết định chính sách.",
				thu_tu: 1,
				id_mau_gen: 1,
			},
			{
				id_dap_an: 112,
				noi_dung: "Giao tiếp liên văn hóa, quan hệ đối ngoại và kết nối giữa các quốc gia.",
				thu_tu: 2,
				id_mau_gen: 2,
			},
			{
				id_dap_an: 113,
				noi_dung: "Truyền thông quốc tế, ngoại giao văn hóa và sức mạnh của câu chuyện.",
				thu_tu: 3,
				id_mau_gen: 3,
			},
			{
				id_dap_an: 114,
				noi_dung: "Phát triển bền vững, hoạt động của tổ chức quốc tế và các vấn đề xã hội.",
				thu_tu: 4,
				id_mau_gen: 4,
			},
		],
	},
	{
		id_cau_hoi: 12,
		noi_dung: "Khi nghĩ về tương lai, bạn muốn mình trở thành người như thế nào?",
		thu_tu: 12,
		dang_bat: true,
		dap_an: [
			{
				id_dap_an: 121,
				noi_dung:
					"Một người dám đứng ra dẫn dắt và chịu trách nhiệm cho những quyết định quan trọng.",
				thu_tu: 1,
				id_mau_gen: 1,
			},
			{
				id_dap_an: 122,
				noi_dung:
					"Một người kết nối được con người, văn hóa và xây dựng những mối quan hệ bền vững.",
				thu_tu: 2,
				id_mau_gen: 2,
			},
			{
				id_dap_an: 123,
				noi_dung: "Một người hiểu sâu vấn đề và đưa ra nhận định khách quan.",
				thu_tu: 3,
				id_mau_gen: 5,
			},
			{
				id_dap_an: 124,
				noi_dung:
					"Một người có tầm nhìn rộng, dự đoán xu hướng và xây dựng những định hướng dài hạn.",
				thu_tu: 4,
				id_mau_gen: 6,
			},
		],
	},
];
