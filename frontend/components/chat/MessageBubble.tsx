'use client';

import { useState, useRef, useEffect } from 'react';

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

interface MessageBubbleProps {
  message: Message;
  character: Character;
}

export function MessageBubble({ message, character }: MessageBubbleProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const handlePlayAudio = async () => {
    if (!message.audioUrl) return;

    try {
      if (audioRef.current) {
        if (isPlaying) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
          setIsPlaying(false);
        } else {
          await audioRef.current.play();
          setIsPlaying(true);
        }
      }
    } catch (error) {
      console.error('Failed to play audio:', error);
      setAudioError(true);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  const handleAudioError = () => {
    setIsPlaying(false);
    setAudioError(true);
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('ja-JP', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getEmotionEmoji = (emotion?: string) => {
    if (!emotion) return null;
    
    const emojis: Record<string, string> = {
      happy: '😊',
      sad: '😢',
      excited: '🤩',
      shy: '😳',
      angry: '😠',
      surprised: '😲',
      love: '😍',
      thinking: '🤔',
    };
    
    return emojis[emotion] || null;
  };

  const getExpressionEmoji = (expression?: string) => {
    if (!expression) return null;
    
    const emojis: Record<string, string> = {
      smile: '😊',
      laugh: '😂',
      wink: '😉',
      blush: '😊',
      pout: '😤',
      surprise: '😲',
    };
    
    return emojis[expression] || null;
  };

  const isUser = message.sender === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex items-end space-x-2 max-w-xs lg:max-w-md ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
        {/* Avatar */}
        {!isUser && (
          <div className="flex-shrink-0">
            {character.imageUrl ? (
              <img
                src={character.imageUrl}
                alt={character.name}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 bg-gradient-to-br from-pink-200 to-purple-200 rounded-full flex items-center justify-center">
                <span className="text-sm">👤</span>
              </div>
            )}
          </div>
        )}

        {/* Message Content */}
        <div className={`rounded-lg px-4 py-2 ${isUser ? 'bg-pink-500 text-white' : 'bg-gray-100 text-gray-900'}`}>
          {/* Emotion/Expression Indicators */}
          {!isUser && (message.emotion || message.expression) && (
            <div className="flex items-center space-x-1 mb-1">
              {getEmotionEmoji(message.emotion) && (
                <span className="text-sm">{getEmotionEmoji(message.emotion)}</span>
              )}
              {getExpressionEmoji(message.expression) && (
                <span className="text-sm">{getExpressionEmoji(message.expression)}</span>
              )}
            </div>
          )}

          {/* Text Content */}
          <div className="text-sm leading-relaxed">
            {message.content}
          </div>

          {/* Audio Player */}
          {message.type === 'voice' && message.audioUrl && !audioError && (
            <div className="mt-2 flex items-center space-x-2">
              <button
                onClick={handlePlayAudio}
                className={`flex items-center space-x-1 px-2 py-1 rounded text-xs ${
                  isUser 
                    ? 'bg-pink-600 hover:bg-pink-700 text-white' 
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
              >
                <span>{isPlaying ? '⏸️' : '▶️'}</span>
                <span>{isPlaying ? '停止' : '再生'}</span>
              </button>
              <audio
                ref={audioRef}
                src={message.audioUrl}
                onEnded={handleAudioEnded}
                onError={handleAudioError}
                preload="none"
              />
            </div>
          )}

          {/* Audio Error */}
          {message.type === 'voice' && audioError && (
            <div className="mt-2 text-xs text-gray-500">
              ⚠️ 音声の再生に失敗しました
            </div>
          )}

          {/* Timestamp */}
          <div className={`text-xs mt-1 ${isUser ? 'text-pink-200' : 'text-gray-500'}`}>
            {formatTime(message.timestamp)}
          </div>
        </div>

        {/* User Avatar */}
        {isUser && (
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-200 to-blue-300 rounded-full flex items-center justify-center">
              <span className="text-sm">👤</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
