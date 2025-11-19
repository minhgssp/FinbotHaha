

import { GoogleGenAI } from "@google/genai";
import { TransactionGeminiResponse, Message, Sender } from '../../../../types.ts';
import { TRANSACTION_SYSTEM_INSTRUCTION } from '../../../../constants.ts';
import { transactionExtractionSchema } from './schemas.ts';
import { getLocalDateAsString } from '../../../utils/formatters.ts';

const formatHistory = (history: Message[]): string => {
    // Chỉ lấy text từ tin nhắn, bỏ qua các loại tin nhắn đặc biệt
    return history
      .map(msg => `${msg.sender === Sender.USER ? 'User' : 'AI'}: ${msg.text}`)
      .join('\n');
};

export const getTransactionResponse = async (
    history: Message[],
    apiKey: string,
): Promise<TransactionGeminiResponse> => {
    const ai = new GoogleGenAI({ apiKey });

    try {
        const model = "gemini-2.5-flash";
        const currentDate = getLocalDateAsString();

        const prompt = `
---
**Bối cảnh:**
Hôm nay là: ${currentDate}
---
**Lịch sử hội thoại gần đây:**
${history.length > 0 ? formatHistory(history) : 'Đây là tin nhắn đầu tiên.'}
---
Dựa vào bối cảnh và tin nhắn cuối cùng của người dùng, hãy phân tích và trả về đối tượng JSON theo schema.
`;

        const response = await ai.models.generateContent({
            model: model,
            contents: [{ parts: [{ text: prompt }] }],
            config: {
                systemInstruction: TRANSACTION_SYSTEM_INSTRUCTION,
                responseMimeType: "application/json",
                responseSchema: transactionExtractionSchema,
                temperature: 0.5,
            },
        });

        const jsonText = response.text.trim();
        if (jsonText.startsWith('{') && jsonText.endsWith('}')) {
             return JSON.parse(jsonText) as TransactionGeminiResponse;
        }
        
        console.warn("Received non-JSON response from Gemini, falling back.", jsonText);
        return {
             responseText: jsonText || "Cảm ơn bạn!",
        }
        
    } catch (error) {
        console.error("Error calling Gemini API for transactions:", error);
        return {
            responseText: "Xin lỗi, tôi đang gặp một chút sự cố. Vui lòng kiểm tra API Key của bạn hoặc thử lại.",
        };
    }
};