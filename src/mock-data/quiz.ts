// DỮ LIỆU MẪU (prototype), chưa phải nội dung chính thức của nhóm tổ chức.
// Màn nào đọc file này phải gắn badge "P" (xem quy_tac_code.md mục 4).
// Tên trường bám theo cột CSDL (.ai/system/thiet_ke_csdl.md) để sau này thay bằng truy vấn thật.

export type MockMauGen = {
	id_mau_gen: number;
	ten_mau: string;
	ma_hex: string;
	ten_ma_gen: string;
	y_nghia: string;
	linh_vuc: string;
	thu_tu: number;
};

export type MockDapAn = {
	id_dap_an: number;
	noi_dung: string;
	thu_tu: number; // A=1, B=2, C=3, D=4
	// id_mau_gen → điểm (1–5). Màu không có trong đây = 0 điểm.
	diem: Record<number, number>;
};

export type MockCauHoi = {
	id_cau_hoi: number;
	noi_dung: string;
	thu_tu: number;
	dang_bat: boolean;
	dap_an: MockDapAn[];
};

const LAM = 1;
const VANG = 2;
const TIM = 3;
const CAM = 4;
const LA = 5;
const DO = 6;

export const MOCK_MAU_GEN: MockMauGen[] = [
	{
		id_mau_gen: LAM,
		ten_mau: "Xanh lam",
		ma_hex: "#1E4FA3",
		ten_ma_gen: "Gen Ngoại giao",
		y_nghia:
			"Bạn giỏi lắng nghe, biết tìm điểm chung và giữ được bình tĩnh khi các bên bất đồng. Mọi người tin bạn vì bạn nói chuyện có chừng mực.",
		linh_vuc: "Ngoại giao, lễ tân đối ngoại, tổ chức quốc tế",
		thu_tu: 1,
	},
	{
		id_mau_gen: VANG,
		ten_mau: "Vàng",
		ma_hex: "#F2B705",
		ten_ma_gen: "Gen Truyền thông",
		y_nghia:
			"Bạn có khiếu kể chuyện và biến ý tưởng khô khan thành thứ ai cũng muốn nghe. Ở đâu có bạn, ở đó có năng lượng.",
		linh_vuc: "Truyền thông đối ngoại, báo chí, sáng tạo nội dung",
		thu_tu: 2,
	},
	{
		id_mau_gen: TIM,
		ten_mau: "Tím",
		ma_hex: "#6C40A0",
		ten_ma_gen: "Gen Chiến lược",
		y_nghia:
			"Bạn thích hỏi vì sao và nhìn ra quy luật sau các sự kiện. Bạn cẩn thận với số liệu và hiếm khi kết luận vội.",
		linh_vuc: "Nghiên cứu chính sách, phân tích quốc tế, học thuật",
		thu_tu: 3,
	},
	{
		id_mau_gen: CAM,
		ten_mau: "Cam",
		ma_hex: "#F27405",
		ten_ma_gen: "Gen Kinh tế đối ngoại",
		y_nghia:
			"Bạn nhạy với cơ hội, tính được lợi ích và chi phí rất nhanh. Bạn thích biến kế hoạch thành kết quả đo đếm được.",
		linh_vuc: "Thương mại quốc tế, xuất nhập khẩu, khởi nghiệp",
		thu_tu: 4,
	},
	{
		id_mau_gen: LA,
		ten_mau: "Xanh lá",
		ma_hex: "#2E9E5B",
		ten_ma_gen: "Gen Phát triển bền vững",
		y_nghia:
			"Bạn quan tâm đến con người và môi trường xung quanh. Bạn kiên trì với những việc cần thời gian dài mới thấy kết quả.",
		linh_vuc: "Tổ chức phi chính phủ, dự án cộng đồng, khí hậu",
		thu_tu: 5,
	},
	{
		id_mau_gen: DO,
		ten_mau: "Đỏ",
		ma_hex: "#D7263D",
		ten_ma_gen: "Gen Lãnh đạo",
		y_nghia:
			"Bạn dám quyết và dám chịu trách nhiệm. Khi mọi người còn lưỡng lự, bạn là người đứng ra chọn hướng đi.",
		linh_vuc: "Quản lý dự án, điều hành tổ chức, hoạt động đoàn hội",
		thu_tu: 6,
	},
];

// id_dap_an = id_cau_hoi * 10 + thu_tu (11 là đáp án A của câu 1).
// Điểm cố ý chia nhiều kiểu: 1 màu, 2 màu, 3 màu, mức 1 đến 5.
export const MOCK_CAU_HOI: MockCauHoi[] = [
	{
		id_cau_hoi: 1,
		noi_dung: "Lớp chia nhóm làm dự án, bạn thường nhận phần nào?",
		thu_tu: 1,
		dang_bat: true,
		dap_an: [
			{
				id_dap_an: 11,
				noi_dung: "Đứng ra phân việc và chốt hạn cho cả nhóm",
				thu_tu: 1,
				diem: { [DO]: 4, [TIM]: 1 },
			},
			{
				id_dap_an: 12,
				noi_dung: "Liên hệ, kết nối mọi người và giữ không khí vui vẻ",
				thu_tu: 2,
				diem: { [LAM]: 3, [VANG]: 1 },
			},
			{
				id_dap_an: 13,
				noi_dung: "Thiết kế slide và viết nội dung thuyết trình",
				thu_tu: 3,
				diem: { [VANG]: 4 },
			},
			{
				id_dap_an: 14,
				noi_dung: "Tìm số liệu, tài liệu rồi tổng hợp lại",
				thu_tu: 4,
				diem: { [TIM]: 3, [CAM]: 1 },
			},
		],
	},
	{
		id_cau_hoi: 2,
		noi_dung: "Hai người bạn thân cãi nhau, bạn sẽ làm gì?",
		thu_tu: 2,
		dang_bat: true,
		dap_an: [
			{
				id_dap_an: 21,
				noi_dung: "Nghe từng người rồi tìm điểm chung để hoà giải",
				thu_tu: 1,
				diem: { [LAM]: 5 },
			},
			{
				id_dap_an: 22,
				noi_dung: "Phân tích ai đúng ai sai rồi nói thẳng",
				thu_tu: 2,
				diem: { [TIM]: 2, [DO]: 2 },
			},
			{
				id_dap_an: 23,
				noi_dung: "Rủ cả hai đi ăn để tự làm lành",
				thu_tu: 3,
				diem: { [VANG]: 2, [LAM]: 1, [LA]: 1 },
			},
			{
				id_dap_an: 24,
				noi_dung: "Để hai bạn tự giải quyết, mình lo việc của mình",
				thu_tu: 4,
				diem: { [CAM]: 2 },
			},
		],
	},
	{
		id_cau_hoi: 3,
		noi_dung: "Nếu có một tuần rảnh và đủ kinh phí, bạn chọn gì?",
		thu_tu: 3,
		dang_bat: true,
		dap_an: [
			{
				id_dap_an: 31,
				noi_dung: "Dự hội nghị mô phỏng Liên Hợp Quốc ở nước ngoài",
				thu_tu: 1,
				diem: { [LAM]: 3, [DO]: 1 },
			},
			{
				id_dap_an: 32,
				noi_dung: "Tình nguyện trồng rừng hoặc dạy học ở vùng cao",
				thu_tu: 2,
				diem: { [LA]: 5 },
			},
			{
				id_dap_an: 33,
				noi_dung: "Thử mở một gian hàng nhỏ bán đồ tự làm",
				thu_tu: 3,
				diem: { [CAM]: 4, [VANG]: 1 },
			},
			{
				id_dap_an: 34,
				noi_dung: "Quay một loạt video về văn hoá địa phương",
				thu_tu: 4,
				diem: { [VANG]: 3, [LA]: 1 },
			},
		],
	},
	{
		id_cau_hoi: 4,
		noi_dung: "Đọc tin quốc tế, bạn chú ý điều gì trước?",
		thu_tu: 4,
		dang_bat: true,
		dap_an: [
			{
				id_dap_an: 41,
				noi_dung: "Các nước đang đàm phán với nhau ra sao",
				thu_tu: 1,
				diem: { [LAM]: 3, [TIM]: 1 },
			},
			{
				id_dap_an: 42,
				noi_dung: "Tỷ giá, giá hàng hoá và thị trường phản ứng thế nào",
				thu_tu: 2,
				diem: { [CAM]: 5 },
			},
			{
				id_dap_an: 43,
				noi_dung: "Nguyên nhân sâu xa và kịch bản tiếp theo",
				thu_tu: 3,
				diem: { [TIM]: 4 },
			},
			{
				id_dap_an: 44,
				noi_dung: "Người dân và môi trường bị ảnh hưởng thế nào",
				thu_tu: 4,
				diem: { [LA]: 3, [LAM]: 1 },
			},
		],
	},
	{
		id_cau_hoi: 5,
		noi_dung: "Trong một buổi tranh biện, bạn mạnh nhất ở đâu?",
		thu_tu: 5,
		dang_bat: true,
		dap_an: [
			{
				id_dap_an: 51,
				noi_dung: "Mở màn tự tin, kéo sự chú ý của khán giả",
				thu_tu: 1,
				diem: { [VANG]: 3, [DO]: 2 },
			},
			{
				id_dap_an: 52,
				noi_dung: "Bắt lỗi lập luận của đội bạn",
				thu_tu: 2,
				diem: { [TIM]: 5 },
			},
			{
				id_dap_an: 53,
				noi_dung: "Tìm cách nói để hai bên đều thấy hợp lý",
				thu_tu: 3,
				diem: { [LAM]: 4 },
			},
			{
				id_dap_an: 54,
				noi_dung: "Đưa ví dụ thực tế về chi phí và lợi ích",
				thu_tu: 4,
				diem: { [CAM]: 3, [TIM]: 1 },
			},
		],
	},
	{
		id_cau_hoi: 6,
		noi_dung: "Bạn được giao tổ chức một sự kiện của khoa. Việc đầu tiên là gì?",
		thu_tu: 6,
		dang_bat: true,
		dap_an: [
			{
				id_dap_an: 61,
				noi_dung: "Lập kế hoạch, chia đội và đặt mục tiêu rõ ràng",
				thu_tu: 1,
				diem: { [DO]: 5 },
			},
			{
				id_dap_an: 62,
				noi_dung: "Tìm nhà tài trợ và tính ngân sách",
				thu_tu: 2,
				diem: { [CAM]: 3, [DO]: 1 },
			},
			{
				id_dap_an: 63,
				noi_dung: "Nghĩ chủ đề, hình ảnh và cách quảng bá",
				thu_tu: 3,
				diem: { [VANG]: 5 },
			},
			{
				id_dap_an: 64,
				noi_dung: "Tính cách giảm rác thải và dùng vật liệu tái chế",
				thu_tu: 4,
				diem: { [LA]: 4, [TIM]: 1 },
			},
		],
	},
	{
		id_cau_hoi: 7,
		noi_dung: "Môn học nào làm bạn hứng thú nhất?",
		thu_tu: 7,
		dang_bat: true,
		dap_an: [
			{
				id_dap_an: 71,
				noi_dung: "Đàm phán quốc tế",
				thu_tu: 1,
				diem: { [LAM]: 4, [CAM]: 1 },
			},
			{
				id_dap_an: 72,
				noi_dung: "Truyền thông đối ngoại",
				thu_tu: 2,
				diem: { [VANG]: 4, [LAM]: 1 },
			},
			{
				id_dap_an: 73,
				noi_dung: "Lịch sử quan hệ quốc tế",
				thu_tu: 3,
				diem: { [TIM]: 3 },
			},
			{
				id_dap_an: 74,
				noi_dung: "Các vấn đề toàn cầu",
				thu_tu: 4,
				diem: { [LA]: 3, [TIM]: 2 },
			},
		],
	},
	{
		id_cau_hoi: 8,
		noi_dung: "Gặp một người nước ngoài lần đầu, bạn thường làm gì?",
		thu_tu: 8,
		dang_bat: true,
		dap_an: [
			{
				id_dap_an: 81,
				noi_dung: "Chủ động bắt chuyện và hỏi về đất nước của họ",
				thu_tu: 1,
				diem: { [LAM]: 3, [VANG]: 2 },
			},
			{
				id_dap_an: 82,
				noi_dung: "Quan sát cách họ nói rồi mới tham gia",
				thu_tu: 2,
				diem: { [TIM]: 2 },
			},
			{
				id_dap_an: 83,
				noi_dung: "Giới thiệu món ăn, địa điểm hay ở Việt Nam",
				thu_tu: 3,
				diem: { [VANG]: 2, [LA]: 2 },
			},
			{
				id_dap_an: 84,
				noi_dung: "Hỏi về công việc và cơ hội hợp tác",
				thu_tu: 4,
				diem: { [CAM]: 4, [DO]: 1 },
			},
		],
	},
	{
		id_cau_hoi: 9,
		noi_dung: "Khi nhóm gặp khủng hoảng sát hạn nộp, bạn sẽ làm gì?",
		thu_tu: 9,
		dang_bat: true,
		dap_an: [
			{
				id_dap_an: 91,
				noi_dung: "Nhận trách nhiệm và quyết định phương án ngay",
				thu_tu: 1,
				diem: { [DO]: 5, [CAM]: 1 },
			},
			{
				id_dap_an: 92,
				noi_dung: "Trấn an mọi người, phân lại việc cho hợp sức từng người",
				thu_tu: 2,
				diem: { [LAM]: 2, [LA]: 2, [DO]: 1 },
			},
			{
				id_dap_an: 93,
				noi_dung: "Rà lại xem sai từ đâu để sửa đúng chỗ",
				thu_tu: 3,
				diem: { [TIM]: 4 },
			},
			{
				id_dap_an: 94,
				noi_dung: "Xin lùi hạn và thương lượng lại yêu cầu",
				thu_tu: 4,
				diem: { [LAM]: 3, [CAM]: 2 },
			},
		],
	},
	{
		id_cau_hoi: 10,
		noi_dung: "Mười năm nữa bạn muốn mình là ai?",
		thu_tu: 10,
		dang_bat: true,
		dap_an: [
			{
				id_dap_an: 101,
				noi_dung: "Nhà ngoại giao làm việc ở đại sứ quán",
				thu_tu: 1,
				diem: { [LAM]: 5 },
			},
			{
				id_dap_an: 102,
				noi_dung: "Người sáng lập một doanh nghiệp xuất nhập khẩu",
				thu_tu: 2,
				diem: { [CAM]: 4, [DO]: 2 },
			},
			{
				id_dap_an: 103,
				noi_dung: "Chuyên gia của một tổ chức phi chính phủ về khí hậu",
				thu_tu: 3,
				diem: { [LA]: 5, [LAM]: 1 },
			},
			{
				id_dap_an: 104,
				noi_dung: "Nhà báo quốc tế hoặc người làm nội dung",
				thu_tu: 4,
				diem: { [VANG]: 4, [TIM]: 1 },
			},
		],
	},
];
