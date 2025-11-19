import { Type } from "@google/genai";
import { AmountType, GoalType } from '../../../../types.ts';

// A single, unified schema for the onboarding AI agent.
// The AI will always return a JSON object with this structure.
export const onboardingAgentSchema = {
    type: Type.OBJECT,
    properties: {
        responseText: { 
            type: Type.STRING, 
            description: "Nội dung văn bản để hiển thị cho người dùng trong giao diện chat." 
        },
        updatedIncomes: {
            type: Type.ARRAY,
            description: "Toàn bộ danh sách các nguồn thu nhập của người dùng. Nếu có thay đổi, trả về toàn bộ danh sách đã cập nhật. Nếu không, có thể bỏ qua.",
            nullable: true,
            items: {
                type: Type.OBJECT,
                properties: {
                    source: { type: Type.STRING },
                    amountType: { type: Type.STRING, enum: Object.values(AmountType) },
                    amount: { type: Type.NUMBER, nullable: true },
                    minAmount: { type: Type.NUMBER, nullable: true },
                    maxAmount: { type: Type.NUMBER, nullable: true },
                },
                required: ["source", "amountType"]
            }
        },
        updatedGoal: {
            type: Type.OBJECT,
            description: "Mục tiêu tài chính của người dùng. Nếu có thay đổi, trả về toàn bộ đối tượng mục tiêu đã cập nhật. Nếu không, có thể bỏ qua.",
            nullable: true,
            properties: {
                type: { type: Type.STRING, enum: Object.values(GoalType) },
                targetAmount: { type: Type.NUMBER },
                currentAmount: { type: Type.NUMBER, nullable: true },
                description: { type: Type.STRING },
            },
            required: ["type", "targetAmount", "description"]
        },
        choices: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING }, 
            description: "Các lựa chọn gợi ý cho người dùng (tùy chọn).",
            nullable: true
        },
    },
    required: ["responseText"]
};