# Ghi nhận và Phân tích Lỗi: Vấn đề Đường dẫn Module (Module Path Resolution)

**Ngày:** 13/11/2024
**Người ghi nhận:** AI Assistant

---

### 1. Bối cảnh

Sau khi hoàn tất quá trình tái kiến trúc ứng dụng từ cấu trúc monolithic sang **Mini-modules / Feature-Sliced**, ứng dụng đã không thể khởi chạy và trình duyệt báo lỗi nghiêm trọng:

```
Uncaught TypeError: Failed to resolve module specifier "..."
```

Lỗi này liên tục xuất hiện với các đường dẫn khác nhau, cho thấy đây là một vấn đề mang tính hệ thống chứ không phải lỗi đơn lẻ.

### 2. Phân tích Nguyên nhân Gốc rễ (Root Cause Analysis)

#### 2.1. Triệu chứng ban đầu và Giả định sai lầm

-   **Triệu chứng:** Trình duyệt không thể tìm thấy các module được `import` trong các tệp JavaScript/TypeScript. Lỗi ban đầu chỉ ra các tệp trong `App.tsx` sử dụng bí danh `@/...`.
-   **Giả định sai lầm:** Ban đầu, vấn đề được cho là chỉ do việc sử dụng đường dẫn bí danh (`@/features/...`) trong một môi trường không được cấu hình để xử lý chúng (ví dụ: thiếu `paths` trong `tsconfig.json` hoặc cấu hình tương đương cho bundler).

#### 2.2. Quá trình Điều tra

Sau khi sửa các đường dẫn bí danh thành đường dẫn tương đối, lỗi vẫn tiếp diễn nhưng ở các tệp con bên trong thư mục `src/features/...`. Điều này cho thấy vấn đề nằm ở sâu hơn.

Cuộc rà soát toàn diện đã phát hiện ra nguyên nhân cốt lõi: **Sự thiếu nhất quán trong cấu trúc thư mục và cách các module tham chiếu lẫn nhau.**

Cụ thể:
1.  **Cấu trúc không đồng nhất:** Các tệp dùng chung quan trọng như `types.ts`, `constants.ts`, và thư mục `components` được đặt ở thư mục gốc, **ngang hàng** với thư mục `src`.
2.  **Đường dẫn tương đối sai:** Các tệp nằm sâu bên trong `src` (ví dụ: `src/features/onboarding/hooks/useOnboarding.ts`) đã cố gắng `import` các tệp ở thư mục gốc bằng các đường dẫn như `../../types` thay vì `../../../types`. Chúng đã tính toán sai số cấp cần "đi ra" để đến được thư mục gốc.
3.  **Hệ quả:** Trình duyệt, khi cố gắng nạp các module theo chuỗi phụ thuộc, đã không thể tìm thấy tệp ở các đường dẫn sai lệch này, dẫn đến lỗi `Failed to resolve module specifier`.

### 3. Giải pháp Toàn diện

Giải pháp không chỉ đơn thuần là sửa một vài dòng code, mà là một cuộc "chuẩn hóa" toàn bộ hệ thống import của dự án:

1.  **Rà soát Toàn bộ:** Kiểm tra mọi câu lệnh `import` trong tất cả các tệp `.tsx`.
2.  **Chuẩn hóa Đường dẫn:** Sửa lại tất cả các đường dẫn tương đối để chúng phản ánh chính xác vị trí của tệp được import so với tệp đang import.
    -   Ví dụ, đối với một tệp tại `src/features/dashboard/components/GoalCard.tsx`:
        -   Để import `types.ts` (ở gốc), đường dẫn phải là `../../../types`.
        -   Để import `formatters.ts` (tại `src/utils/`), đường dẫn phải là `../../utils/formatters`.
3.  **Loại bỏ các tệp rỗng:** Dọn dẹp các tệp placeholder còn sót lại từ quá trình tái kiến trúc để đảm bảo mã nguồn sạch sẽ và không gây nhầm lẫn.

### 4. Bài học Kinh nghiệm (Lessons Learned)

1.  **Tính nhất quán là Vua:** Một cấu trúc thư mục nhất quán là nền tảng của một dự án dễ bảo trì. Việc đặt tất cả mã nguồn ứng dụng vào trong `src` và các tệp cấu hình ra ngoài là một quy ước phổ biến và nên được tuân thủ để tránh các vấn đề về đường dẫn.
2.  **Hiểu môi trường của bạn:** Lỗi đường dẫn bí danh `@/` là một lời nhắc nhở rằng chúng ta cần hiểu rõ các công cụ mình đang sử dụng (Vite, Webpack, `importmap`, etc.) và cấu hình chúng một cách chính xác.
3.  **Tái kiến trúc cần sự tỉ mỉ:** Khi thực hiện tái cấu trúc lớn, việc kiểm tra lại các "đường nối" (như câu lệnh `import`) là cực kỳ quan trọng. Các công cụ tìm kiếm và thay thế toàn cục (global find-and-replace) có thể hữu ích nhưng cần được sử dụng một cách cẩn trọng.
4.  **Lỗi Hệ thống vs. Lỗi Triệu chứng:** Lỗi ban đầu chỉ là một triệu chứng. Thay vì chỉ sửa lỗi nhìn thấy, hãy luôn đặt câu hỏi "Tại sao lỗi này lại xảy ra?" để tìm ra và khắc phục nguyên nhân gốc rễ, tránh việc phải sửa lỗi vặt liên tục.
