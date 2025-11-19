
import { useState, useCallback, useEffect } from 'react';
import { Message, Sender, Transaction, PendingTransaction, TransactionGeminiResponse, RecurringTransaction } from '../../../../types.ts';
import { getTransactionResponse } from '../services/transactionAIAgent.ts';

interface UseTransactionChatProps {
    onAddTransaction: (transaction: Transaction) => void;
    onAddRecurringTransaction: (item: RecurringTransaction) => void;
    onDeleteTransaction: (id: string) => void;
    onDeleteRecurringTransaction: (id: string) => void;
    apiKey: string | null;
}

const MAX_MESSAGES = 50;

export const useTransactionChat = ({ onAddTransaction, onAddRecurringTransaction, onDeleteTransaction, onDeleteRecurringTransaction, apiKey }: UseTransactionChatProps) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    
    useEffect(() => {
        if(messages.length === 0) {
            const initialText = apiKey 
                ? "Chào bạn! Vui lòng cho tôi biết giao dịch bạn muốn ghi lại."
                : "Vui lòng cung cấp API Key trong phần Cài đặt để sử dụng tính năng này.";
            setMessages([{ id: `assistant-${Date.now()}`, sender: Sender.ASSISTANT, type: 'text', text: initialText }]);
        }
    }, [apiKey, messages.length]);


    const addNewMessage = useCallback((newMessage: Message) => {
        setMessages(prev => [...prev, newMessage].slice(-MAX_MESSAGES));
    }, []);

    const processAiResponse = useCallback(async (messageHistory: Message[]) => {
        if (!apiKey) {
            addNewMessage({ id: `assistant-${Date.now()}`, sender: Sender.ASSISTANT, type: 'text', text: "Lỗi: Không tìm thấy API key. Vui lòng cấu hình trong Cài đặt." });
            return;
        }

        setIsLoading(true);
        const response: TransactionGeminiResponse = await getTransactionResponse(messageHistory, apiKey);
        
        let newAssistantMessage: Message;

        if (response.extractedTransaction) {
            const isRecurring = response.extractedTransaction.frequency === 'monthly';
            const newTransactionId = `${isRecurring ? 'recur' : 'txn'}-${Date.now()}`;
            const transactionDate = response.extractedTransaction.date 
                ? new Date(response.extractedTransaction.date + 'T00:00:00').toISOString()
                : new Date().toISOString();

            if (isRecurring) {
                const { frequency, ...recurringData } = response.extractedTransaction;
                const startDate = new Date().toISOString().split('T')[0];
                onAddRecurringTransaction({
                    ...recurringData,
                    id: newTransactionId,
                    frequency: 'monthly',
                    startDate: startDate,
                    nextDueDate: startDate,
                });
            } else {
                onAddTransaction({
                    ...response.extractedTransaction,
                    id: newTransactionId,
                    date: transactionDate,
                });
            }

            newAssistantMessage = {
                id: `assistant-${Date.now()}`,
                sender: Sender.ASSISTANT,
                type: 'transaction_confirmation',
                text: response.responseText,
                pendingTransaction: response.extractedTransaction,
                relatedTransactionId: newTransactionId,
            };
        } else {
            newAssistantMessage = {
                id: `assistant-${Date.now()}`,
                sender: Sender.ASSISTANT,
                type: 'text',
                text: response.responseText,
            };
        }
        
        addNewMessage(newAssistantMessage);
        setIsLoading(false);
    }, [addNewMessage, onAddTransaction, onAddRecurringTransaction, apiKey]);

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

    const handleUndoTransaction = useCallback((messageId: string) => {
        const messageToUndo = messages.find(m => m.id === messageId);
        if (!messageToUndo || !messageToUndo.relatedTransactionId || !messageToUndo.pendingTransaction) {
            return;
        }

        const { relatedTransactionId, pendingTransaction } = messageToUndo;

        if (pendingTransaction.frequency === 'monthly') {
            onDeleteRecurringTransaction(relatedTransactionId);
        } else {
            onDeleteTransaction(relatedTransactionId);
        }

        // Remove the confirmation message from the chat
        setMessages(prev => prev.filter(m => m.id !== messageId));

        const undoSuccessMessage: Message = {
            id: `assistant-${Date.now()}`,
            sender: Sender.ASSISTANT,
            type: 'text',
            text: 'Đã hoàn tác giao dịch.',
        };
        addNewMessage(undoSuccessMessage);
    }, [messages, onDeleteTransaction, onDeleteRecurringTransaction, addNewMessage]);
    
    return {
        messages,
        isLoading,
        handleSendMessage,
        handleUndoTransaction
    };
};
