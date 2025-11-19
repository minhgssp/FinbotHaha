
import { useState, useCallback, useEffect } from 'react';
import { Message, Sender, Asset, Liability, PendingAssetAction, AssetDebtGeminiResponse, AssetActionType, AssetType, LiabilityType } from '../../../../types.ts';
import { getAssetDebtResponse } from '../services/assetDebtAIAgent.ts';
import { WITTY_CONFIRMATIONS } from '../../../../constants.ts';

interface UseAssetChatProps {
    assets: Asset[];
    liabilities: Liability[];
    onAddAsset: (asset: Omit<Asset, 'id'>) => void;
    onAddLiability: (liability: Omit<Liability, 'id'>) => void;
    onBuyAsset: (name: string, type: AssetType, totalValue: number, quantity: number, unit: string) => void;
    onSellAsset: (name: string, totalValue: number, quantity: number) => void;
    onRepayLiability: (name: string, amount: number) => void;
    apiKey: string | null;
}

const MAX_MESSAGES = 50;

export const useAssetChat = (props: UseAssetChatProps) => {
    const { 
        assets, liabilities, onAddAsset, onAddLiability, onBuyAsset, 
        onSellAsset, onRepayLiability, apiKey
    } = props;
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [pendingItem, setPendingItem] = useState<PendingAssetAction | null>(null);

     useEffect(() => {
        if(messages.length === 0) {
            const initialText = apiKey 
                ? "Chào bạn! Hãy cho tôi biết về tài sản hoặc khoản nợ bạn muốn ghi lại."
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
        const response: AssetDebtGeminiResponse = await getAssetDebtResponse(messageHistory, assets, liabilities, apiKey);
        
        let newAssistantMessage: Message;

        if (response.extractedData) {
            setPendingItem(response.extractedData);
            newAssistantMessage = {
                id: `assistant-${Date.now()}`,
                sender: Sender.ASSISTANT,
                type: 'asset_liability_confirmation',
                text: response.responseText,
                pendingAssetOrLiability: response.extractedData,
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
    }, [addNewMessage, assets, liabilities, apiKey]);

    const handleSendMessage = (text: string) => {
        if (pendingItem) {
            // If user types something new, cancel the pending action
             handleCancel();
        }
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

    const handleConfirm = () => {
        if (!pendingItem) return;

        switch (pendingItem.action) {
            case AssetActionType.BUY:
                if (pendingItem.itemType === 'asset' && pendingItem.quantity && pendingItem.unit) {
                    const finalAssetType = (pendingItem.type && Object.values(AssetType).includes(pendingItem.type as AssetType))
                        ? pendingItem.type as AssetType
                        : AssetType.INVESTMENT;
                    onBuyAsset(pendingItem.name, finalAssetType, pendingItem.amount, pendingItem.quantity, pendingItem.unit);
                }
                break;
            
            case AssetActionType.SELL:
                 if (pendingItem.itemType === 'asset' && pendingItem.quantity) {
                    onSellAsset(pendingItem.name, pendingItem.amount, pendingItem.quantity);
                }
                break;

            case AssetActionType.BORROW:
                if (pendingItem.itemType === 'liability') {
                    onAddLiability({
                        name: pendingItem.name,
                        type: pendingItem.type as LiabilityType,
                        initialAmount: pendingItem.amount,
                        lender: pendingItem.lender,
                        paymentHistory: [],
                    });
                }
                break;

            case AssetActionType.REPAY:
                if (pendingItem.itemType === 'liability') {
                    onRepayLiability(pendingItem.name, pendingItem.amount);
                }
                break;
            
            case AssetActionType.UPDATE:
                 console.log("UPDATE action is deprecated.");
                break;
        }

        setPendingItem(null);
        
        const wittyResponse = WITTY_CONFIRMATIONS[Math.floor(Math.random() * WITTY_CONFIRMATIONS.length)];
        const confirmationMessage: Message = {
            id: `assistant-${Date.now()}`,
            sender: Sender.ASSISTANT,
            type: 'text',
            text: wittyResponse,
        };
        // Remove previous confirmation card
        setMessages(prev => prev.filter(m => m.type !== 'asset_liability_confirmation'));
        addNewMessage(confirmationMessage);
    };
    
    const handleCancel = () => {
        setPendingItem(null);
         const cancellationMessage: Message = {
            id: `assistant-${Date.now()}`,
            sender: Sender.ASSISTANT,
            type: 'text',
            text: 'Đã hủy. Vui lòng cung cấp lại thông tin nhé.',
        };
        // Remove previous confirmation card
        setMessages(prev => prev.filter(m => m.type !== 'asset_liability_confirmation'));
        addNewMessage(cancellationMessage);
    };

    return {
        messages,
        isLoading,
        pendingItem,
        handleSendMessage,
        handleConfirm,
        handleCancel,
    };
};
