

import { useState, useEffect, useCallback, Dispatch, SetStateAction } from 'react';
import { Message, Sender, TodoItem, IncomeSource, FinancialGoal, GeminiResponse } from '../../../../types.ts';
import { getOnboardingResponse } from '../services/onboardingAIAgent.ts';

interface UseOnboardingProps {
    onProfileUpdate: (data: { incomes: IncomeSource[], goal: FinancialGoal | null }) => void;
    todos: TodoItem[];
    setTodos: Dispatch<SetStateAction<TodoItem[]>>;
    apiKey: string | null;
}

const MAX_MESSAGES = 50; // Giới hạn số lượng tin nhắn trong lịch sử

const useOnboarding = ({ onProfileUpdate, todos, setTodos, apiKey }: UseOnboardingProps) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Local state to hold the financial profile during the conversation
    const [currentIncomes, setCurrentIncomes] = useState<IncomeSource[]>([]);
    const [currentGoal, setCurrentGoal] = useState<FinancialGoal | null>(null);

    const processAiResponse = useCallback(async (messageHistory: Message[]) => {
        if (!apiKey) {
            const errorMsg: Message = { id: `assistant-${Date.now()}`, sender: Sender.ASSISTANT, type: 'text', text: "Lỗi: Không tìm thấy API key. Vui lòng cung cấp một key hợp lệ trong phần Cài đặt." };
            setMessages(prev => [...prev, errorMsg]);
            return;
        }
        setIsLoading(true);

        const currentData = { incomes: currentIncomes, goal: currentGoal };
        const geminiResponse: GeminiResponse = await getOnboardingResponse(messageHistory, currentData, apiKey);

        const newAssistantMessage: Message = {
            id: `assistant-${Date.now()}`,
            text: geminiResponse.responseText,
            sender: Sender.ASSISTANT,
            type: 'text',
            choices: geminiResponse.choices
        };
        
        // Update message history
        setMessages(prev => [...prev, newAssistantMessage].slice(-MAX_MESSAGES));

        let hasProfileChanged = false;
        let updatedIncomes = currentIncomes;
        let updatedGoal = currentGoal;

        // Update financial data based on AI's structured response
        if (geminiResponse.updatedIncomes) {
            setCurrentIncomes(geminiResponse.updatedIncomes);
            updatedIncomes = geminiResponse.updatedIncomes;
            hasProfileChanged = true;
            if (geminiResponse.updatedIncomes.length > 0 && !todos.find(t => t.id === 1)?.completed) {
                setTodos(prev => prev.map(t => t.id === 1 ? { ...t, completed: true } : t));
            }
        }
        if (geminiResponse.updatedGoal) {
            setCurrentGoal(geminiResponse.updatedGoal);
            updatedGoal = geminiResponse.updatedGoal;
            hasProfileChanged = true;
             if (!todos.find(t => t.id === 2)?.completed) {
                setTodos(prev => prev.map(t => t.id === 2 ? { ...t, completed: true } : t));
            }
        }
        
        // If any part of the profile was updated, notify the parent component
        if(hasProfileChanged) {
            onProfileUpdate({ incomes: updatedIncomes, goal: updatedGoal });
            if(updatedIncomes.length > 0 && updatedGoal && !todos.find(t => t.id === 3)?.completed) {
                 setTodos(prev => prev.map(t => t.id === 3 ? { ...t, completed: true } : t));
            }
        }

        setIsLoading(false);
    }, [currentIncomes, currentGoal, onProfileUpdate, setTodos, todos, apiKey]);

    useEffect(() => {
        // Set a generic welcome message when the component mounts and there are no messages.
        // The AI interaction will be triggered by the user's first message.
        if (messages.length === 0) {
            const initialMessage: Message = {
                id: `assistant-${Date.now()}`,
                sender: Sender.ASSISTANT,
                type: 'text',
                text: "Chào mừng! Hãy bắt đầu bằng cách nói 'Xin chào' hoặc cho tôi biết về thu nhập của bạn để tôi có thể giúp bạn thiết lập hồ sơ tài chính.",
                choices: ["Xin chào", "Lương của tôi là 25 triệu", "Tôi muốn đặt mục tiêu tiết kiệm"]
            };
            setMessages([initialMessage]);
        }
    }, [messages.length]);

    const handleSendMessage = (text: string) => {
        const newUserMessage: Message = {
            id: `user-${Date.now()}`,
            text,
            sender: Sender.USER,
            type: 'text',
        };
        const updatedMessages = [...messages, newUserMessage];
        setMessages(updatedMessages.slice(-MAX_MESSAGES));
        processAiResponse(updatedMessages);
    };

    return {
        messages,
        isLoading,
        handleSendMessage,
    };
};

export default useOnboarding;