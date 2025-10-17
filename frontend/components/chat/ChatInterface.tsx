'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';

interface Character {
  id: string;
  name: string;
  age: number;
  occupation: string;
  bio: string;
  imageUrl?: string;
  stageProgress: {
    currentStage: string;
    affectionLevel: number;
  };
}

interface Message {
  id: string;
  content: string;
  type: 'text' | 'voice';
  sender: 'user' | 'character';
  timestamp: string;
  audioUrl?: string;
  emotion?: string;
  expression?: string;
}

interface ChatInterfaceProps {
  character: Character;
  messages: Message[];
  onSendMessage: (content: string, type: 'text' | 'voice') => void;
}

export function ChatInterface({ character, messages, onSendMessage }: ChatInterfaceProps) {
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (content: string, type: 'text' | 'voice' = 'text') => {
    if (!content.trim()) return;

    setIsTyping(true);
    await onSendMessage(content, type);
    setIsTyping(false);
  };

  const getStageLabel = (stage: string) => {
    const stageLabels: Record<string, string> = {
      first_meet: '出会い',
      dating: 'デート期間',
      relationship: '交際中',
      proposal: 'プロポーズ',
      marriage: '結婚生活',
    };
    return stageLabels[stage] || stage;
  };

  const getAffectionColor = (level: number) => {
    if (level >= 80) return 'text-red-500';
    if (level >= 50) return 'text-pink-500';
    if (level >= 20) return 'text-blue-500';
    return 'text-gray-500';
  };

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] bg-white rounded-lg shadow-sm border">
      {/* Character Info Header */}
      <div className="p-4 border-b bg-gradient-to-r from-pink-50 to-purple-50">
        <div className="flex items-center space-x-3">
          {character.imageUrl ? (
            <img
              src={character.imageUrl}
              alt={character.name}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 bg-gradient-to-br from-pink-200 to-purple-200 rounded-full flex items-center justify-center">
              <span className="text-xl">👤</span>
            </div>
          )}
          <div>
            <h3 className="font-semibold text-gray-900">{character.name}</h3>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span>{getStageLabel(character.stageProgress.currentStage)}</span>
              <span>•</span>
              <span className={getAffectionColor(character.stageProgress.affectionLevel)}>
                好感度 {character.stageProgress.affectionLevel}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">💬</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {character.name}との会話を始めましょう
            </h3>
            <p className="text-gray-600 mb-4">
              {character.bio}
            </p>
            <div className="bg-pink-50 border border-pink-200 rounded-lg p-4 max-w-md mx-auto">
              <p className="text-sm text-pink-800">
                💡 ヒント: 「こんにちは」や「初めまして」から始めてみてください
              </p>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              character={character}
            />
          ))
        )}

        {isTyping && (
          <div className="flex items-center space-x-2 text-gray-500">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <span className="text-sm">{character.name}が入力中...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t bg-gray-50">
        <MessageInput onSendMessage={handleSendMessage} />
      </div>
    </div>
  );
}
