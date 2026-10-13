# 4 NGUYÊN TẮC THIẾT KẾ PHẦN MỀM CỐT LÕI (SOFTWARE DESIGN PRINCIPLES)

Tài liệu này đúc kết **4 nguyên tắc thiết kế phần mềm then chốt** được rút ra từ thực tế triển khai và vận hành các hệ thống quy mô lớn. Đây là kim chỉ nam tư duy kiến trúc bổ trợ cho [.ai/rules/quy_tac_code.md](./quy_tac_code.md), giúp lập trình viên và AI tránh các cạm bẫy thiết kế phổ biến, hạn chế nợ kỹ thuật (technical debt), và giữ cho hệ thống luôn ổn định, dễ bảo trì.

> [!NOTE]
> Mọi nguyên tắc đều đi kèm sự đánh đổi (trade-offs) và ngữ cảnh áp dụng (nuance). Tuy nhiên, 4 nguyên tắc dưới đây đóng vai trò là **lựa chọn mặc định (sensible defaults)** đáng tin cậy hơn so với các thói quen suy nghĩ theo lối mòn thường thấy trong các bản thiết kế và code review.

---

## 1. DUY TRÌ MỘT NGUỒN SỰ THẬT DUY NHẤT (SINGLE SOURCE OF TRUTH - SSOT)

> *"Nếu có hai nguồn sự thật, một cái gần như chắc chắn sai. Nếu chưa sai, thì... rồi cũng sẽ sai thôi."*

### 1.1. Bản chất vấn đề
Khi cùng một trạng thái (state) hoặc thông tin logic được duy trì song song ở hai vị trí khác nhau trong hệ thống:
- Hệ thống rơi vào nguy cơ **lỗi mất đồng bộ (synchronization bugs)**.
- Khi có thay đổi phát sinh, lập trình viên buộc phải nhớ cập nhật cả hai nơi. Chỉ cần một nhánh rẽ logic, một race condition, hoặc một lỗi mạng/transaction xảy ra ở một bên, dữ liệu sẽ bị lệch vĩnh viễn.

### 1.2. Quy tắc: Base State vs. Derived State
- **Base State (Trạng thái gốc):** Dữ liệu nguyên thủy duy nhất được lưu trữ (tại CSDL hoặc Server State).
- **Derived State (Dữ liệu phái sinh):** Bất kỳ dữ liệu nào có thể suy diễn hoặc tính toán được từ Base State thì **BẮT BUỘC PHẢI TÍNH TOÁN TỨC THÌ (ON-THE-FLY)**, tuyệt đối không lưu trữ thêm một bản sao độc lập.

```
[Base State: Total Balance & Min Reserve] 
         │
         ▼ (Tính toán on-the-fly)
[Derived State: Spendable Balance] ──► Không bao giờ lưu vào DB/State riêng
```

### 1.3. Ví dụ đối chiếu thực tế

#### Trong Frontend (React / Mantine UI)
* **Anti-pattern:** Lưu danh sách sinh viên `students` vào state, đồng thời lưu thêm state `activeCount` và cập nhật thủ công mỗi khi thêm/xóa sinh viên.
  ```tsx
  // ❌ SAI: Hai nguồn sự thật, dễ lệch khi sync
  const [students, setStudents] = useState<Student[]>([]);
  const [activeCount, setActiveCount] = useState<number>(0);
  ```
* **Best Practice:** Chỉ lưu danh sách, số lượng sinh viên kích hoạt được derive tức thì.
  ```tsx
  // ✅ ĐÚNG: Derived on-the-fly, luôn chính xác 100%
  const [students, setStudents] = useState<Student[]>([]);
  const activeCount = useMemo(() => students.filter(s => s.isActive).length, [students]);
  ```

#### Trong Backend & CSDL (Next.js server / Supabase Postgres)
* **Anti-pattern:** Bảng `cau_hoi` lưu thêm cột `tong_diem_toi_da` cho từng màu và cố cập nhật mỗi khi admin sửa điểm đáp án. Chỉ cần quên một chỗ là phần trăm kết quả bị sai.
* **Best Practice:** Điểm tối đa của từng màu được tính on-the-fly từ bảng `diem_dap_an` mỗi lần chấm (vài chục dòng, rẻ không đáng kể).
* **Ngoại lệ có chủ đích:** `ket_qua` lưu lại `bang_xep_hang`, `id_mau_chinh` và `ma_hex_rieng` vì đó là **ảnh chụp kết quả sinh viên đã thấy tại thời điểm làm bài**, không phải dữ liệu phái sinh của trạng thái hiện tại. Nếu admin đổi điểm sau đó, kết quả cũ vẫn giữ nguyên; muốn chấm lại thì chạy lại từ cột `dap_an_da_chon`.

> [!TIP]
> **Đánh đổi (Trade-off):** Chi phí CPU để tính toán on-the-fly là cực kỳ rẻ (vài nano-giây hoặc micro-giây). Chi phí khắc phục dữ liệu bị sai lệch do bất đồng bộ đắt hơn gấp hàng nghìn lần. Chỉ xem xét lưu trữ dữ liệu tính sẵn khi chi phí tính toán thực sự trở thành nút thắt cổ chai đã được đo lường (profiled).

---

## 2. PLEASE REPEAT YOURSELF (PRY) - THÀ LẶP LẠI CODE HƠN LÀ TRỪU TƯỢNG HÓA SAI

> *"Duplication is far cheaper than the wrong abstraction." — Sandi Metz*

### 2.1. Bản chất vấn đề
Nguyên lý **DRY (Don't Repeat Yourself)** thường bị lạm dụng một cách máy móc. Khi thấy hai đoạn code hoặc component có cấu trúc "trông na ná nhau", lập trình viên vội vàng gom chúng thành một hàm chung, class dùng chung, hoặc Generic Component.

Tuy nhiên:
- **Hình ngũ giác có thể trông giống hình lục giác, nhưng bản chất hình học của chúng hoàn toàn khác nhau.**
- Hai đoạn code giống nhau về hình thức ở hiện tại có thể có **lý do thay đổi (axes of change) hoàn toàn khác nhau** trong tương lai.
- Hậu quả: Class/Component "tái sử dụng" đó liên tục bị chắp vá thêm các tham số đặc biệt, cờ boolean (`isStudent`, `isLecturer`, `enableModeB`), các constructor/method biến dị. Cuối cùng, nó biến thành một con quái vật **"Frankenstein"** cồng kềnh, vi phạm Single Responsibility Principle, cực kỳ khó đọc và không ai dám sửa.

### 2.2. Quy tắc áp dụng PRY
1. **Chấp nhận trùng lặp tạm thời:** Thà sao chép một vài dòng code hoặc dựng hai component độc lập còn hơn tạo ra một tầng trừu tượng gượng ép.
2. **Quy tắc số ba (Rule of Three):** Chỉ xem xét trừu tượng hóa khi hành vi giống hệt nhau lặp lại từ lần thứ 3 trở lên VÀ chúng chia sẻ chung một mục đích nghiệp vụ cốt lõi.
3. **Dễ xóa bỏ hơn là dễ tái sử dụng:** Hai đoạn code độc lập rất dễ sửa đổi hoặc xóa bỏ mà không sợ ảnh hưởng dây chuyền đến các module khác.

### 2.3. Bảng so sánh tư duy

| Tiêu chí | Trừu tượng hóa sớm (Premature DRY) | Chấp nhận lặp lại có chủ đích (PRY) |
| :--- | :--- | :--- |
| **Độ phức tạp ban đầu** | Cao (phải nghĩ abstraction, generic, prop) | Thấp (code tường minh, đọc hiểu ngay) |
| **Khi nghiệp vụ rẽ nhánh** | Nhồi thêm flag `if/else`, sinh ra "Frankenstein" | Sửa trực tiếp module đó mà không ảnh hưởng bên kia |
| **Khớp nối (Coupling)** | Khớp nối chặt giữa các use case khác nhau | Hoàn toàn tách biệt (Decoupled) |
| **Chi phí refactor** | Rất cao và rủi ro | Thấp, dễ dàng gom lại khi mô hình đã thực sự rõ ràng |

---

## 3. ĐỪNG LẠM DỤNG MOCKS (REALISM OVER CONVENIENCE)

> *"Với mocks, chúng ta đánh đổi độ chính xác của kiểm thử để đổi lấy sự dễ dàng khi viết bài test."*

### 3.1. Bản chất vấn đề
Mocking là một kỹ thuật hữu ích khi cần cô lập các dịch vụ bên ngoài khó kiểm soát (thanh toán bên thứ ba, gửi SMS). Tuy nhiên, lạm dụng mocks tạo ra một cảm giác an toàn giả tạo (**False Sense of Security**):
- Tất cả các unit test đều xanh rì (pass 100%), nhưng khi đưa lên môi trường thật (Production) thì hệ thống gãy đổ.
- Lý do: Mock chỉ phản ánh **giả định chủ quan** của người viết test tại thời điểm viết. Khi API thật hoặc tầng sâu bên dưới thay đổi hành vi/contract, mock không tự cập nhật, che giấu hoàn toàn lỗi thực tế.

### 3.2. Ba hiểm họa khi lạm dụng Mocks (Từ Google Engineering)
Theo tài liệu danh tiếng *Testing on the Toilet (Google, 2013)*:
1. **Bài test khó đọc và khó hiểu hơn:** Bên cạnh logic kiểm tra nghiệp vụ, lập trình viên phải đọc thêm hàng loạt dòng thiết lập mock (`Setup`, `Returns`, `Verify`).
2. **Làm lộ chi tiết cài đặt (Implementation Details) và sinh ra Brittle Tests:** Bài test bị buộc chặt vào cách thức hàm được cài đặt bên trong thay vì kiểm tra kết quả đầu ra. Khi refactor mã nguồn (dù hành vi nghiệp vụ giữ nguyên), các bài test mock lập tức bị vỡ.
3. **Độ tin cậy thấp (Low Fidelity):** Bài test chỉ có giá trị NẾU mock hoạt động giống hệt 100% dịch vụ thật. Trong thực tế, điều này hầu như không bao giờ duy trì được lâu dài.

### 3.3. Định hướng cho dự án IR DNA
- **Không viết unit test hình thức bằng mock.** Ngoại lệ duy nhất: `src/lib/scoring.ts` là hàm thuần (không gọi CSDL), có test Vitest với dữ liệu thật của bộ đề mẫu.
- **Kiểm thử trên môi trường thật:** CSDL Supabase thật (project dev), link xem thử của Vercel cho từng PR, và thao tác tay trên điện thoại thật theo hướng dẫn test trong PR.

---

## 4. HẠN CHẾ TỐI ĐA MUTABLE STATE (MINIMIZE MUTABLE STATE)

> *"Máy tính ngày nay cực kỳ nhanh. Đừng tối ưu hóa sớm bằng cách lưu trữ và cache mọi thứ."*

### 4.1. Cạm bẫy "Tối ưu hóa sớm" (Premature Optimization)
Trong quá trình phát triển, lập trình viên thường có phản xạ:
- Vội vã lưu mọi kết quả tính toán trung gian vào CSDL.
- Dựng hệ thống cache phức tạp ngay từ phiên bản đầu tiên.
- Duy trì nhiều biến mutable có thể thay đổi ở nhiều tầng khác nhau.

Hậu quả là **Mutable State** trở thành nguồn cơn của hầu hết các lỗi nghiêm trọng:
- Race condition giữa các luồng/request.
- Dữ liệu rác hoặc dữ liệu lỗi thời (stale cache).
- Khó truy vết trạng thái hệ thống khi xảy ra sự cố.

### 4.2. Tư duy thiết kế phiên bản v1: Đơn giản và Bất biến
1. **Tận dụng sức mạnh phần cứng hiện đại:** CPU ngày nay có thể thực hiện hàng triệu phép tính trong vài mili-giây. Một vài phép tính toán lặp lại trong bộ nhớ RAM không ảnh hưởng đến trải nghiệm người dùng, nhưng giúp mã nguồn sạch hơn và loại bỏ hoàn toàn bài toán invalidation.
2. **Phân định ranh giới lưu trữ:** Chỉ lưu vào CSDL những gì thực sự là **Persistent State** (dữ liệu nghiệp vụ cốt lõi cần lưu trữ lâu dài). Những gì có thể suy diễn, hãy tính toán on-the-fly.
3. **Phát triển theo từng lát cắt độc lập (Slice-by-slice):** Hạn chế trạng thái dùng chung giúp các tính năng phát triển độc lập, không bị ảnh hưởng chéo khi mở rộng hệ thống.

---

## 5. MA TRẬN TỔNG KẾT & QUY TẮC THỰC THI

| Nguyên tắc | Khẩu hiệu hành động | Khi nào nên áp dụng | Điều cần cảnh giác (Nuance / Trade-off) |
| :--- | :--- | :--- | :--- |
| **1. Single Source of Truth** | *"Compute on-the-fly, don't store derived data"* | Quản lý state UI, tính toán số dư/slot, trạng thái đơn hàng | Nếu phép tính toán cực kỳ nặng (ML, xử lý ảnh, aggregate triệu dòng) thì mới cân nhắc cache có kiểm soát. |
| **2. Please Repeat Yourself** | *"Duplication over wrong abstraction"* | Tính năng mới, v1, hai module có lý do nghiệp vụ thay đổi khác nhau | Khi đoạn logic nghiệp vụ là bất biến và đã lặp lại giống hệt nhau trên 3 nơi (Rule of Three). |
| **3. Đừng lạm dụng Mocks** | *"Real dependencies over brittle mocks"* | Kiểm thử tích hợp, kết nối CSDL, gọi API | Các dịch vụ bên thứ ba có tính phí hoặc rủi ro (SMS, Cổng thanh toán production). |
| **4. Hạn chế Mutable State** | *"Immutability by default; máy tính rất nhanh"* | Thiết kế luồng xử lý dữ liệu, state management trong React/Redux/Server | Khi cần xử lý luồng dữ liệu stream liên tục với yêu cầu hiệu năng cực đoan. |

---

## 6. LIÊN HỆ VỚI DỰ ÁN IR DNA – FIND YOUR COLOR

- **Mỗi tính năng một lát cắt:** Server Action / route handler của tính năng nào nằm cạnh tính năng đó. Không dựng sẵn lớp service hay repository dùng chung khi chưa cần (Nguyên tắc 2 - PRY).
- **RSC & Client Components:** Bộ đề lấy từ server. Câu đang làm, tiến độ, đáp án đã chọn chỉ là một mảng state duy nhất; số câu đã làm, phần trăm tiến độ được tính từ mảng đó (Nguyên tắc 1 & 4).
- **Kiểm thử:** Test thuật toán chấm điểm bằng dữ liệu thật, còn lại kiểm thử luồng thật trên link xem thử (Nguyên tắc 3).
