import { Type } from "@google/genai";
import { TRANSACTION_CATEGORIES } from "../../../../constants.ts";

export const transactionExtractionSchema = {
    type: Type.OBJECT,
    properties: {
        responseText: { 
            type: Type.STRING, 
            description: "Nội dung văn bản để hiển thị cho người dùng. Có thể là câu hỏi xác nhận hoặc câu hỏi làm rõ thông tin." 
        },
        extractedTransaction: {
            type: Type.OBJECT,
            description: "Đối tượng chứa thông tin giao dịch đã được bóc tách. Chỉ trả về khi đã có đủ thông tin.",
            nullable: true,
            properties: {
                description: { 
                    type: Type.STRING,
                    description: "Mô tả chi tiết của giao dịch."
                },
                amount: { 
                    type: Type.NUMBER,
                    description: "Số tiền của giao dịch."
                },
                type: { 
                    type: Type.STRING, 
                    enum: ['income', 'expense'],
                    description: "Loại giao dịch: 'income' cho thu, 'expense' cho chi."
                },
                category: {
                    type: Type.STRING,
                    enum: TRANSACTION_CATEGORIES,
                    description: "Danh mục phù hợp nhất được chọn từ danh sách cung cấp."
                },
                date: {
                    type: Type.STRING,
                    description: "Ngày giao dịch theo định dạng YYYY-MM-DD. Nếu không được người dùng chỉ định, mặc định là ngày hiện tại.",
                    nullable: true
                },
                frequency: {
                    type: Type.STRING,
                    enum: ['monthly'],
                    description: "Tần suất lặp lại của giao dịch. Chỉ trả về 'monthly' nếu phát hiện được.",
                    nullable: true
                },
            },
            required: ["description", "amount", "type", "category"]
        },
    },
    required: ["responseText"]
};