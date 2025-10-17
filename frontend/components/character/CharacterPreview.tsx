'use client';

interface CharacterFormData {
  name: string;
  age: number;
  occupation: string;
  hobbies: string[];
  favoriteFood: string[];
  bio: string;
  appearanceStyle: string;
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
}

interface CharacterPreviewProps {
  formData: CharacterFormData;
}

export function CharacterPreview({ formData }: CharacterPreviewProps) {
  const getPersonalityEmoji = (archetype: string) => {
    const emojis: Record<string, string> = {
      cheerful: '😊',
      gentle: '🥰',
      cool: '😎',
      shy: '😳',
      energetic: '⚡',
      mysterious: '🌙',
    };
    return emojis[archetype] || '😊';
  };

  const getHairEmoji = (style: string) => {
    const emojis: Record<string, string> = {
      'long straight': '👩',
      'long wavy': '👩‍🦱',
      'short bob': '👩‍💼',
      'ponytail': '👩‍🎤',
      'twin tails': '👩‍🎨',
    };
    return emojis[style] || '👩';
  };

  return (
    <div className="space-y-6">
      {/* Character Avatar */}
      <div className="text-center">
        <div className="w-32 h-32 mx-auto bg-gradient-to-br from-pink-100 to-purple-100 rounded-full flex items-center justify-center text-6xl mb-4">
          {getHairEmoji(formData.hairStyle)}
        </div>
        <h3 className="text-xl font-semibold text-gray-900">
          {formData.name || '名前未設定'}
        </h3>
        <p className="text-sm text-gray-600">
          {formData.age}歳 • {formData.occupation || '職業未設定'}
        </p>
      </div>

      {/* Basic Info */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900">基本情報</h4>
        <div className="text-sm text-gray-600 space-y-1">
          <p>
            <span className="font-medium">スタイル:</span> {formData.appearanceStyle}
          </p>
          <p>
            <span className="font-medium">髪:</span> {formData.hairColor} • {formData.hairStyle}
          </p>
          <p>
            <span className="font-medium">目:</span> {formData.eyeColor}
          </p>
          <p>
            <span className="font-medium">肌:</span> {formData.skinTone}
          </p>
          <p>
            <span className="font-medium">身長:</span> {formData.height}
          </p>
          <p>
            <span className="font-medium">体型:</span> {formData.bodyType}
          </p>
          <p>
            <span className="font-medium">服装:</span> {formData.outfit}
          </p>
        </div>
      </div>

      {/* Personality */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900">性格</h4>
        <div className="text-sm text-gray-600 space-y-1">
          <p>
            <span className="font-medium">タイプ:</span> {getPersonalityEmoji(formData.personalityArchetype)} {formData.personalityArchetype}
          </p>
          <p>
            <span className="font-medium">話し方:</span> {formData.speechStyle}
          </p>
          <p>
            <span className="font-medium">感情表現:</span> {formData.emotionalTendency}
          </p>
        </div>
      </div>

      {/* Interests */}
      {formData.hobbies.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">趣味</h4>
          <div className="flex flex-wrap gap-2">
            {formData.hobbies.map((hobby) => (
              <span
                key={hobby}
                className="px-2 py-1 bg-pink-100 text-pink-800 text-xs rounded-full"
              >
                {hobby}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Favorite Food */}
      {formData.favoriteFood.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">好きな食べ物</h4>
          <div className="flex flex-wrap gap-2">
            {formData.favoriteFood.map((food) => (
              <span
                key={food}
                className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full"
              >
                {food}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Values */}
      {formData.values.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">価値観</h4>
          <div className="flex flex-wrap gap-2">
            {formData.values.map((value) => (
              <span
                key={value}
                className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
              >
                {value}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Bio */}
      {formData.bio && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">自己紹介</h4>
          <p className="text-sm text-gray-600 leading-relaxed">
            {formData.bio}
          </p>
        </div>
      )}

      {/* Preview Note */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <span className="text-yellow-400">💡</span>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-800">
              実際の画像は作成後にBytePlus AIで生成されます
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
