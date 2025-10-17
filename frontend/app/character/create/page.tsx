'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';

type CreateMode = 'quick' | 'detailed' | 'image';
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

interface QuickFormData {
  name: string;
  age: number;
  description: string;
}

interface ImageFormData {
  imageData: string; // Base64 encoded image
  mimeType: 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp';
  name?: string;
  age?: number;
  description?: string;
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

const initialQuickFormData: QuickFormData = {
  name: '',
  age: 20,
  description: '',
};

export default function CreateCharacterPage() {
  const router = useRouter();
  const [createMode, setCreateMode] = useState<CreateMode>('quick');
  const [currentStep, setCurrentStep] = useState<Step>('profile');
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [quickFormData, setQuickFormData] = useState<QuickFormData>(initialQuickFormData);
  const [imageFormData, setImageFormData] = useState<ImageFormData | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingDetails, setIsGeneratingDetails] = useState(false);
  const [isGeneratingFromImage, setIsGeneratingFromImage] = useState(false);
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

  const handleQuickGenerate = async () => {
    setIsGeneratingDetails(true);
    setError('');

    try {
      const response = await apiClient.generateCharacterDetails({
        name: quickFormData.name,
        age: quickFormData.age,
        description: quickFormData.description,
      });

      // Redirect to character detail page
      router.push(`/character/${response.character.id}`);
    } catch (err: any) {
      setError(err.message || 'キャラクター生成に失敗しました');
      setIsGeneratingDetails(false);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('JPEG, PNG, GIF, WebPのいずれかのファイルを選択してください');
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('ファイルサイズは5MB以下にしてください');
      return;
    }

    // Read file as base64
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const base64Data = base64String.split(',')[1]; // Remove data:image/...;base64, prefix

      setImageFormData({
        imageData: base64Data,
        mimeType: file.type as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
      });
      setImagePreview(base64String); // Keep full data URL for preview
      setError('');
    };
    reader.onerror = () => {
      setError('画像の読み込みに失敗しました');
    };
    reader.readAsDataURL(file);
  };

  const handleImageGenerate = async () => {
    if (!imageFormData) {
      setError('画像を選択してください');
      return;
    }

    setIsGeneratingFromImage(true);
    setError('');

    try {
      const response = await apiClient.generateCharacterFromImage(imageFormData);

      // Redirect to character detail page
      router.push(`/character/${response.character.id}`);
    } catch (err: any) {
      setError(err.message || 'キャラクター生成に失敗しました');
      setIsGeneratingFromImage(false);
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
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-gray-600 hover:text-gray-900 mb-4"
          >
            ← ダッシュボードに戻る
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            パートナーを作成
          </h1>
          <p className="text-gray-600">理想のパートナーをカスタマイズしましょう</p>
        </div>

        {/* Mode Selection */}
        <div className="mb-8 bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <span className="mr-2">🎯</span>
            作成モードを選択
          </h2>
          <div className="grid grid-cols-3 gap-4">
            <button
              type="button"
              onClick={() => setCreateMode('quick')}
              className={`p-6 rounded-lg border-2 text-left transition-all ${
                createMode === 'quick'
                  ? 'border-pink-600 bg-pink-50 shadow-lg'
                  : 'border-gray-300 bg-white hover:border-pink-300'
              }`}
            >
              <div className="flex items-center mb-2">
                <span className="text-2xl mr-2">⚡</span>
                <span className={`text-lg font-bold ${createMode === 'quick' ? 'text-pink-700' : 'text-gray-900'}`}>
                  簡単作成（推奨）
                </span>
                {createMode === 'quick' && (
                  <span className="ml-auto text-pink-600">✓</span>
                )}
              </div>
              <p className="text-sm text-gray-600 mb-2">
                3項目だけ入力すればAIが残りを自動生成
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">所要時間: 1分</span>
                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">AI自動生成</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setCreateMode('detailed')}
              className={`p-6 rounded-lg border-2 text-left transition-all ${
                createMode === 'detailed'
                  ? 'border-pink-600 bg-pink-50 shadow-lg'
                  : 'border-gray-300 bg-white hover:border-pink-300'
              }`}
            >
              <div className="flex items-center mb-2">
                <span className="text-2xl mr-2">⚙️</span>
                <span className={`text-lg font-bold ${createMode === 'detailed' ? 'text-pink-700' : 'text-gray-900'}`}>
                  詳細作成
                </span>
                {createMode === 'detailed' && (
                  <span className="ml-auto text-pink-600">✓</span>
                )}
              </div>
              <p className="text-sm text-gray-600 mb-2">
                全ての項目を細かくカスタマイズ
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="text-xs px-2 py-1 bg-orange-100 text-orange-700 rounded-full">所要時間: 5-10分</span>
                <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full">完全カスタマイズ</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setCreateMode('image')}
              className={`p-6 rounded-lg border-2 text-left transition-all ${
                createMode === 'image'
                  ? 'border-pink-600 bg-pink-50 shadow-lg'
                  : 'border-gray-300 bg-white hover:border-pink-300'
              }`}
            >
              <div className="flex items-center mb-2">
                <span className="text-2xl mr-2">📷</span>
                <span className={`text-lg font-bold ${createMode === 'image' ? 'text-pink-700' : 'text-gray-900'}`}>
                  画像から作成
                </span>
                {createMode === 'image' && (
                  <span className="ml-auto text-pink-600">✓</span>
                )}
              </div>
              <p className="text-sm text-gray-600 mb-2">
                好みの画像をアップロードして自動生成
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">所要時間: 2分</span>
                <span className="text-xs px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full">AI画像解析</span>
              </div>
            </button>
          </div>
        </div>

        {/* Progress Steps - Only show for detailed mode */}
        {createMode === 'detailed' && (
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
        )}

        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Quick Create Mode */}
          {createMode === 'quick' && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <span className="text-4xl mb-4 block">⚡</span>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">簡単作成</h2>
                <p className="text-gray-600">3項目だけ入力すれば、AIが残りを自動生成します</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">名前 *</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="例: 桜井 美咲"
                  value={quickFormData.name}
                  onChange={(e) => setQuickFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">年齢 *</label>
                <input
                  type="number"
                  required
                  min="18"
                  max="99"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  value={quickFormData.age}
                  onChange={(e) => setQuickFormData(prev => ({ ...prev, age: parseInt(e.target.value) }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">簡単な説明（1-2文）*</label>
                <textarea
                  required
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="例: 歌舞伎町にいそうな地雷女子。ピンクと黒の髪色で、少し病んでる感じのキャラクター。"
                  value={quickFormData.description}
                  onChange={(e) => setQuickFormData(prev => ({ ...prev, description: e.target.value }))}
                />
                <p className="text-xs text-gray-500 mt-1">
                  外見、性格、雰囲気などを自由に書いてください。AIが詳細を生成します。
                </p>
              </div>

              <div className="flex justify-end mt-8 pt-6 border-t">
                <button
                  type="button"
                  onClick={handleQuickGenerate}
                  disabled={!quickFormData.name || !quickFormData.description || isGeneratingDetails}
                  className="px-8 py-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-lg font-medium hover:from-pink-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {isGeneratingDetails ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      AI生成中...
                    </>
                  ) : (
                    <>
                      <span className="mr-2">✨</span>
                      AIで自動生成して作成
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Image Upload Mode */}
          {createMode === 'image' && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <span className="text-4xl mb-4 block">📷</span>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">画像から作成</h2>
                <p className="text-gray-600">好みの画像をアップロードすれば、AIが外見を自動解析します</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">画像を選択 *</label>
                <div className="flex items-center justify-center w-full">
                  <label className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                    imagePreview
                      ? 'border-pink-500 bg-pink-50'
                      : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
                  }`}>
                    {imagePreview ? (
                      <div className="relative w-full h-full p-4">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-full object-contain rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            setImagePreview(null);
                            setImageFormData(null);
                          }}
                          className="absolute top-6 right-6 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 shadow-lg"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <svg className="w-10 h-10 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">クリックして画像をアップロード</span>
                        </p>
                        <p className="text-xs text-gray-500">JPEG, PNG, GIF, WebP (最大5MB)</p>
                      </div>
                    )}
                    <input
                      type="file"
                      className="hidden"
                      accept="image/jpeg,image/png,image/gif,image/webp"
                      onChange={handleImageUpload}
                    />
                  </label>
                </div>
              </div>

              <div className="border-t pt-6">
                <p className="text-sm text-gray-600 mb-4">
                  オプション: 名前や年齢を指定できます（指定しない場合はAIが推定します）
                </p>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">名前（オプション）</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      placeholder="指定しない場合はAIが提案"
                      value={imageFormData?.name || ''}
                      onChange={(e) => setImageFormData(prev => prev ? ({ ...prev, name: e.target.value || undefined }) : null)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">年齢（オプション）</label>
                    <input
                      type="number"
                      min="18"
                      max="99"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      placeholder="指定しない場合はAIが推定"
                      value={imageFormData?.age || ''}
                      onChange={(e) => setImageFormData(prev => prev ? ({ ...prev, age: e.target.value ? parseInt(e.target.value) : undefined }) : null)}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-8 pt-6 border-t">
                <button
                  type="button"
                  onClick={handleImageGenerate}
                  disabled={!imageFormData || isGeneratingFromImage}
                  className="px-8 py-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-lg font-medium hover:from-pink-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {isGeneratingFromImage ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      AI解析中...
                    </>
                  ) : (
                    <>
                      <span className="mr-2">🔍</span>
                      画像を解析して作成
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Detailed Create Mode - Only show for detailed mode */}
          {createMode === 'detailed' && (
            <>
              {/* Step 1: Profile */}
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

          {/* Step 2: Appearance */}
          {currentStep === 'appearance' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">外見設定</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">スタイル *</label>
                <div className="grid grid-cols-3 gap-4">
                  {(['anime', 'realistic', 'manga'] as const).map((style) => (
                    <button
                      key={style}
                      type="button"
                      className={`px-4 py-3 rounded-lg border-2 font-medium transition-colors ${
                        formData.appearanceStyle === style
                          ? 'border-pink-600 bg-pink-50 text-pink-700'
                          : 'border-gray-300 bg-white text-gray-700 hover:border-pink-300'
                      }`}
                      onClick={() => updateFormData('appearanceStyle', style)}
                    >
                      {style === 'anime' && 'アニメ'}
                      {style === 'realistic' && 'リアル'}
                      {style === 'manga' && 'マンガ'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">髪色 *</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="例: 黒髪"
                    value={formData.hairColor}
                    onChange={(e) => updateFormData('hairColor', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">髪型 *</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="例: ロングヘア"
                    value={formData.hairStyle}
                    onChange={(e) => updateFormData('hairStyle', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">瞳の色 *</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="例: 茶色"
                    value={formData.eyeColor}
                    onChange={(e) => updateFormData('eyeColor', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">肌の色 *</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="例: 色白"
                    value={formData.skinTone}
                    onChange={(e) => updateFormData('skinTone', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">身長 *</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="例: 160cm"
                    value={formData.height}
                    onChange={(e) => updateFormData('height', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">体型 *</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="例: スリム"
                    value={formData.bodyType}
                    onChange={(e) => updateFormData('bodyType', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">服装 *</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="例: カジュアルなワンピース"
                  value={formData.outfit}
                  onChange={(e) => updateFormData('outfit', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">アクセサリー *</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="例: シンプルなネックレス"
                  value={formData.accessories}
                  onChange={(e) => updateFormData('accessories', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">カスタムプロンプト（オプション）</label>
                <textarea
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="画像生成時の追加指示..."
                  value={formData.customPrompt}
                  onChange={(e) => updateFormData('customPrompt', e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Step 3: Personality */}
          {currentStep === 'personality' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">性格設定</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">性格タイプ *</label>
                <select
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  value={formData.personalityArchetype}
                  onChange={(e) => updateFormData('personalityArchetype', e.target.value)}
                >
                  <option value="gentle">優しい</option>
                  <option value="cheerful">明るい</option>
                  <option value="cool">クール</option>
                  <option value="shy">恥ずかしがり屋</option>
                  <option value="energetic">元気</option>
                  <option value="mysterious">ミステリアス</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">性格の特徴（カンマ区切り）*</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="例: 思いやりがある, 聞き上手, 前向き"
                  value={formData.traits}
                  onChange={(e) => updateFormData('traits', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">話し方 *</label>
                <select
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  value={formData.speechStyle}
                  onChange={(e) => updateFormData('speechStyle', e.target.value)}
                >
                  <option value="polite">丁寧</option>
                  <option value="casual">カジュアル</option>
                  <option value="formal">フォーマル</option>
                  <option value="cute">かわいい</option>
                  <option value="mature">大人っぽい</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">感情表現 *</label>
                <select
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  value={formData.emotionalTendency}
                  onChange={(e) => updateFormData('emotionalTendency', e.target.value)}
                >
                  <option value="stable">安定</option>
                  <option value="expressive">表現豊か</option>
                  <option value="reserved">控えめ</option>
                  <option value="passionate">情熱的</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">興味のあること（カンマ区切り）*</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="例: 音楽, アート, 料理"
                  value={formData.interests}
                  onChange={(e) => updateFormData('interests', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">大切にしていること *</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="例: 誠実さ, 優しさ, 思いやり"
                  value={formData.values}
                  onChange={(e) => updateFormData('values', e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Step 4: Voice */}
          {currentStep === 'voice' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">音声設定</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ボイス *</label>
                <select
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  value={formData.voiceId}
                  onChange={(e) => updateFormData('voiceId', e.target.value)}
                >
                  <option value="Puck">Puck（活発な女性）</option>
                  <option value="Charon">Charon（落ち着いた女性）</option>
                  <option value="Kore">Kore（優しい女性）</option>
                  <option value="Fenrir">Fenrir（大人の女性）</option>
                  <option value="Aoede">Aoede（エレガントな女性）</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ピッチ: {formData.voicePitch}
                </label>
                <input
                  type="range"
                  min="-20"
                  max="20"
                  step="1"
                  className="w-full"
                  value={formData.voicePitch}
                  onChange={(e) => updateFormData('voicePitch', parseFloat(e.target.value))}
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>低い (-20)</span>
                  <span>標準 (0)</span>
                  <span>高い (+20)</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  速度: {formData.voiceSpeed}x
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.1"
                  className="w-full"
                  value={formData.voiceSpeed}
                  onChange={(e) => updateFormData('voiceSpeed', parseFloat(e.target.value))}
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>遅い (0.5x)</span>
                  <span>標準 (1.0x)</span>
                  <span>速い (2.0x)</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">スタイル *</label>
                <select
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  value={formData.voiceStyle}
                  onChange={(e) => updateFormData('voiceStyle', e.target.value)}
                >
                  <option value="normal">標準</option>
                  <option value="cheerful">明るい</option>
                  <option value="calm">落ち着いた</option>
                  <option value="excited">興奮した</option>
                </select>
              </div>
            </div>
          )}

              {/* Navigation Buttons - Detailed Mode Only */}
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}
