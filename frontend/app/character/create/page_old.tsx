'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';

type Step = 'profile' | 'appearance' | 'personality' | 'voice';

interface FormData {
  name: string;
  age: number;
  birthday: string;
  occupation: string;
  hobbies: string;
  favoriteFood: string;
  bio: string;
  appearanceStyle: 'realistic' | 'anime' | 'manga';
  hairColor: string;
  hairStyle: string;
  eyeColor: string;
  skinTone: string;
  height: string;
  bodyType: string;
  outfit: string;
  accessories: string;
  customPrompt: string;
  personalityArchetype: string;
  traits: string;
  speechStyle: string;
  emotionalTendency: string;
  interests: string;
  values: string;
  voiceProvider: string;
  voiceId: string;
  voicePitch: number;
  voiceSpeed: number;
  voiceStyle: string;
}

const initialFormData: FormData = {
  name: '',
  age: 20,
  birthday: '',
  occupation: '',
  hobbies: '',
  favoriteFood: '',
  bio: '',
  appearanceStyle: 'anime',
  hairColor: '',
  hairStyle: '',
  eyeColor: '',
  skinTone: '',
  height: '',
  bodyType: '',
  outfit: '',
  accessories: '',
  customPrompt: '',
  personalityArchetype: 'gentle',
  traits: '',
  speechStyle: 'polite',
  emotionalTendency: 'stable',
  interests: '',
  values: '',
  voiceProvider: 'gemini',
  voiceId: 'Puck',
  voicePitch: 0,
  voiceSpeed: 1.0,
  voiceStyle: 'normal',
};

export default function CreateCharacterPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>('profile');
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const steps: Step[] = ['profile', 'appearance', 'personality', 'voice'];
  const stepIndex = steps.indexOf(currentStep);

  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    const nextIndex = stepIndex + 1;
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex]);
    }
  };

  const handleBack = () => {
    const prevIndex = stepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex]);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError('');

    try {
      const characterData = {
        ...formData,
        age: Number(formData.age),
        birthday: new Date(formData.birthday).toISOString(),
        hobbies: formData.hobbies,
        traits: formData.traits,
        interests: formData.interests,
        voicePitch: Number(formData.voicePitch),
        voiceSpeed: Number(formData.voiceSpeed),
      };

      const response = await apiClient.createCharacter(characterData);
      router.push(`/character/${response.character.id}`);
    } catch (err: any) {
      setError(err.message || 'キャラクター作成に失敗しました');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            パートナーを作成
          </h1>
          <p className="text-gray-600">理想のパートナーをカスタマイズしましょう</p>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step} className="flex items-center flex-1">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold ${
                    index <= stepIndex
                      ? 'bg-pink-600 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {index + 1}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-2 ${
                      index < stepIndex ? 'bg-pink-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-sm font-medium text-gray-700">プロフィール</span>
            <span className="text-sm font-medium text-gray-700">外見</span>
            <span className="text-sm font-medium text-gray-700">性格</span>
            <span className="text-sm font-medium text-gray-700">音声</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {currentStep === 'profile' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">基本プロフィール</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">名前 *</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="例: 桜井 美咲"
                  value={formData.name}
                  onChange={(e) => updateFormData('name', e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">年齢 *</label>
                  <input
                    type="number"
                    required
                    min="18"
                    max="99"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    value={formData.age}
                    onChange={(e) => updateFormData('age', parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">誕生日 *</label>
                  <input
                    type="date"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    value={formData.birthday}
                    onChange={(e) => updateFormData('birthday', e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">職業 *</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="例: カフェ店員"
                  value={formData.occupation}
                  onChange={(e) => updateFormData('occupation', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">趣味（カンマ区切り）*</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="例: 読書, カフェ巡り, 映画鑑賞"
                  value={formData.hobbies}
                  onChange={(e) => updateFormData('hobbies', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">好きな食べ物 *</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="例: パスタ, パンケーキ"
                  value={formData.favoriteFood}
                  onChange={(e) => updateFormData('favoriteFood', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">自己紹介 *</label>
                <textarea
                  required
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="キャラクターの背景や性格を簡潔に..."
                  value={formData.bio}
                  onChange={(e) => updateFormData('bio', e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="flex justify-between mt-8 pt-6 border-t">
            <button
              type="button"
              onClick={handleBack}
              disabled={stepIndex === 0}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              戻る
            </button>
            {stepIndex < steps.length - 1 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-2 bg-pink-600 text-white rounded-lg font-medium hover:bg-pink-700"
              >
                次へ
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isLoading}
                className="px-6 py-2 bg-pink-600 text-white rounded-lg font-medium hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? '作成中...' : 'パートナーを作成'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}