
import { GoogleGenAI } from "@google/genai";
import { GeminiResponse, IncomeSource, FinancialGoal, Message, Sender } from '../../../../types.ts';
import { SYSTEM_INSTRUCTION } from '../../../../constants.ts';
import { onboardingAgentSchema } from './schemas.ts';

// Helper to format history for the prompt
const formatHistory = (history: Message[]): string => {
    return history.map(msg => `${msg.sender === Sender.USER ? 'User' : 'AI'}: ${msg.text}`).join('\n');
};

export const getOnboardingResponse = async (
    history: Message[], 
    currentData: {incomes: IncomeSource[], goal: FinancialGoal | null},
    apiKey: string,
): Promise<GeminiResponse> => {
    const ai = new GoogleGenAI({ apiKey });

    try {
        const model = "gemini-2.5-flash";

        // Construct a single, context-rich prompt
        const prompt = `
---
**Lịch sử hội thoại:**
${history.length > 0 ? formatHistory(history) : 'Chưa có lịch sử.'}
---
**Dữ liệu tài chính hiện tại của người dùng (dạng JSON):**
${JSON.stringify(currentData, null, 2)}
---
Dựa vào lịch sử và dữ liệu trên, hãy tiếp tục cuộc trò chuyện và trả về đối tượng JSON theo schema.
`;

        const response = await ai.models.generateContent({
            model: model,
            contents: [{ parts: [{ text: prompt }] }],
            config: {
                systemInstruction: SYSTEM_INSTRUCTION,
                responseMimeType: "application/json",
                responseSchema: onboardingAgentSchema,
                temperature: 0.7,
            },
        });

        const jsonText = response.text.trim();
        // A simple check to see if the response is valid JSON
        if (jsonText.startsWith('{') && jsonText.endsWith('}')) {
             return JSON.parse(jsonText) as GeminiResponse;
        }
        // Fallback for non-JSON or malformed responses
        console.warn("Received non-JSON response from Gemini, falling back.", jsonText);
        return {
             responseText: jsonText || "Cảm ơn bạn!",
             choices: [],
        }
        
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        return {
            responseText: "Xin lỗi, tôi đang gặp một chút sự cố kỹ thuật. Vui lòng kiểm tra API Key của bạn trong phần Cài đặt hoặc thử lại sau.",
            choices: []
        };
    }
};
