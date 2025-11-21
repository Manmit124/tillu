import React from 'react';
import { Chat } from './Chat';

export const App: React.FC = () => {
  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <span className="text-2xl">🤖</span>
            </div>
            <div>
              <h1 className="text-xl font-bold">Tillu</h1>
              <p className="text-xs text-blue-100">Your Personal AI Assistant</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-xs">Online</span>
          </div>
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-hidden">
        <Chat />
      </div>

      {/* Footer */}
      <div className="bg-gray-100 px-4 py-2 text-center">
        <p className="text-xs text-gray-500">
          100% Private • All data stays on your machine
        </p>
      </div>
    </div>
  );
};

