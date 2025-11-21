import React from 'react';
import type { Message as MessageType } from '../shared/types';

interface MessageProps {
  message: MessageType;
}

export const Message: React.FC<MessageProps> = ({ message }) => {
  const isUser = message.sender === 'user';
  const isSystem = message.sender === 'system';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-[80%] rounded-lg px-4 py-2 ${
          isUser
            ? 'bg-blue-500 text-white'
            : isSystem
            ? 'bg-red-100 text-red-800 border border-red-300'
            : 'bg-gray-200 text-gray-800'
        }`}
      >
        <div className="text-sm whitespace-pre-wrap break-words">{message.text}</div>
        <div
          className={`text-xs mt-1 ${
            isUser ? 'text-blue-100' : isSystem ? 'text-red-600' : 'text-gray-500'
          }`}
        >
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </div>
      </div>
    </div>
  );
};

