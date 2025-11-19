import { Type } from "@google/genai";
import { AssetType, LiabilityType, AssetActionType } from "../../../../types.ts";

export const assetDebtExtractionSchema = {
    type: Type.OBJECT,
    properties: {
        responseText: { 
            type: Type.STRING, 
            description: "Nội dung văn bản để hiển thị cho người dùng. Luôn là câu hỏi xác nhận, câu hỏi làm rõ thông tin, hoặc câu trả lời cho câu hỏi truy vấn." 
        },
        extractedData: {
            type: Type.OBJECT,
            description: "Đối tượng chứa thông tin về hành động liên quan đến tài sản/nợ. Trả về `null` nếu tin nhắn của người dùng là một câu hỏi.",
            nullable: true,
            properties: {
                action: {
                    type: Type.STRING,
                    enum: Object.values(AssetActionType),
                    description: "Hành động chính được xác định: BUY, SELL, BORROW, REPAY, UPDATE."
                },
                itemType: {
                    type: Type.STRING,
                    enum: ['asset', 'liability'],
                    description: "Phân loại là 'asset' (tài sản) hay 'liability' (nợ)."
                },
                name: { 
                    type: Type.STRING,
                    description: "Tên của tài sản hoặc khoản nợ."
                },
                amount: { 
                    type: Type.NUMBER,
                    description: "Giá trị/số tiền của hành động (tổng giá trị giao dịch, số tiền vay/trả)."
                },
                type: { 
                    type: Type.STRING, 
                    enum: [...Object.values(AssetType), ...Object.values(LiabilityType)],
                    description: "Loại chi tiết của tài sản hoặc nợ. Bắt buộc khi tạo mới.",
                    nullable: true,
                },
                lender: {
                    type: Type.STRING,
                    description: "Bên cho vay (chỉ áp dụng cho nợ).",
                    nullable: true
                },
                quantity: {
                    type: Type.NUMBER,
                    description: "Số lượng của tài sản được mua/bán (ví dụ: 3 chỉ vàng).",
                    nullable: true
                },
                unit: {
                    type: Type.STRING,
                    description: "Đơn vị của tài sản được mua/bán (ví dụ: 'chỉ', 'lượng', 'cổ phiếu').",
                    nullable: true
                },
            },
            required: ["action", "itemType", "name", "amount"]
        },
    },
    required: ["responseText"]
};