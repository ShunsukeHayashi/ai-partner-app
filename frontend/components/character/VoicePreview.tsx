'use client';

interface CharacterFormData {
  name: string;
  voiceId: string;
  voicePitch: number;
  voiceSpeed: number;
  voiceStyle: string;
}

interface VoicePreviewProps {
  formData: CharacterFormData;
  isPlaying: boolean;
  onPlay: () => void;
}

export function VoicePreview({ 
  formData, 
  isPlaying, 
  onPlay 
}: VoicePreviewProps) {
  const getVoiceInfo = (voiceId: string) => {
    const voices = {
      'Puck': { name: 'Puck', desc: '活発で明るい女性の声', emoji: '😊', color: 'bg-pink-100 text-pink-800' },
      'Charon': { name: 'Charon', desc: '落ち着いた大人の女性の声', emoji: '😌', color: 'bg-blue-100 text-blue-800' },
      'Kore': { name: 'Kore', desc: '優しく温かい女性の声', emoji: '🥰', color: 'bg-purple-100 text-purple-800' },
      'Fenrir': { name: 'Fenrir', desc: '大人っぽい魅力的な女性の声', emoji: '😎', color: 'bg-gray-100 text-gray-800' },
      'Aoede': { name: 'Aoede', desc: 'エレガントで上品な女性の声', emoji: '👑', color: 'bg-yellow-100 text-yellow-800' },
    };
    return voices[voiceId as keyof typeof voices] || voices['Puck'];
  };

  const voiceInfo = getVoiceInfo(formData.voiceId);

  const getPitchDescription = (pitch: number) => {
    if (pitch < -10) return '低い';
    if (pitch > 10) return '高い';
    return '標準';
  };

  const getSpeedDescription = (speed: number) => {
    if (speed < 0.8) return 'ゆっくり';
    if (speed > 1.2) return '速い';
    return '標準';
  };

  const getStyleDescription = (style: string) => {
    const styles = {
      'normal': '標準',
      'soft': '柔らかい',
      'energetic': '元気',
      'calm': '落ち着いた',
      'romantic': 'ロマンティック',
    };
    return styles[style as keyof typeof styles] || '標準';
  };

  return (
    <div className="space-y-4">
      {/* Voice Info */}
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <span className="text-2xl mr-2">{voiceInfo.emoji}</span>
            <div>
              <h4 className="font-semibold text-gray-900">{voiceInfo.name}</h4>
              <p className="text-sm text-gray-600">{voiceInfo.desc}</p>
            </div>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${voiceInfo.color}`}>
            選択中
          </span>
        </div>
      </div>

      {/* Voice Settings */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">ピッチ</span>
          <span className="text-sm text-gray-600">{getPitchDescription(formData.voicePitch)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">速度</span>
          <span className="text-sm text-gray-600">{getSpeedDescription(formData.voiceSpeed)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">スタイル</span>
          <span className="text-sm text-gray-600">{getStyleDescription(formData.voiceStyle)}</span>
        </div>
      </div>

      {/* Play Button */}
      <button
        type="button"
        onClick={onPlay}
        disabled={isPlaying}
        className={`w-full py-3 rounded-xl font-medium transition-all ${
          isPlaying
            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
            : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 shadow-lg hover:shadow-xl'
        }`}
      >
        {isPlaying ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full mr-2"></div>
            再生中...
          </div>
        ) : (
          <div className="flex items-center justify-center">
            <span className="mr-2">▶️</span>
            音声を試聴
          </div>
        )}
      </button>

      {/* Sample Text */}
      <div className="bg-gray-50 rounded-lg p-3">
        <label className="block text-xs font-medium text-gray-600 mb-1">
          サンプルテキスト
        </label>
        <p className="text-sm text-gray-700 leading-relaxed">
          「こんにちは！{formData.name}です。よろしくお願いします。今日はいい天気ですね。一緒にお話ししましょう！」
        </p>
      </div>

      {/* Voice Tips */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
        <div className="flex">
          <div className="flex-shrink-0">
            <span className="text-green-400">🎵</span>
          </div>
          <div className="ml-2">
            <p className="text-sm text-green-800">
              <strong>音声の特徴:</strong> Gemini TTS技術により、自然で感情豊かな音声を生成します。
              ピッチと速度を調整して、理想の声に近づけましょう。
            </p>
          </div>
        </div>
      </div>

      {/* Technical Info */}
      <div className="bg-gray-100 rounded-lg p-3">
        <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
          <div>
            <span className="font-medium">プロバイダー:</span> Gemini TTS
          </div>
          <div>
            <span className="font-medium">品質:</span> 高品質
          </div>
          <div>
            <span className="font-medium">言語:</span> 日本語
          </div>
          <div>
            <span className="font-medium">形式:</span> MP3
          </div>
        </div>
      </div>
    </div>
  );
}
