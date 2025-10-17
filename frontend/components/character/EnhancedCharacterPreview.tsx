'use client';

import { useState, useEffect } from 'react';

interface CharacterFormData {
  name: string;
  age: number;
  occupation: string;
  hobbies: string[];
  favoriteFood: string[];
  bio: string;
  appearanceStyle: 'anime' | 'realistic' | 'manga';
  hairColor: string;
  hairStyle: string;
  eyeColor: string;
  skinTone: string;
  height: string;
  bodyType: string;
  outfit: string;
  accessories: string[];
  personalityArchetype: string;
  traits: string[];
  speechStyle: string;
  emotionalTendency: string;
  interests: string[];
  values: string[];
  voiceId: string;
  voicePitch: number;
  voiceSpeed: number;
  voiceStyle: string;
}

interface EnhancedCharacterPreviewProps {
  formData: CharacterFormData;
}

export function EnhancedCharacterPreview({ formData }: EnhancedCharacterPreviewProps) {
  const [currentTab, setCurrentTab] = useState<'overview' | 'appearance' | 'personality' | 'voice'>('overview');
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 300);
    return () => clearTimeout(timer);
  }, [formData]);

  const getPersonalityEmoji = (archetype: string) => {
    const emojis: Record<string, string> = {
      gentle: '🥰',
      cheerful: '😊',
      cool: '😎',
      shy: '😳',
      energetic: '⚡',
      mysterious: '🌙',
    };
    return emojis[archetype] || '😊';
  };

  const getPersonalityColor = (archetype: string) => {
    const colors: Record<string, string> = {
      gentle: 'from-pink-400 to-rose-400',
      cheerful: 'from-yellow-400 to-orange-400',
      cool: 'from-blue-400 to-indigo-400',
      shy: 'from-purple-400 to-pink-400',
      energetic: 'from-green-400 to-emerald-400',
      mysterious: 'from-gray-400 to-slate-400',
    };
    return colors[archetype] || 'from-pink-400 to-rose-400';
  };

  const getHairEmoji = (style: string) => {
    const emojis: Record<string, string> = {
      'long straight': '👩',
      'long wavy': '👩‍🦱',
      'short bob': '👩‍💼',
      'ponytail': '👩‍🎤',
      'twin tails': '👩‍🎨',
      'messy': '👩‍🦳',
    };
    return emojis[style] || '👩';
  };

  const getStyleEmoji = (style: string) => {
    const emojis: Record<string, string> = {
      anime: '🎌',
      realistic: '📸',
      manga: '📚',
    };
    return emojis[style] || '🎌';
  };

  const tabs = [
    { id: 'overview', label: '概要', emoji: '👤' },
    { id: 'appearance', label: '外見', emoji: '🎨' },
    { id: 'personality', label: '性格', emoji: '💝' },
    { id: 'voice', label: '音声', emoji: '🎵' },
  ];

  return (
    <div className={`space-y-6 transition-all duration-300 ${isAnimating ? 'scale-105' : 'scale-100'}`}>
      {/* Character Avatar */}
      <div className="text-center">
        <div className={`w-40 h-40 mx-auto bg-gradient-to-br ${getPersonalityColor(formData.personalityArchetype)} rounded-full flex items-center justify-center text-8xl mb-4 shadow-lg`}>
          {getHairEmoji(formData.hairStyle)}
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          {formData.name || '名前未設定'}
        </h3>
        <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
          <span>{formData.age}歳</span>
          <span>•</span>
          <span>{formData.occupation || '職業未設定'}</span>
          <span>•</span>
          <span>{getStyleEmoji(formData.appearanceStyle)} {formData.appearanceStyle}</span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                currentTab === tab.id
                  ? 'border-pink-500 text-pink-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="mr-1">{tab.emoji}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-[300px]">
        {currentTab === 'overview' && (
          <div className="space-y-6">
            {/* Personality Summary */}
            <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-4">
              <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                <span className="mr-2">{getPersonalityEmoji(formData.personalityArchetype)}</span>
                性格タイプ
              </h4>
              <p className="text-gray-700 capitalize">{formData.personalityArchetype}</p>
              {formData.traits.length > 0 && (
                <div className="mt-3">
                  <p className="text-sm font-medium text-gray-600 mb-2">特徴:</p>
                  <div className="flex flex-wrap gap-2">
                    {formData.traits.map((trait) => (
                      <span
                        key={trait}
                        className="px-2 py-1 bg-pink-100 text-pink-800 text-xs rounded-full"
                      >
                        {trait}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Bio */}
            {formData.bio && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">自己紹介</h4>
                <p className="text-gray-700 leading-relaxed bg-gray-50 rounded-lg p-4">
                  {formData.bio}
                </p>
              </div>
            )}

            {/* Hobbies */}
            {formData.hobbies.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">趣味</h4>
                <div className="flex flex-wrap gap-2">
                  {formData.hobbies.map((hobby) => (
                    <span
                      key={hobby}
                      className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                    >
                      {hobby}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Favorite Food */}
            {formData.favoriteFood.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">好きな食べ物</h4>
                <div className="flex flex-wrap gap-2">
                  {formData.favoriteFood.map((food) => (
                    <span
                      key={food}
                      className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full"
                    >
                      {food}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {currentTab === 'appearance' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h5 className="font-medium text-gray-900 mb-2">髪</h5>
                <p className="text-sm text-gray-600">
                  {formData.hairColor} • {formData.hairStyle}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h5 className="font-medium text-gray-900 mb-2">目</h5>
                <p className="text-sm text-gray-600">{formData.eyeColor}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h5 className="font-medium text-gray-900 mb-2">肌</h5>
                <p className="text-sm text-gray-600">{formData.skinTone}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h5 className="font-medium text-gray-900 mb-2">体型</h5>
                <p className="text-sm text-gray-600">
                  {formData.height} • {formData.bodyType}
                </p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h5 className="font-medium text-gray-900 mb-2">服装</h5>
              <p className="text-sm text-gray-600">{formData.outfit}</p>
            </div>

            {formData.accessories.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h5 className="font-medium text-gray-900 mb-2">アクセサリー</h5>
                <div className="flex flex-wrap gap-2">
                  {formData.accessories.map((accessory) => (
                    <span
                      key={accessory}
                      className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full"
                    >
                      {accessory}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {currentTab === 'personality' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h5 className="font-medium text-gray-900 mb-2">話し方</h5>
                <p className="text-sm text-gray-600">{formData.speechStyle}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h5 className="font-medium text-gray-900 mb-2">感情表現</h5>
                <p className="text-sm text-gray-600">{formData.emotionalTendency}</p>
              </div>
            </div>

            {formData.interests.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h5 className="font-medium text-gray-900 mb-2">興味・関心</h5>
                <div className="flex flex-wrap gap-2">
                  {formData.interests.map((interest) => (
                    <span
                      key={interest}
                      className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {formData.values.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h5 className="font-medium text-gray-900 mb-2">価値観</h5>
                <div className="flex flex-wrap gap-2">
                  {formData.values.map((value) => (
                    <span
                      key={value}
                      className="px-2 py-1 bg-emerald-100 text-emerald-800 text-xs rounded-full"
                    >
                      {value}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {currentTab === 'voice' && (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4">
              <h5 className="font-medium text-gray-900 mb-2">選択中の音声</h5>
              <p className="text-sm text-gray-600">{formData.voiceId}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h5 className="font-medium text-gray-900 mb-2">ピッチ</h5>
                <p className="text-sm text-gray-600">
                  {formData.voicePitch > 0 ? '+' : ''}{formData.voicePitch}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h5 className="font-medium text-gray-900 mb-2">速度</h5>
                <p className="text-sm text-gray-600">{formData.voiceSpeed}x</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h5 className="font-medium text-gray-900 mb-2">スタイル</h5>
              <p className="text-sm text-gray-600">{formData.voiceStyle}</p>
            </div>
          </div>
        )}
      </div>

      {/* Completion Status */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <span className="text-green-400">✨</span>
          </div>
          <div className="ml-3">
            <p className="text-sm text-green-800">
              <strong>設定完了度:</strong> 基本設定が完了しました！
              画像生成と音声設定で、より具体的なパートナーを完成させましょう。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
