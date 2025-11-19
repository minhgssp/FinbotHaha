
import { GoogleGenAI } from "@google/genai";
import { AssetDebtGeminiResponse, Message, Sender, Asset, Liability } from '../../../../types.ts';
import { ASSET_DEBT_SYSTEM_INSTRUCTION } from '../../../../constants.ts';
import { assetDebtExtractionSchema } from './schemas.ts';

const formatHistory = (history: Message[]): string => {
    return history
      .map(msg => `${msg.sender === Sender.USER ? 'User' : 'AI'}: ${msg.text}`)
      .join('\n');
};

export const getAssetDebtResponse = async (
    history: Message[], 
    assets: Asset[], 
    liabilities: Liability[],
    apiKey: string,
): Promise<AssetDebtGeminiResponse> => {
    const ai = new GoogleGenAI({ apiKey });

    try {
        const model = "gemini-2.5-flash";
        const prompt = `
---
**Dữ liệu tài chính hiện tại của người dùng (JSON):**
${JSON.stringify({ assets, liabilities }, null, 2)}
---
**Lịch sử hội thoại:**
${history.length > 0 ? formatHistory(history) : 'Đây là tin nhắn đầu tiên.'}
---
Dựa vào DỮ LIỆU HIỆN TẠI và LỊCH SỬ HỘI THOẠI, hãy phân tích tin nhắn cuối cùng của người dùng và trả về đối tượng JSON theo schema.`;

        const response = await ai.models.generateContent({
            model: model,
            contents: [{ parts: [{ text: prompt }] }],
            config: {
                systemInstruction: ASSET_DEBT_SYSTEM_INSTRUCTION,
                responseMimeType: "application/json",
                responseSchema: assetDebtExtractionSchema,
                temperature: 0.5,
            },
        });

        const jsonText = response.text.trim();
        if (jsonText.startsWith('{') && jsonText.endsWith('}')) {
             return JSON.parse(jsonText) as AssetDebtGeminiResponse;
        }
        
        console.warn("Received non-JSON response from Gemini, falling back.", jsonText);
        return {
             responseText: jsonText || "Cảm ơn bạn!",
        }
        
    } catch (error) {
        console.error("Error calling Gemini API for assets/debts:", error);
        return {
            responseText: "Xin lỗi, tôi đang gặp sự cố. Bạn có thể lặp lại thông tin hoặc kiểm tra API Key của mình.",
        };
    }
};
