
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
            const errorMsg: Message = { id: `assistant-${Date.now()}`, sender: Sender.ASSISTANT, type: 'text', text: "Lỗi: Không tìm thấy API key. Vui lòng cấu hình trong Cài đặt." };
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
        // Initial greeting from AI when the component mounts and there are no messages
        if (messages.length === 0) {
            setIsLoading(true); // Show loading indicator while waiting for key
            if (apiKey) {
                 processAiResponse([]);
            } else if (apiKey === null) { // Explicitly check for null (key has been determined to be absent)
                const errorMsg: Message = { id: `assistant-${Date.now()}`, sender: Sender.ASSISTANT, type: 'text', text: "Chào mừng! Vui lòng cung cấp API Key trong phần Cài đặt để bắt đầu." };
                setMessages([errorMsg]);
                setIsLoading(false);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [apiKey]); // Rerun effect when API key becomes available

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
