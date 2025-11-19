# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.0.6] - 2024-11-16

### Cải tiến

-   **Duy trì trạng thái hội thoại Onboarding:** Cuộc trò chuyện với trợ lý AI thiết lập ban đầu sẽ không bị reset khi người dùng chuyển đổi qua lại giữa các tab, mang lại trải nghiệm liền mạch hơn. Trạng thái hội thoại được nâng lên cấp ứng dụng để đảm bảo tính bền vững.

## [0.0.5] - 2024-11-15

### Thêm mới

-   **Tích hợp Lựa chọn API Key:**
    -   Bổ sung màn hình yêu cầu người dùng phải chọn API Key của riêng mình từ Google AI Studio trước khi sử dụng ứng dụng.
    -   Giải quyết triệt để lỗi hết hạn quota bằng cách cho phép người dùng sử dụng key cá nhân, đồng thời cung cấp liên kết đến tài liệu thanh toán của Google.
-   **Kiến trúc API linh hoạt:** Tái cấu trúc lại các lệnh gọi AI để khởi tạo một instance `GoogleGenAI` mới cho mỗi yêu cầu. Điều này đảm bảo ứng dụng luôn sử dụng API key mới nhất mà người dùng đã chọn.
-   **Cải thiện xử lý lỗi:** Thêm logic để phát hiện và thông báo cho người dùng khi API key được chọn không hợp lệ hoặc đã bị thu hồi.

### Sửa lỗi

-   Sửa lỗi `Cannot find namespace 'React'` trong `useOnboarding.ts` bằng cách import trực tiếp các type `Dispatch` và `SetStateAction` từ thư viện 'react'.

## [0.0.4] - 2024-11-14

### Thêm mới

-   **Quản lý Giao dịch Hàng ngày:**
    -   Bổ sung một tab "Giao dịch" mới cho phép người dùng nhập các khoản thu và chi hàng ngày.
    -   Giao diện bao gồm một form nhập liệu nhanh và danh sách các giao dịch gần đây.
-   **Lưu trữ Dữ liệu Bền vững:**
    -   Tích hợp `localStorage` để tự động lưu lại toàn bộ trạng thái của ứng dụng (thu nhập, mục tiêu, giao dịch).
    -   Dữ liệu sẽ được khôi phục khi người dùng tải lại trang, đảm bảo không bị mất thông tin.
-   **Bảng điều khiển Động (Dynamic Dashboard):**
    -   Nâng cấp `Dashboard` để kết nối với dữ liệu giao dịch.
    -   Nếu người dùng có mục tiêu là "Ngân sách tháng", Bảng điều khiển sẽ hiển thị một thanh tiến trình trực quan, thể hiện số tiền đã chi tiêu so với ngân sách.

## [0.0.3] - 2024-11-13

*Ghi chú: Bắt đầu triển khai lúc 7h40 ngày 13/11.*

### Thêm mới

-   **Nâng cấp Mô hình Dữ liệu:**
    -   **Thu nhập phức hợp:** Hệ thống giờ đây có thể ghi nhận các nguồn thu nhập dưới nhiều hình thức: `FIXED` (cố định), `ESTIMATED` (ước lượng), và `RANGE` (khoảng dao động).
    -   **Mục tiêu đa dạng:** Mở rộng các loại mục tiêu tài chính người dùng có thể thiết lập, bao gồm `ACCUMULATE` (tích lũy), `MONTHLY_SAVINGS` (tiết kiệm hàng tháng), và `MONTHLY_BUDGET` (ngân sách chi tiêu).
-   **Nâng cao Trí thông minh của AI:**
    -   **Trích xuất dữ liệu có cấu trúc:** Trợ lý AI được nâng cấp để có thể phân tích các câu trả lời phức tạp của người dùng và trích xuất chính xác thành các cấu trúc dữ liệu mới.
    -   **Luồng hội thoại chi tiết:** Bổ sung bước xác nhận cuối cùng, nơi AI tóm tắt lại toàn bộ thông tin tài chính chi tiết đã thu thập để người dùng kiểm tra trước khi hoàn tất.
-   **Cải tiến Bảng điều khiển (Dashboard):**
    -   Thiết kế lại giao diện để hiển thị chi tiết từng nguồn thu nhập và mục tiêu tài chính một cách trực quan, rõ ràng.
    -   Bổ sung logic tính toán và hiển thị "Tổng thu nhập tối thiểu" dựa trên các nguồn thu nhập không chắc chắn.

### Sửa lỗi (Fixed)

-   Sửa lỗi nghiêm trọng về việc nạp module (`Failed to resolve module specifier`) trên toàn bộ ứng dụng. Vấn đề này phát sinh do sự thiếu nhất quán trong các đường dẫn import sau khi tái kiến trúc, ngăn ứng dụng khởi chạy. Đã rà soát và chuẩn hóa lại tất cả các đường dẫn để đảm bảo hoạt động ổn định.

## [0.0.2] - 2024-07-24

### Thay đổi

-   **Tái cấu trúc giao diện thành Tab:** Giao diện người dùng chính được chia thành 3 tab riêng biệt: "Trợ lý AI", "Công việc", và "Bảng điều khiển" để cải thiện sự tổ chức và khả năng mở rộng.
-   **Giao diện Mobile-First & Thanh điều hướng dưới cùng:** Thay thế hệ thống tab ban đầu bằng một thanh điều hướng cố định ở dưới cùng màn hình (bottom navigation bar). Thiết kế này ưu tiên trải nghiệm trên thiết bị di động, sử dụng icon trực quan và luôn hiển thị để dễ dàng truy cập.
-   **Điều chỉnh bố cục:** Cập nhật bố cục của các thành phần để tương thích với thanh điều hướng cố định, đảm bảo không có nội dung nào bị che khuất.

### Thêm mới

-   **Thành phần Bảng điều khiển (Dashboard):** Thêm một trang giữ chỗ cho tính năng "Bảng điều khiển", sẵn sàng cho việc phát triển trong tương lai.
-   **Bộ Icons cho điều hướng:** Bổ sung các icon cho Trợ lý AI, Công việc và Bảng điều khiển để làm cho thanh điều hướng trở nên sinh động và dễ hiểu hơn.

## [0.0.1] - 2024-07-23

### Thêm mới

-   **Khởi tạo dự án:** Thiết lập cấu trúc ban đầu cho ứng dụng React với TypeScript.
-   **Onboarding AI Agent:** Tích hợp Google Gemini API để tạo một trợ lý AI hướng dẫn người dùng mới.
-   **Giao diện Chat:** Xây dựng cửa sổ chat cho phép người dùng tương tác với AI, bao gồm việc gửi tin nhắn văn bản và chọn từ các gợi ý có sẵn.
-   **Danh sách công việc (Todolist):** Hiển thị một danh sách các bước cần hoàn thành trong quá trình thiết lập, tự động cập nhật trạng thái khi người dùng tiến triển trong cuộc trò chuyện.
-   **Logic xử lý luồng hội thoại:** Triển khai state machine để quản lý các bước của quá trình onboarding (Chào hỏi, hỏi thu nhập, hỏi mục tiêu, hoàn thành).