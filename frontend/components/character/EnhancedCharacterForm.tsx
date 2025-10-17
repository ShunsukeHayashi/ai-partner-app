'use client';

import { useState, useEffect } from 'react';
import { CharacterPreview } from './CharacterPreview';
import { VoicePreview } from './VoicePreview';
import { ImagePreview } from './ImagePreview';

interface CharacterFormData {
  // Basic Info
  name: string;
  age: number;
  occupation: string;
  hobbies: string[];
  favoriteFood: string[];
  birthday: string;
  bio: string;

  // Appearance
  appearanceStyle: 'anime' | 'realistic' | 'manga';
  hairColor: string;
  hairStyle: string;
  eyeColor: string;
  skinTone: string;
  height: string;
  bodyType: string;
  outfit: string;
  accessories: string[];
  customPrompt: string;

  // Personality
  personalityArchetype: string;
  traits: string[];
  speechStyle: string;
  emotionalTendency: string;
  interests: string[];
  values: string[];

  // Voice
  voiceId: string;
  voicePitch: number;
  voiceSpeed: number;
  voiceStyle: string;
}

interface CharacterFormSubmitData {
  // Basic Info
  name: string;
  age: number;
  occupation: string;
  hobbies: string; // comma-separated
  favoriteFood: string; // comma-separated
  birthday: string;
  bio: string;

  // Appearance
  appearanceStyle: 'anime' | 'realistic' | 'manga';
  hairColor: string;
  hairStyle: string;
  eyeColor: string;
  skinTone: string;
  height: string;
  bodyType: string;
  outfit: string;
  accessories: string; // comma-separated
  customPrompt: string;

  // Personality
  personalityArchetype: string;
  traits: string; // comma-separated
  speechStyle: string;
  emotionalTendency: string;
  interests: string; // comma-separated
  values: string; // comma-separated

  // Voice
  voiceId: string;
  voicePitch: number;
  voiceSpeed: number;
  voiceStyle: string;
}

interface EnhancedCharacterFormProps {
  onSubmit: (data: CharacterFormSubmitData) => void;
  isLoading?: boolean;
  submitText?: string;
  initialData?: Partial<CharacterFormData>;
}

export function EnhancedCharacterForm({ 
  onSubmit, 
  isLoading = false, 
  submitText = '作成',
  initialData = {}
}: EnhancedCharacterFormProps) {
  const [formData, setFormData] = useState<CharacterFormData>({
    // Basic Info
    name: '',
    age: 22,
    occupation: '',
    hobbies: [],
    favoriteFood: [],
    birthday: '',
    bio: '',

    // Appearance
    appearanceStyle: 'anime',
    hairColor: 'brown',
    hairStyle: 'long straight',
    eyeColor: 'brown',
    skinTone: 'fair',
    height: '160cm',
    bodyType: 'slim',
    outfit: 'casual dress',
    accessories: [],
    customPrompt: '',

    // Personality
    personalityArchetype: 'gentle',
    traits: [],
    speechStyle: 'polite',
    emotionalTendency: 'stable',
    interests: [],
    values: [],

    // Voice
    voiceId: 'Puck',
    voicePitch: 0,
    voiceSpeed: 1.0,
    voiceStyle: 'normal',

    ...initialData,
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);

  const totalSteps = 4;

  // バリデーション
  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1: // Basic Info
        if (!formData.name.trim()) newErrors.name = '名前は必須です';
        if (formData.age < 18 || formData.age > 99) newErrors.age = '年齢は18-99歳で入力してください';
        if (!formData.occupation.trim()) newErrors.occupation = '職業は必須です';
        if (!formData.bio.trim()) newErrors.bio = '自己紹介は必須です';
        break;
      
      case 2: // Appearance
        if (!formData.hairColor) newErrors.hairColor = '髪色を選択してください';
        if (!formData.hairStyle) newErrors.hairStyle = '髪型を選択してください';
        if (!formData.eyeColor) newErrors.eyeColor = '瞳の色を選択してください';
        if (!formData.skinTone) newErrors.skinTone = '肌の色を選択してください';
        break;
      
      case 3: // Personality
        if (!formData.personalityArchetype) newErrors.personalityArchetype = '性格タイプを選択してください';
        if (formData.traits.length === 0) newErrors.traits = '性格の特徴を1つ以上選択してください';
        break;
      
      case 4: // Voice
        if (!formData.voiceId) newErrors.voiceId = '音声を選択してください';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof CharacterFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // エラーをクリア
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleArrayChange = (field: keyof CharacterFormData, value: string) => {
    const currentArray = formData[field] as string[];
    if (currentArray.includes(value)) {
      handleInputChange(field, currentArray.filter(item => item !== value));
    } else {
      handleInputChange(field, [...currentArray, value]);
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep) && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateStep(currentStep)) {
      // Convert arrays to comma-separated strings for backend
      const submitData = {
        ...formData,
        hobbies: formData.hobbies.join(','),
        favoriteFood: formData.favoriteFood.join(','),
        accessories: formData.accessories.join(','),
        traits: formData.traits.join(','),
        interests: formData.interests.join(','),
        values: formData.values.join(','),
      };
      
      onSubmit(submitData);
    }
  };

  // 画像生成プレビュー
  const handleGenerateImage = async () => {
    setIsGeneratingImage(true);
    try {
      // TODO: BytePlus API呼び出し
      // const imageUrl = await generateCharacterImage(formData);
      // setGeneratedImageUrl(imageUrl);
      
      // モック
      setTimeout(() => {
        setGeneratedImageUrl('/api/placeholder/character-image.jpg');
        setIsGeneratingImage(false);
      }, 2000);
    } catch (error) {
      console.error('画像生成エラー:', error);
      setIsGeneratingImage(false);
    }
  };

  // 音声プレビュー
  const handlePlayVoice = async () => {
    setIsPlayingVoice(true);
    try {
      // TODO: Gemini TTS API呼び出し
      // await playVoicePreview(formData);
      
      // モック
      setTimeout(() => {
        setIsPlayingVoice(false);
      }, 3000);
    } catch (error) {
      console.error('音声再生エラー:', error);
      setIsPlayingVoice(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            ✨ 理想のパートナーを作成
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            AI技術を活用して、あなただけの特別なパートナーをカスタマイズしましょう
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            {Array.from({ length: totalSteps }, (_, index) => (
              <div key={index} className="flex items-center">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-300 ${
                    index + 1 <= currentStep
                      ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {index + 1}
                </div>
                {index < totalSteps - 1 && (
                  <div
                    className={`w-16 h-1 mx-2 transition-all duration-300 ${
                      index + 1 < currentStep
                        ? 'bg-gradient-to-r from-pink-500 to-purple-600'
                        : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-4 space-x-16">
            <span className={`text-sm font-medium ${currentStep >= 1 ? 'text-pink-600' : 'text-gray-400'}`}>
              基本情報
            </span>
            <span className={`text-sm font-medium ${currentStep >= 2 ? 'text-pink-600' : 'text-gray-400'}`}>
              外見設定
            </span>
            <span className={`text-sm font-medium ${currentStep >= 3 ? 'text-pink-600' : 'text-gray-400'}`}>
              性格設定
            </span>
            <span className={`text-sm font-medium ${currentStep >= 4 ? 'text-pink-600' : 'text-gray-400'}`}>
              音声設定
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Step 1: Basic Info */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">👤 基本情報</h2>
                    <p className="text-gray-600">パートナーの基本プロフィールを設定しましょう</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      名前 *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all ${
                        errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="例: 桜井 美咲"
                    />
                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        年齢 *
                      </label>
                      <input
                        type="number"
                        min="18"
                        max="99"
                        required
                        value={formData.age}
                        onChange={(e) => handleInputChange('age', parseInt(e.target.value))}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all ${
                          errors.age ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                      />
                      {errors.age && <p className="text-red-500 text-sm mt-1">{errors.age}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        誕生日 *
                      </label>
                      <input
                        type="date"
                        required
                        value={formData.birthday}
                        onChange={(e) => handleInputChange('birthday', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      職業 *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.occupation}
                      onChange={(e) => handleInputChange('occupation', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all ${
                        errors.occupation ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="例: カフェ店員、大学生、デザイナー"
                    />
                    {errors.occupation && <p className="text-red-500 text-sm mt-1">{errors.occupation}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      自己紹介 *
                    </label>
                    <textarea
                      required
                      value={formData.bio}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      rows={4}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all ${
                        errors.bio ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="キャラクターの性格や特徴を詳しく教えてください..."
                    />
                    {errors.bio && <p className="text-red-500 text-sm mt-1">{errors.bio}</p>}
                  </div>
                </div>
              )}

              {/* Step 2: Appearance */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">🎨 外見設定</h2>
                    <p className="text-gray-600">理想の外見をカスタマイズしましょう</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      スタイル *
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {(['anime', 'realistic', 'manga'] as const).map((style) => (
                        <button
                          key={style}
                          type="button"
                          onClick={() => handleInputChange('appearanceStyle', style)}
                          className={`p-4 rounded-xl border-2 font-medium transition-all duration-200 ${
                            formData.appearanceStyle === style
                              ? 'border-pink-500 bg-pink-50 text-pink-700 shadow-md'
                              : 'border-gray-300 bg-white text-gray-700 hover:border-pink-300 hover:shadow-sm'
                          }`}
                        >
                          {style === 'anime' && '🎌 アニメ風'}
                          {style === 'realistic' && '📸 リアル風'}
                          {style === 'manga' && '📚 マンガ風'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        髪色 *
                      </label>
                      <select
                        required
                        value={formData.hairColor}
                        onChange={(e) => handleInputChange('hairColor', e.target.value)}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent ${
                          errors.hairColor ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                      >
                        <option value="">選択してください</option>
                        <option value="black">黒</option>
                        <option value="brown">茶</option>
                        <option value="blonde">金</option>
                        <option value="red">赤</option>
                        <option value="blue">青</option>
                        <option value="pink">ピンク</option>
                        <option value="purple">紫</option>
                      </select>
                      {errors.hairColor && <p className="text-red-500 text-sm mt-1">{errors.hairColor}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        髪型 *
                      </label>
                      <select
                        required
                        value={formData.hairStyle}
                        onChange={(e) => handleInputChange('hairStyle', e.target.value)}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent ${
                          errors.hairStyle ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                      >
                        <option value="">選択してください</option>
                        <option value="long straight">ロングストレート</option>
                        <option value="long wavy">ロングウェーブ</option>
                        <option value="short bob">ショートボブ</option>
                        <option value="ponytail">ポニーテール</option>
                        <option value="twin tails">ツインテール</option>
                        <option value="messy">ボサボサ</option>
                      </select>
                      {errors.hairStyle && <p className="text-red-500 text-sm mt-1">{errors.hairStyle}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        瞳の色 *
                      </label>
                      <select
                        required
                        value={formData.eyeColor}
                        onChange={(e) => handleInputChange('eyeColor', e.target.value)}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent ${
                          errors.eyeColor ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                      >
                        <option value="">選択してください</option>
                        <option value="black">黒</option>
                        <option value="brown">茶</option>
                        <option value="blue">青</option>
                        <option value="green">緑</option>
                        <option value="purple">紫</option>
                        <option value="hazel">ヘーゼル</option>
                      </select>
                      {errors.eyeColor && <p className="text-red-500 text-sm mt-1">{errors.eyeColor}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        肌の色 *
                      </label>
                      <select
                        required
                        value={formData.skinTone}
                        onChange={(e) => handleInputChange('skinTone', e.target.value)}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent ${
                          errors.skinTone ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                      >
                        <option value="">選択してください</option>
                        <option value="fair">色白</option>
                        <option value="medium">中間色</option>
                        <option value="tan">小麦色</option>
                        <option value="dark">濃い色</option>
                      </select>
                      {errors.skinTone && <p className="text-red-500 text-sm mt-1">{errors.skinTone}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      服装
                    </label>
                    <input
                      type="text"
                      value={formData.outfit}
                      onChange={(e) => handleInputChange('outfit', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      placeholder="例: カジュアルなワンピース、セーター、ジーンズ"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      カスタムプロンプト（オプション）
                    </label>
                    <textarea
                      value={formData.customPrompt}
                      onChange={(e) => handleInputChange('customPrompt', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      placeholder="画像生成時の追加指示があれば入力してください..."
                    />
                  </div>
                </div>
              )}

              {/* Step 3: Personality */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">💝 性格設定</h2>
                    <p className="text-gray-600">パートナーの性格と価値観を設定しましょう</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      性格タイプ *
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { value: 'gentle', label: '🥰 優しい', desc: '思いやりがあり、穏やか' },
                        { value: 'cheerful', label: '😊 明るい', desc: 'ポジティブで元気' },
                        { value: 'cool', label: '😎 クール', desc: '知的で冷静' },
                        { value: 'shy', label: '😳 恥ずかしがり屋', desc: '内気で控えめ' },
                        { value: 'energetic', label: '⚡ 活発', desc: 'アクティブで情熱的' },
                        { value: 'mysterious', label: '🌙 神秘的', desc: 'ミステリアスで魅力的' },
                      ].map((type) => (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() => handleInputChange('personalityArchetype', type.value)}
                          className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                            formData.personalityArchetype === type.value
                              ? 'border-pink-500 bg-pink-50 text-pink-700 shadow-md'
                              : 'border-gray-300 bg-white text-gray-700 hover:border-pink-300 hover:shadow-sm'
                          }`}
                        >
                          <div className="font-medium">{type.label}</div>
                          <div className="text-xs text-gray-500 mt-1">{type.desc}</div>
                        </button>
                      ))}
                    </div>
                    {errors.personalityArchetype && <p className="text-red-500 text-sm mt-1">{errors.personalityArchetype}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      性格の特徴 *（複数選択可）
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {['思いやりがある', '聞き上手', '前向き', '誠実', 'ユーモアがある', '自立心が強い', '協調性がある', '創造的'].map((trait) => (
                        <label key={trait} className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.traits.includes(trait)}
                            onChange={() => handleArrayChange('traits', trait)}
                            className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                          />
                          <span className="ml-3 text-sm text-gray-700">{trait}</span>
                        </label>
                      ))}
                    </div>
                    {errors.traits && <p className="text-red-500 text-sm mt-1">{errors.traits}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        話し方
                      </label>
                      <select
                        value={formData.speechStyle}
                        onChange={(e) => handleInputChange('speechStyle', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      >
                        <option value="polite">丁寧語</option>
                        <option value="casual">カジュアル</option>
                        <option value="formal">フォーマル</option>
                        <option value="cute">可愛らしい</option>
                        <option value="cool">クール</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        感情表現
                      </label>
                      <select
                        value={formData.emotionalTendency}
                        onChange={(e) => handleInputChange('emotionalTendency', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      >
                        <option value="stable">安定</option>
                        <option value="expressive">表現豊か</option>
                        <option value="reserved">控えめ</option>
                        <option value="passionate">情熱的</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      趣味（複数選択可）
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {['読書', '料理', '音楽', '映画', 'スポーツ', 'ゲーム', 'アニメ', '旅行', 'アート', '写真', 'ダンス', 'カフェ巡り'].map((hobby) => (
                        <label key={hobby} className="flex items-center p-2 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.hobbies.includes(hobby)}
                            onChange={() => handleArrayChange('hobbies', hobby)}
                            className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">{hobby}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Voice */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">🎵 音声設定</h2>
                    <p className="text-gray-600">パートナーの声をカスタマイズしましょう</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      ボイス *
                    </label>
                    <div className="space-y-3">
                      {[
                        { value: 'Puck', label: 'Puck', desc: '活発で明るい女性の声', emoji: '😊' },
                        { value: 'Charon', label: 'Charon', desc: '落ち着いた大人の女性の声', emoji: '😌' },
                        { value: 'Kore', label: 'Kore', desc: '優しく温かい女性の声', emoji: '🥰' },
                        { value: 'Fenrir', label: 'Fenrir', desc: '大人っぽい魅力的な女性の声', emoji: '😎' },
                        { value: 'Aoede', label: 'Aoede', desc: 'エレガントで上品な女性の声', emoji: '👑' },
                      ].map((voice) => (
                        <button
                          key={voice.value}
                          type="button"
                          onClick={() => handleInputChange('voiceId', voice.value)}
                          className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                            formData.voiceId === voice.value
                              ? 'border-pink-500 bg-pink-50 text-pink-700 shadow-md'
                              : 'border-gray-300 bg-white text-gray-700 hover:border-pink-300 hover:shadow-sm'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">{voice.emoji} {voice.label}</div>
                              <div className="text-sm text-gray-500">{voice.desc}</div>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePlayVoice();
                              }}
                              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                                isPlayingVoice
                                  ? 'bg-gray-200 text-gray-500'
                                  : 'bg-pink-100 text-pink-700 hover:bg-pink-200'
                              }`}
                              disabled={isPlayingVoice}
                            >
                              {isPlayingVoice ? '再生中...' : '▶️ 試聴'}
                            </button>
                          </div>
                        </button>
                      ))}
                    </div>
                    {errors.voiceId && <p className="text-red-500 text-sm mt-1">{errors.voiceId}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      ピッチ: {formData.voicePitch > 0 ? '+' : ''}{formData.voicePitch}
                    </label>
                    <input
                      type="range"
                      min="-20"
                      max="20"
                      step="1"
                      value={formData.voicePitch}
                      onChange={(e) => handleInputChange('voicePitch', parseFloat(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>低い (-20)</span>
                      <span>標準 (0)</span>
                      <span>高い (+20)</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      速度: {formData.voiceSpeed}x
                    </label>
                    <input
                      type="range"
                      min="0.5"
                      max="2.0"
                      step="0.1"
                      value={formData.voiceSpeed}
                      onChange={(e) => handleInputChange('voiceSpeed', parseFloat(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>遅い (0.5x)</span>
                      <span>標準 (1.0x)</span>
                      <span>速い (2.0x)</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      スタイル
                    </label>
                    <select
                      value={formData.voiceStyle}
                      onChange={(e) => handleInputChange('voiceStyle', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    >
                      <option value="normal">標準</option>
                      <option value="soft">柔らかい</option>
                      <option value="energetic">元気</option>
                      <option value="calm">落ち着いた</option>
                      <option value="romantic">ロマンティック</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-8 border-t border-gray-200">
                <button
                  type="button"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-xl font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  ← 戻る
                </button>

                {currentStep < totalSteps ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-medium hover:from-pink-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
                  >
                    次へ →
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-medium hover:from-pink-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
                  >
                    {isLoading ? '✨ 作成中...' : '✨ パートナーを作成'}
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Preview */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">👀 プレビュー</h2>
              <p className="text-gray-600">設定内容を確認できます</p>
            </div>
            
            <CharacterPreview formData={formData} />
            
            {/* Image Generation Preview */}
            <div className="mt-6 p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl">
              <h3 className="font-semibold text-gray-900 mb-3">🎨 画像生成プレビュー</h3>
              <ImagePreview 
                formData={formData}
                isGenerating={isGeneratingImage}
                generatedImageUrl={generatedImageUrl}
                onGenerate={handleGenerateImage}
              />
            </div>

            {/* Voice Preview */}
            <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
              <h3 className="font-semibold text-gray-900 mb-3">🎵 音声プレビュー</h3>
              <VoicePreview 
                formData={formData}
                isPlaying={isPlayingVoice}
                onPlay={handlePlayVoice}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
