
import React, { useRef, useEffect, useState } from 'react';
import { Message, Sender } from '../../../../types.ts';
import { SendIcon, SparklesIcon, BanknotesIcon, ArrowUpOnSquareIcon } from '../../../components/IconComponents.tsx';
import { ActiveAgent } from '../../../../App.tsx';
import TransactionConfirmationCard from './TransactionConfirmationCard.tsx';
import { AssetLiabilityConfirmationCard } from './AssetLiabilityConfirmationCard.tsx';

interface ChatWindowProps {
  messages: Message[];
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  activeAgent: ActiveAgent;
  onSwitchAgent: (agent: ActiveAgent) => void;
  onConfirm: () => void;
  onCancel: () => void;
  onUndoTransaction: (messageId: string) => void;
}

const ChatMessage: React.FC<{ message: Message }> = ({ message }) => {
  const isUser = message.sender === Sender.USER;
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-3 rounded-2xl ${
          isUser
            ? 'bg-green-600 text-white rounded-br-none'
            : 'bg-slate-700 text-slate-200 rounded-bl-none'
        }`}
      >
        <p className="text-base">{message.text}</p>
      </div>
    </div>
  );
};

const LoadingIndicator: React.FC = () => (
    <div className="flex justify-start">
        <div className="bg-slate-700 text-slate-200 rounded-2xl rounded-bl-none px-4 py-3">
            <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
            </div>
        </div>
    </div>
);

const AGENT_CONFIG: Record<ActiveAgent, { label: string; placeholder: string; icon: React.ReactNode }> = {
    transaction: {
        label: "Thêm giao dịch",
        placeholder: "Nhập giao dịch, ví dụ: 'Cà phê 35k'",
        icon: <ArrowUpOnSquareIcon className="w-5 h-5" />
    },
    assets: {
        label: "Quản lý tài sản",
        placeholder: "VD: 'Mua 2 chỉ vàng 15tr'",
        icon: <BanknotesIcon className="w-5 h-5" />
    },
    onboarding: {
        label: "Trợ lý thiết lập",
        placeholder: 'Nhập câu trả lời của bạn...',
        icon: <SparklesIcon className="w-5 h-5" />
    },
};

const AgentButton: React.FC<{
    agent: ActiveAgent;
    isActive: boolean;
    onClick: () => void;
}> = ({ agent, isActive, onClick }) => {
    const config = AGENT_CONFIG[agent];
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-2 text-sm font-semibold py-2 px-4 rounded-full transition-colors duration-200 ${
                isActive ? 'bg-green-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
        >
            {config.icon}
            {config.label}
        </button>
    )
};


const ChatWindow: React.FC<ChatWindowProps> = ({ 
    messages, 
    onSendMessage, 
    isLoading,
    activeAgent,
    onSwitchAgent,
    onConfirm,
    onCancel,
    onUndoTransaction,
}) => {
  const [userInput, setUserInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const lastMessage = messages[messages.length - 1];
  const choices = lastMessage?.sender === Sender.ASSISTANT ? lastMessage.choices : [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userInput.trim() && !isLoading) {
      onSendMessage(userInput.trim());
      setUserInput('');
    }
  };
  
  const handleChoiceClick = (choice: string) => {
    if (!isLoading) {
        onSendMessage(choice);
    }
  }

  const placeholderText = AGENT_CONFIG[activeAgent].placeholder;

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 p-6 space-y-6 overflow-y-auto custom-scrollbar">
        {messages.map((msg) => {
            if (msg.type === 'transaction_confirmation' && msg.pendingTransaction) {
                 return <TransactionConfirmationCard 
                            key={msg.id}
                            message={msg.text || ''}
                            transaction={msg.pendingTransaction}
                            onUndo={() => onUndoTransaction(msg.id)}
                       />;
            }
            if (msg.type === 'asset_liability_confirmation' && msg.pendingAssetOrLiability) {
                 return <AssetLiabilityConfirmationCard
                            key={msg.id}
                            message={msg.text || ''}
                            item={msg.pendingAssetOrLiability}
                            onConfirm={onConfirm}
                            onCancel={onCancel}
                        />;
            }
            return <ChatMessage key={msg.id} message={msg} />;
        })}
        {isLoading && <LoadingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      <div className="shrink-0 bg-slate-800/80 backdrop-blur-sm border-t border-slate-700">
        <div className="px-4 pt-4 pb-2 flex flex-wrap gap-2 justify-start">
            <AgentButton agent="transaction" isActive={activeAgent === 'transaction'} onClick={() => onSwitchAgent('transaction')} />
            <AgentButton agent="assets" isActive={activeAgent === 'assets'} onClick={() => onSwitchAgent('assets')} />
            <AgentButton agent="onboarding" isActive={activeAgent === 'onboarding'} onClick={() => onSwitchAgent('onboarding')} />
        </div>
        
        {choices && choices.length > 0 && !isLoading && (
          <div className="px-4 pt-2 pb-2">
              <div className="flex flex-wrap gap-2 justify-start">
                  {choices.map((choice, index) => (
                      <button 
                          key={index} 
                          onClick={() => handleChoiceClick(choice)}
                          className="bg-slate-600 hover:bg-slate-500 text-white text-sm font-semibold py-2 px-4 rounded-full transition-colors duration-200"
                      >
                          {choice}
                      </button>
                  ))}
              </div>
          </div>
        )}

        <div className="p-4">
          <form onSubmit={handleSubmit} className="flex items-center space-x-3">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder={placeholderText}
              className="flex-1 bg-slate-700 text-slate-200 rounded-full py-3 px-5 focus:outline-none focus:ring-2 focus:ring-green-500"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !userInput.trim()}
              className="bg-green-600 text-white rounded-full p-3 hover:bg-green-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors duration-200"
            >
              <SendIcon className="w-6 h-6" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;