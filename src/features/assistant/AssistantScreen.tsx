

import React from 'react';
import ChatWindow from './components/ChatWindow.tsx';
import { Message } from '../../../types.ts';
import { ActiveAgent } from '../../../App.tsx';

interface AssistantScreenProps {
  messages: Message[];
  isLoading: boolean;
  handleSendMessage: (text: string) => void;
  activeAgent: ActiveAgent;
  onSwitchAgent: (agent: ActiveAgent) => void;
  handleConfirm: () => void;
  handleCancel: () => void;
  handleUndoTransaction: (messageId: string) => void;
}

const AssistantScreen: React.FC<AssistantScreenProps> = (props) => {
  return (
    <div className="h-full">
      <ChatWindow 
        messages={props.messages}
        onSendMessage={props.handleSendMessage}
        isLoading={props.isLoading}
        activeAgent={props.activeAgent}
        onSwitchAgent={props.onSwitchAgent}
        onConfirm={props.handleConfirm}
        onCancel={props.handleCancel}
        onUndoTransaction={props.handleUndoTransaction}
      />
    </div>
  );
};

export default AssistantScreen;