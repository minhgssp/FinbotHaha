# Product Requirements Document: Quản lý Giao dịch Hàng ngày - v0.0.4

**Tên tính năng:** Quản lý và Theo dõi Giao dịch Hàng ngày
**Phiên bản:** 0.0.4
**Trạng thái:** Sẵn sàng triển khai
**Ngày:** 14/11/2024

---

### 1. Tổng quan

Phiên bản 0.0.3 đã thành công trong việc tạo ra một luồng onboarding thông minh, giúp người dùng thiết lập bức tranh tài chính tổng quan. Giờ là lúc biến bức tranh tĩnh đó thành một công cụ sống động và hữu ích. Tính năng "Quản lý Giao dịch" sẽ cho phép người dùng ghi lại các khoản thu và chi hàng ngày, là tính năng cốt lõi giúp người dùng bám sát mục tiêu và ngân sách đã đề ra.

### 2. Mục tiêu

-   **Tăng mức độ tương tác:** Khuyến khích người dùng quay lại ứng dụng hàng ngày để ghi chép chi tiêu.
-   **Mang lại giá trị thực tiễn:** Giúp người dùng trả lời câu hỏi "Tiền của tôi đã đi đâu?" và "Tôi có đang đi đúng hướng với ngân sách không?".
-   **Hoàn thiện vòng lặp tính năng:** Kết nối trực tiếp hành động (chi tiêu) với mục tiêu (ngân sách), làm cho Bảng điều khiển trở nên động và có ý nghĩa hơn.
-   **Nâng cao trải nghiệm:** Cung cấp một giao diện nhập liệu nhanh chóng, đơn giản, phù-hợp với nhu cầu ghi chép "đang di chuyển" trên điện thoại.

### 3. Yêu cầu Chức năng

#### 3.1. Mô hình Dữ liệu Mới (`types.ts`)

-   Tạo một `interface` mới tên là `Transaction` bao gồm: `id` (string), `description` (string), `amount` (number), `type` (enum: 'expense' | 'income'), và `date` (string).

#### 3.2. Màn hình Giao dịch Mới (Feature Slice: `transactions`)

-   Tạo một feature slice mới tại `src/features/transactions`.
-   **`TransactionsScreen.tsx`**: Màn hình này sẽ là một tab mới, bao gồm:
    -   **Form Nhập liệu Nhanh:** Một form đơn giản ở trên cùng để người dùng nhập `description` và `amount` của một giao dịch (mặc định là 'expense').
    -   **Danh sách Giao dịch:** Hiển thị danh sách các giao dịch gần đây, sắp xếp theo ngày tháng mới nhất.

#### 3.3. Điều hướng & Quản lý State (`App.tsx`)

-   Thêm một tab "Giao dịch" vào thanh điều hướng dưới cùng.
-   Quản lý state `transactions` ở cấp cao nhất (`App.tsx`).
-   Tạo hàm `handleAddTransaction` để thêm giao dịch mới vào state.
-   Khi giao dịch đầu tiên được thêm, tự động đánh dấu hoàn thành mục "Nhập thu chi hàng ngày" trong danh sách công việc.

#### 3.4. Tích hợp với Bảng điều khiển (`DashboardScreen.tsx` & `GoalCard.tsx`)

-   Truyền danh sách `transactions` xuống `DashboardScreen`.
-   Nâng cấp `GoalCard`: Nếu mục tiêu là `MONTHLY_BUDGET`, card này phải:
    -   Tính tổng số tiền đã chi tiêu trong tháng hiện tại từ danh sách giao dịch.
    -   Hiển thị một thanh tiến trình thể hiện "Đã chi tiêu / Ngân sách".
    -   Cung cấp thông tin chi tiết về số tiền còn lại.

#### 3.5. Lưu trữ Dữ liệu Bền vững

-   Toàn bộ state của ứng dụng (thu nhập, mục tiêu, giao dịch) phải được lưu vào `localStorage` của trình duyệt.
-   Khi ứng dụng được tải lại, state phải được khôi phục từ `localStorage`, đảm bảo người dùng không bị mất dữ liệu.

### 4. Yêu cầu Phi chức năng

-   **Hiệu suất:** Giao diện nhập liệu và danh sách phải mượt mà, không gây giật lag.
-   **Tính tin cậy:** Dữ liệu lưu trong `localStorage` phải được xử lý an toàn, tránh bị lỗi khi parse dữ liệu.

### 5. Số liệu Thành công

-   **Tỷ lệ sử dụng tính năng:** 70% người dùng hoàn thành onboarding sẽ sử dụng tính năng nhập giao dịch ít nhất một lần.
-   **Tần suất quay lại:** Tăng 25% số lượng người dùng mở lại ứng dụng sau 1 ngày.