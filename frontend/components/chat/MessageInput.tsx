'use client';

import { useState, useRef } from 'react';

interface MessageInputProps {
  onSendMessage: (content: string, type: 'text' | 'voice') => void;
}

export function MessageInput({ onSendMessage }: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    onSendMessage(message.trim(), 'text');
    setMessage('');
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
  };

  const handleVoiceToggle = () => {
    setIsVoiceMode(!isVoiceMode);
    if (!isVoiceMode) {
      // Switch to voice mode
      setMessage('');
    }
  };

  const handleVoiceRecord = () => {
    if (!isRecording) {
      // Start recording
      setIsRecording(true);
      // TODO: Implement actual voice recording
      // For now, simulate recording
      setTimeout(() => {
        setIsRecording(false);
        // Simulate sending voice message
        onSendMessage('音声メッセージ', 'voice');
      }, 2000);
    } else {
      // Stop recording
      setIsRecording(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* Input Mode Toggle */}
      <div className="flex justify-center">
        <div className="bg-gray-200 rounded-lg p-1 flex">
          <button
            type="button"
            onClick={() => setIsVoiceMode(false)}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              !isVoiceMode 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            📝 テキスト
          </button>
          <button
            type="button"
            onClick={() => setIsVoiceMode(true)}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              isVoiceMode 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            🎤 音声
          </button>
        </div>
      </div>

      {/* Text Input Mode */}
      {!isVoiceMode && (
        <div className="flex items-end space-x-2">
          <div className="flex-1">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={handleTextareaChange}
              onKeyPress={handleKeyPress}
              placeholder="メッセージを入力..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-pink-500 focus:border-pink-500 resize-none"
              rows={1}
              style={{ minHeight: '40px', maxHeight: '120px' }}
            />
          </div>
          <button
            type="submit"
            disabled={!message.trim()}
            className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            送信
          </button>
        </div>
      )}

      {/* Voice Input Mode */}
      {isVoiceMode && (
        <div className="text-center space-y-3">
          <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
            <p className="text-sm text-pink-800 mb-3">
              {isRecording ? '録音中...' : '音声メッセージを録音'}
            </p>
            <button
              type="button"
              onClick={handleVoiceRecord}
              className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl transition-all ${
                isRecording
                  ? 'bg-red-500 text-white animate-pulse'
                  : 'bg-pink-500 text-white hover:bg-pink-600'
              }`}
            >
              {isRecording ? '⏹️' : '🎤'}
            </button>
            <p className="text-xs text-pink-600 mt-2">
              {isRecording ? 'タップして停止' : 'タップして録音開始'}
            </p>
          </div>
          
          <button
            type="button"
            onClick={() => setIsVoiceMode(false)}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            ← テキスト入力に戻る
          </button>
        </div>
      )}

      {/* Quick Actions */}
      <div className="flex justify-center space-x-2">
        <button
          type="button"
          onClick={() => onSendMessage('こんにちは！', 'text')}
          className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
        >
          こんにちは
        </button>
        <button
          type="button"
          onClick={() => onSendMessage('元気？', 'text')}
          className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
        >
          元気？
        </button>
        <button
          type="button"
          onClick={() => onSendMessage('ありがとう', 'text')}
          className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
        >
          ありがとう
        </button>
      </div>
    </form>
  );
}
