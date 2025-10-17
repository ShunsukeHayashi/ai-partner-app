'use client';

import { useState, useEffect } from 'react';
import { CharacterPreview } from './CharacterPreview';

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
  appearanceStyle: string;
  hairColor: string;
  hairStyle: string;
  eyeColor: string;
  skinTone: string;
  height: string;
  bodyType: string;
  outfit: string;
  accessories: string[];

  // Personality
  personalityArchetype: string;
  traits: string[];
  speechStyle: string;
  emotionalTendency: string;
  interests: string[];
  values: string[];
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
  appearanceStyle: string;
  hairColor: string;
  hairStyle: string;
  eyeColor: string;
  skinTone: string;
  height: string;
  bodyType: string;
  outfit: string;
  accessories: string; // comma-separated

  // Personality
  personalityArchetype: string;
  traits: string; // comma-separated
  speechStyle: string;
  emotionalTendency: string;
  interests: string; // comma-separated
  values: string; // comma-separated
}

interface CharacterFormProps {
  onSubmit: (data: CharacterFormSubmitData) => void;
  isLoading?: boolean;
  submitText?: string;
  initialData?: Partial<CharacterFormData>;
}

export function CharacterForm({ 
  onSubmit, 
  isLoading = false, 
  submitText = '作成',
  initialData = {}
}: CharacterFormProps) {
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

    // Personality
    personalityArchetype: 'cheerful',
    traits: [],
    speechStyle: 'casual',
    emotionalTendency: 'expressive',
    interests: [],
    values: [],

    ...initialData,
  });

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  const handleInputChange = (field: keyof CharacterFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayChange = (field: keyof CharacterFormData, value: string) => {
    const currentArray = formData[field] as string[];
    if (currentArray.includes(value)) {
      handleInputChange(field, currentArray.filter(item => item !== value));
    } else {
      handleInputChange(field, [...currentArray, value]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
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
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Form */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold text-gray-900">
              キャラクター設定
            </h2>
            <span className="text-sm text-gray-500">
              {currentStep} / {totalSteps}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-pink-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-md font-medium text-gray-900">基本情報</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  名前 *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-pink-500 focus:border-pink-500"
                  placeholder="例: さくら"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  年齢 *
                </label>
                <input
                  type="number"
                  min="18"
                  max="50"
                  required
                  value={formData.age}
                  onChange={(e) => handleInputChange('age', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-pink-500 focus:border-pink-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  職業
                </label>
                <input
                  type="text"
                  value={formData.occupation}
                  onChange={(e) => handleInputChange('occupation', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-pink-500 focus:border-pink-500"
                  placeholder="例: 大学生"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  自己紹介
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-pink-500 focus:border-pink-500"
                  placeholder="キャラクターの性格や特徴を簡単に説明してください"
                />
              </div>
            </div>
          )}

          {/* Step 2: Appearance */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <h3 className="text-md font-medium text-gray-900">外見設定</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  スタイル
                </label>
                <select
                  value={formData.appearanceStyle}
                  onChange={(e) => handleInputChange('appearanceStyle', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-pink-500 focus:border-pink-500"
                >
                  <option value="anime">アニメ風</option>
                  <option value="realistic">リアル風</option>
                  <option value="manga">マンガ風</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    髪の色
                  </label>
                  <select
                    value={formData.hairColor}
                    onChange={(e) => handleInputChange('hairColor', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-pink-500 focus:border-pink-500"
                  >
                    <option value="black">黒</option>
                    <option value="brown">茶</option>
                    <option value="blonde">金</option>
                    <option value="red">赤</option>
                    <option value="blue">青</option>
                    <option value="pink">ピンク</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    髪型
                  </label>
                  <select
                    value={formData.hairStyle}
                    onChange={(e) => handleInputChange('hairStyle', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-pink-500 focus:border-pink-500"
                  >
                    <option value="long straight">ロングストレート</option>
                    <option value="long wavy">ロングウェーブ</option>
                    <option value="short bob">ショートボブ</option>
                    <option value="ponytail">ポニーテール</option>
                    <option value="twin tails">ツインテール</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    目の色
                  </label>
                  <select
                    value={formData.eyeColor}
                    onChange={(e) => handleInputChange('eyeColor', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-pink-500 focus:border-pink-500"
                  >
                    <option value="black">黒</option>
                    <option value="brown">茶</option>
                    <option value="blue">青</option>
                    <option value="green">緑</option>
                    <option value="purple">紫</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    肌の色
                  </label>
                  <select
                    value={formData.skinTone}
                    onChange={(e) => handleInputChange('skinTone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-pink-500 focus:border-pink-500"
                  >
                    <option value="fair">白</option>
                    <option value="medium">中間</option>
                    <option value="tan">小麦色</option>
                    <option value="dark">濃い</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  服装
                </label>
                <input
                  type="text"
                  value={formData.outfit}
                  onChange={(e) => handleInputChange('outfit', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-pink-500 focus:border-pink-500"
                  placeholder="例: カジュアルなドレス"
                />
              </div>
            </div>
          )}

          {/* Step 3: Personality */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <h3 className="text-md font-medium text-gray-900">性格設定</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  性格タイプ
                </label>
                <select
                  value={formData.personalityArchetype}
                  onChange={(e) => handleInputChange('personalityArchetype', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-pink-500 focus:border-pink-500"
                >
                  <option value="cheerful">明るい</option>
                  <option value="gentle">優しい</option>
                  <option value="cool">クール</option>
                  <option value="shy">恥ずかしがり屋</option>
                  <option value="energetic">活発</option>
                  <option value="mysterious">神秘的</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  話し方
                </label>
                <select
                  value={formData.speechStyle}
                  onChange={(e) => handleInputChange('speechStyle', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-pink-500 focus:border-pink-500"
                >
                  <option value="casual">カジュアル</option>
                  <option value="polite">丁寧</option>
                  <option value="cute">可愛い</option>
                  <option value="cool">クール</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  感情表現
                </label>
                <select
                  value={formData.emotionalTendency}
                  onChange={(e) => handleInputChange('emotionalTendency', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-pink-500 focus:border-pink-500"
                >
                  <option value="expressive">表現豊か</option>
                  <option value="reserved">控えめ</option>
                  <option value="balanced">バランス型</option>
                </select>
              </div>
            </div>
          )}

          {/* Step 4: Interests & Values */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <h3 className="text-md font-medium text-gray-900">趣味・価値観</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  趣味（複数選択可）
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {['読書', '料理', '音楽', '映画', 'スポーツ', 'ゲーム', 'アニメ', '旅行'].map((hobby) => (
                    <label key={hobby} className="flex items-center">
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  好きな食べ物（複数選択可）
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {['寿司', 'ラーメン', 'パスタ', 'ピザ', 'ケーキ', 'チョコレート', 'フルーツ', '和食'].map((food) => (
                    <label key={food} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.favoriteFood.includes(food)}
                        onChange={() => handleArrayChange('favoriteFood', food)}
                        className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">{food}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  価値観（複数選択可）
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {['誠実さ', '友情', '家族', '成功', '自由', '平和', '愛情', '成長'].map((value) => (
                    <label key={value} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.values.includes(value)}
                        onChange={() => handleArrayChange('values', value)}
                        className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">{value}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              前へ
            </button>

            {currentStep < totalSteps ? (
              <button
                type="button"
                onClick={nextStep}
                className="px-4 py-2 text-sm font-medium text-white bg-pink-600 rounded-lg hover:bg-pink-700"
              >
                次へ
              </button>
            ) : (
              <button
                type="submit"
                disabled={isLoading || !formData.name}
                className="px-6 py-2 text-sm font-medium text-white bg-pink-600 rounded-lg hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitText}
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Preview */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          プレビュー
        </h2>
        <CharacterPreview formData={formData} />
      </div>
    </div>
  );
}
