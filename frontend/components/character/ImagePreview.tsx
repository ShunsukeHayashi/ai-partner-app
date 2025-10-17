'use client';

import { useState } from 'react';

interface CharacterFormData {
  name: string;
  appearanceStyle: 'anime' | 'realistic' | 'manga';
  hairColor: string;
  hairStyle: string;
  eyeColor: string;
  skinTone: string;
  outfit: string;
  customPrompt: string;
}

interface ImagePreviewProps {
  formData: CharacterFormData;
  isGenerating: boolean;
  generatedImageUrl: string | null;
  onGenerate: () => void;
}

export function ImagePreview({ 
  formData, 
  isGenerating, 
  generatedImageUrl, 
  onGenerate 
}: ImagePreviewProps) {
  const [selectedExpression, setSelectedExpression] = useState('neutral');

  const expressions = [
    { id: 'neutral', label: '通常', emoji: '😊' },
    { id: 'smile', label: '笑顔', emoji: '😄' },
    { id: 'shy', label: '恥ずかしい', emoji: '😳' },
    { id: 'happy', label: '喜び', emoji: '🥰' },
    { id: 'surprised', label: '驚き', emoji: '😲' },
    { id: 'in_love', label: '恋する表情', emoji: '😍' },
  ];

  const generatePrompt = () => {
    const basePrompt = `${formData.appearanceStyle} style, ${formData.hairColor} hair, ${formData.hairStyle}, ${formData.eyeColor} eyes, ${formData.skinTone} skin, wearing ${formData.outfit}`;
    const expressionPrompt = `expression: ${selectedExpression}`;
    const customPrompt = formData.customPrompt ? `, ${formData.customPrompt}` : '';
    
    return `${basePrompt}, ${expressionPrompt}${customPrompt}, high quality, detailed, beautiful, professional`;
  };

  return (
    <div className="space-y-4">
      {/* Current Image Display */}
      <div className="relative">
        <div className="w-full h-64 bg-gradient-to-br from-pink-100 to-purple-100 rounded-xl flex items-center justify-center overflow-hidden">
          {generatedImageUrl ? (
            <img
              src={generatedImageUrl}
              alt={`${formData.name}の画像`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-center">
              <div className="text-6xl mb-4">🎨</div>
              <p className="text-gray-600 font-medium">画像を生成して表示</p>
              <p className="text-sm text-gray-500 mt-1">BytePlus AIで高品質な画像を作成</p>
            </div>
          )}
          
          {/* Generating Overlay */}
          {isGenerating && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-xl">
              <div className="text-center text-white">
                <div className="animate-spin w-8 h-8 border-4 border-white border-t-transparent rounded-full mx-auto mb-2"></div>
                <p className="font-medium">画像生成中...</p>
                <p className="text-sm opacity-75">しばらくお待ちください</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Expression Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          表情を選択
        </label>
        <div className="grid grid-cols-3 gap-2">
          {expressions.map((expression) => (
            <button
              key={expression.id}
              type="button"
              onClick={() => setSelectedExpression(expression.id)}
              className={`p-3 rounded-lg border-2 text-center transition-all ${
                selectedExpression === expression.id
                  ? 'border-pink-500 bg-pink-50 text-pink-700'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-pink-300'
              }`}
            >
              <div className="text-2xl mb-1">{expression.emoji}</div>
              <div className="text-xs font-medium">{expression.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Generate Button */}
      <button
        type="button"
        onClick={onGenerate}
        disabled={isGenerating || !formData.name}
        className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-medium hover:from-pink-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
      >
        {isGenerating ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
            生成中...
          </div>
        ) : (
          '🎨 画像を生成'
        )}
      </button>

      {/* Prompt Preview */}
      <div className="bg-gray-50 rounded-lg p-3">
        <label className="block text-xs font-medium text-gray-600 mb-1">
          生成プロンプト
        </label>
        <p className="text-xs text-gray-700 leading-relaxed">
          {generatePrompt()}
        </p>
      </div>

      {/* Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex">
          <div className="flex-shrink-0">
            <span className="text-blue-400">💡</span>
          </div>
          <div className="ml-2">
            <p className="text-sm text-blue-800">
              <strong>ヒント:</strong> カスタムプロンプトでより詳細な指示を追加できます。
              例: "背景は桜の花びらが舞う公園", "優しい笑顔で"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
