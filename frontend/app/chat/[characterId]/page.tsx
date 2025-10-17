'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';

interface Message {
  id: string;
  sender: 'user' | 'character';
  content: string;
  emotion?: string;
  expression?: string;
  voiceUrl?: string;
  createdAt: string;
}

interface Character {
  id: string;
  name: string;
  age: number;
  occupation: string;
  bio: string;
  personalityArchetype: string;
  primaryImageUrl?: string;
  expressionUrls?: any;
  affectionLevel?: number;
  affectionStage?: string;
}

interface Conversation {
  id: string;
  characterId: string;
  stage: string;
}

export default function ChatPage({ params }: { params: Promise<{ characterId: string }> }) {
  const router = useRouter();
  const [character, setCharacter] = useState<Character | null>(null);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [currentExpression, setCurrentExpression] = useState('neutral');
  const [isTyping, setIsTyping] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showExportModal, setShowExportModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const loadWithParams = async () => {
      const resolvedParams = await params;
      loadCharacterAndConversation(resolvedParams.characterId);
    };
    loadWithParams();
  }, [params]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadCharacterAndConversation = async (characterId: string) => {
    setIsLoading(true);
    try {
      // Load character
      const charResponse = await apiClient.getCharacter(characterId);
      setCharacter(charResponse.character);

      // Get or create conversation
      const conversationsResponse = await apiClient.getConversations();
      let conv = conversationsResponse.conversations.find(
        (c: any) => c.characterId === characterId
      );

      if (!conv) {
        const newConvResponse = await apiClient.createConversation(characterId);
        conv = newConvResponse.conversation;
      }

      setConversation(conv);

      // Load messages
      const messagesResponse = await apiClient.getMessages(conv.id);
      setMessages(messagesResponse.messages);
    } catch (error) {
      console.error('Failed to load chat:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !conversation || isSending) return;

    const messageContent = inputMessage;
    setInputMessage('');
    setIsSending(true);
    setIsTyping(true);

    try {
      const response = await apiClient.sendMessage(conversation.id, messageContent);

      // Add user message
      setMessages((prev) => [...prev, response.userMessage]);

      // Simulate typing delay
      await new Promise(resolve => setTimeout(resolve, 800));
      setIsTyping(false);

      // Add character message
      setMessages((prev) => [...prev, response.characterMessage]);

      // Update expression
      if (response.characterMessage.expression) {
        setCurrentExpression(response.characterMessage.expression);
      }

      // Update affection level if changed
      if (response.affectionChange && character) {
        setCharacter({
          ...character,
          affectionLevel: (character.affectionLevel || 0) + response.affectionChange
        });
      }

      // Play voice if available
      if (response.characterMessage.voiceUrl && audioRef.current) {
        audioRef.current.src = response.characterMessage.voiceUrl;
        audioRef.current.play();
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      setIsTyping(false);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getCharacterImage = () => {
    if (!character) return null;

    // Try to get expression image first
    if (character.expressionUrls && character.expressionUrls[currentExpression]) {
      return character.expressionUrls[currentExpression];
    }

    // Fall back to primary image
    return character.primaryImageUrl;
  };

  const getAffectionStage = (level: number) => {
    if (level < 20) return { name: '初対面', color: 'text-gray-600', bgColor: 'bg-gray-200' };
    if (level < 40) return { name: '友達', color: 'text-blue-600', bgColor: 'bg-blue-200' };
    if (level < 60) return { name: '親友', color: 'text-green-600', bgColor: 'bg-green-200' };
    if (level < 80) return { name: '恋人候補', color: 'text-pink-600', bgColor: 'bg-pink-200' };
    if (level < 100) return { name: '恋人', color: 'text-red-600', bgColor: 'bg-red-200' };
    return { name: '運命の相手', color: 'text-purple-600', bgColor: 'bg-purple-200' };
  };

  const getPersonalityLabel = (archetype: string) => {
    const labels: Record<string, string> = {
      gentle: '優しい',
      cheerful: '明るい',
      cool: 'クール',
      shy: '恥ずかしがり屋',
      energetic: '元気',
      mysterious: 'ミステリアス',
    };
    return labels[archetype] || archetype;
  };

  const exportConversation = (format: 'json' | 'txt' | 'md') => {
    if (!character || messages.length === 0) return;

    let content = '';
    let filename = '';
    let mimeType = '';

    const timestamp = new Date().toISOString().split('T')[0];

    if (format === 'json') {
      // JSON Export
      const exportData = {
        character: {
          name: character.name,
          age: character.age,
          occupation: character.occupation,
        },
        conversation: {
          stage: conversation?.stage,
          affectionLevel: character.affectionLevel,
        },
        messages: messages.map(msg => ({
          sender: msg.sender,
          content: msg.content,
          emotion: msg.emotion,
          createdAt: msg.createdAt,
        })),
        exportedAt: new Date().toISOString(),
      };
      content = JSON.stringify(exportData, null, 2);
      filename = `${character.name}_chat_${timestamp}.json`;
      mimeType = 'application/json';
    } else if (format === 'txt') {
      // Plain Text Export
      content = `会話履歴 - ${character.name}\n`;
      content += `日付: ${new Date().toLocaleDateString('ja-JP')}\n`;
      content += `好感度: ${character.affectionLevel || 0}/100\n`;
      content += `関係性: ${conversation?.stage}\n`;
      content += `\n${'='.repeat(50)}\n\n`;

      messages.forEach(msg => {
        const time = new Date(msg.createdAt).toLocaleTimeString('ja-JP', {
          hour: '2-digit',
          minute: '2-digit',
        });
        const sender = msg.sender === 'user' ? 'あなた' : character.name;
        content += `[${time}] ${sender}:\n${msg.content}\n\n`;
      });

      filename = `${character.name}_chat_${timestamp}.txt`;
      mimeType = 'text/plain';
    } else if (format === 'md') {
      // Markdown Export
      content = `# 会話履歴 - ${character.name}\n\n`;
      content += `**日付**: ${new Date().toLocaleDateString('ja-JP')}\n`;
      content += `**好感度**: ${character.affectionLevel || 0}/100\n`;
      content += `**関係性**: ${conversation?.stage}\n\n`;
      content += `---\n\n`;

      messages.forEach(msg => {
        const time = new Date(msg.createdAt).toLocaleTimeString('ja-JP', {
          hour: '2-digit',
          minute: '2-digit',
        });
        const sender = msg.sender === 'user' ? '**あなた**' : `**${character.name}**`;
        const emotion = msg.emotion ? ` _${msg.emotion}_` : '';
        content += `### ${sender}${emotion} - ${time}\n\n`;
        content += `${msg.content}\n\n`;
      });

      filename = `${character.name}_chat_${timestamp}.md`;
      mimeType = 'text/markdown';
    }

    // Create and trigger download
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setShowExportModal(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (!character || !conversation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50">
        <div className="text-center">
          <p className="text-gray-600 mb-4">キャラクターが見つかりません</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700"
          >
            ダッシュボードに戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      {/* Hidden audio element for voice playback */}
      <audio ref={audioRef} className="hidden" />

      <div className="max-w-7xl mx-auto h-screen flex">
        {/* Sidebar - Character Info */}
        {showSidebar && (
          <aside className="w-80 bg-white border-r flex flex-col">
            {/* Character Profile */}
            <div className="p-6 border-b">
              <div className="text-center mb-4">
                {getCharacterImage() ? (
                  <img
                    src={getCharacterImage()!}
                    alt={character.name}
                    className="w-32 h-32 rounded-full object-cover mx-auto mb-4 border-4 border-pink-200"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center text-6xl mx-auto mb-4">
                    👤
                  </div>
                )}
                <h2 className="text-2xl font-bold text-gray-900">{character.name}</h2>
                <p className="text-sm text-gray-600">{character.age}歳 • {character.occupation}</p>
              </div>

              {/* Affection Level */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">好感度</span>
                  <span className={`text-sm font-bold ${getAffectionStage(character.affectionLevel || 0).color}`}>
                    {getAffectionStage(character.affectionLevel || 0).name}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all duration-500 ${
                      (character.affectionLevel || 0) < 20 ? 'bg-gray-400' :
                      (character.affectionLevel || 0) < 40 ? 'bg-blue-400' :
                      (character.affectionLevel || 0) < 60 ? 'bg-green-400' :
                      (character.affectionLevel || 0) < 80 ? 'bg-pink-400' :
                      (character.affectionLevel || 0) < 100 ? 'bg-red-400' :
                      'bg-purple-500'
                    }`}
                    style={{ width: `${character.affectionLevel || 0}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0</span>
                  <span className="font-medium">{character.affectionLevel || 0}/100</span>
                  <span>100</span>
                </div>
              </div>

              {/* Personality Badge */}
              <div>
                <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                  {getPersonalityLabel(character.personalityArchetype)}
                </span>
              </div>
            </div>

            {/* Bio */}
            <div className="p-6 border-b flex-1 overflow-y-auto">
              <h3 className="text-sm font-semibold text-gray-500 mb-2">自己紹介</h3>
              <p className="text-sm text-gray-700 leading-relaxed">{character.bio}</p>
            </div>

            {/* Conversation Stage */}
            <div className="p-6 border-t">
              <div className="text-sm text-gray-600">
                <span className="font-medium">関係性:</span> {' '}
                {conversation.stage === 'first_meet' && '初対面'}
                {conversation.stage === 'dating' && 'デート中'}
                {conversation.stage === 'relationship' && '交際中'}
                {conversation.stage === 'proposal' && 'プロポーズ'}
                {conversation.stage === 'marriage' && '結婚'}
              </div>
            </div>
          </aside>
        )}

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="bg-white shadow-sm border-b px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowSidebar(!showSidebar)}
                className="text-gray-600 hover:text-gray-900 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title={showSidebar ? 'サイドバーを隠す' : 'サイドバーを表示'}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <button
                onClick={() => router.push('/dashboard')}
                className="text-gray-600 hover:text-gray-900"
              >
                ← ダッシュボード
              </button>
              <div className="flex items-center space-x-3">
                {getCharacterImage() ? (
                  <img
                    src={getCharacterImage()!}
                    alt={character.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center text-xl">
                    👤
                  </div>
                )}
                <h1 className="text-lg font-bold text-gray-900">{character.name}</h1>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowExportModal(true)}
                disabled={messages.length === 0}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                title="会話履歴をエクスポート"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>エクスポート</span>
              </button>
              <button
                onClick={() => router.push(`/character/${character.id}`)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                プロフィール
              </button>
            </div>
          </header>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">💬</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                会話を始めましょう
              </h3>
              <p className="text-gray-600">
                {character.name}との最初のメッセージを送ってみてください
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-2xl ${
                    message.sender === 'user'
                      ? 'bg-pink-600 text-white'
                      : 'bg-white text-gray-900 shadow-sm'
                  } rounded-2xl px-4 py-3`}
                >
                  {message.sender === 'character' && message.emotion && (
                    <div className="text-xs text-gray-500 mb-1">
                      {message.emotion === 'happy' && '😊'}
                      {message.emotion === 'sad' && '😢'}
                      {message.emotion === 'excited' && '🤩'}
                      {message.emotion === 'neutral' && '😌'}
                      {message.emotion === 'love' && '😍'}
                      {message.emotion === 'surprised' && '😲'}
                    </div>
                  )}
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  <div
                    className={`text-xs mt-1 ${
                      message.sender === 'user' ? 'text-pink-200' : 'text-gray-400'
                    }`}
                  >
                    {new Date(message.createdAt).toLocaleTimeString('ja-JP', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              </div>
            ))
          )}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white shadow-sm rounded-2xl px-4 py-3 flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
                <span className="text-sm text-gray-500">{character.name}が入力中...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-white border-t px-6 py-4">
          <div className="flex items-end space-x-4">
            <div className="flex-1">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="メッセージを入力..."
                rows={3}
                disabled={isSending}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none disabled:opacity-50"
              />
            </div>
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isSending}
              className="px-6 py-3 bg-pink-600 text-white rounded-xl font-medium hover:bg-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed h-[84px]"
            >
              {isSending ? '送信中...' : '送信'}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Enterで送信、Shift+Enterで改行
          </p>
        </div>
        </div>

        {/* Export Modal */}
        {showExportModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
            onClick={() => setShowExportModal(false)}
          >
            <div
              className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">会話履歴をエクスポート</h3>
                <button
                  onClick={() => setShowExportModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-4">
                  エクスポート形式を選択してください。{messages.length}件のメッセージが含まれます。
                </p>

                <div className="space-y-3">
                  {/* JSON Export */}
                  <button
                    onClick={() => exportConversation('json')}
                    className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all text-left group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                          <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">JSON形式</h4>
                          <p className="text-xs text-gray-500">構造化データ（開発者向け）</p>
                        </div>
                      </div>
                      <svg className="w-5 h-5 text-gray-400 group-hover:text-purple-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </button>

                  {/* Text Export */}
                  <button
                    onClick={() => exportConversation('txt')}
                    className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">テキスト形式</h4>
                          <p className="text-xs text-gray-500">プレーンテキスト（シンプル）</p>
                        </div>
                      </div>
                      <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </button>

                  {/* Markdown Export */}
                  <button
                    onClick={() => exportConversation('md')}
                    className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all text-left group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">Markdown形式</h4>
                          <p className="text-xs text-gray-500">書式付きテキスト（GitHub対応）</p>
                        </div>
                      </div>
                      <svg className="w-5 h-5 text-gray-400 group-hover:text-green-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <p className="text-xs text-gray-500">
                  ファイルは自動的にダウンロードされます
                </p>
                <button
                  onClick={() => setShowExportModal(false)}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  キャンセル
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}