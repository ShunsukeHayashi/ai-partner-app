'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';

interface Character {
  id: string;
  name: string;
  age: number;
  birthday: string;
  occupation: string;
  hobbies: string;
  favoriteFood: string;
  bio: string;
  appearanceStyle: string;
  hairColor: string;
  hairStyle: string;
  eyeColor: string;
  skinTone: string;
  height: string;
  bodyType: string;
  outfit: string;
  accessories: string;
  personalityArchetype: string;
  traits: string;
  speechStyle: string;
  emotionalTendency: string;
  interests: string;
  values: string;
  voiceId: string;
  voicePitch: number;
  voiceSpeed: number;
  voiceStyle: string;
  primaryImageUrl?: string;
  expressionUrls?: any;
  imagesGenerated: boolean;
  totalConversations: number;
  totalMessages: number;
  datesCount: number;
  lastInteraction: string;
}

export default function CharacterDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [character, setCharacter] = useState<Character | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isGeneratingExpression, setIsGeneratingExpression] = useState(false);
  const [selectedExpression, setSelectedExpression] = useState<string>('');
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [error, setError] = useState('');
  const [japaneseInput, setJapaneseInput] = useState<string>('');
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);

  // Hairstyle state
  const [selectedHairstyle, setSelectedHairstyle] = useState<string>('');
  const [hairColor, setHairColor] = useState<string>('');
  const [hairstyleCustomPrompt, setHairstyleCustomPrompt] = useState<string>('');
  const [isChangingHairstyle, setIsChangingHairstyle] = useState(false);

  // Background state
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [timeOfDay, setTimeOfDay] = useState<string>('');
  const [weather, setWeather] = useState<string>('');
  const [backgroundCustomPrompt, setBackgroundCustomPrompt] = useState<string>('');
  const [isChangingBackground, setIsChangingBackground] = useState(false);

  // Outfit state
  const [selectedOutfit, setSelectedOutfit] = useState<string>('');
  const [outfitStyle, setOutfitStyle] = useState<string>('');
  const [outfitColor, setOutfitColor] = useState<string>('');
  const [outfitAccessories, setOutfitAccessories] = useState<string>('');
  const [outfitCustomPrompt, setOutfitCustomPrompt] = useState<string>('');
  const [isChangingOutfit, setIsChangingOutfit] = useState(false);

  // Video generation state
  const [selectedAction, setSelectedAction] = useState<string>('');
  const [videoDuration, setVideoDuration] = useState<number>(5);
  const [videoCustomPrompt, setVideoCustomPrompt] = useState<string>('');
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [currentVideoTaskId, setCurrentVideoTaskId] = useState<string>('');
  const [videoStatus, setVideoStatus] = useState<'idle' | 'pending' | 'processing' | 'completed' | 'failed'>('idle');
  const [videoProgress, setVideoProgress] = useState<number>(0);

  // Gallery state
  const [activeGalleryTab, setActiveGalleryTab] = useState<'all' | 'expressions' | 'hairstyles' | 'backgrounds' | 'outfits' | 'videos'>('all');
  const [selectedImageForPreview, setSelectedImageForPreview] = useState<{url: string; title: string} | null>(null);

  const expressions = ['smile', 'happy', 'sad', 'surprised', 'angry', 'shy', 'excited'];

  const hairstyles = [
    'long-straight', 'short-bob', 'ponytail', 'twin-tails', 'wavy-long',
    'short-pixie', 'curly-medium', 'messy-bun', 'braided', 'half-up'
  ];

  const locations = [
    'beach', 'forest', 'city-street', 'cafe', 'park', 'library',
    'home-interior', 'school', 'office', 'mountain', 'night-city', 'traditional-japanese'
  ];

  const outfits = [
    'school-uniform', 'business-suit', 'casual-t-shirt', 'dress-elegant',
    'sportswear', 'kimono', 'maid-outfit', 'pajamas', 'winter-coat',
    'summer-dress', 'gothic-lolita', 'hoodie-casual', 'swimsuit', 'cosplay', 'party-dress'
  ];

  const videoActions = [
    { value: 'wave', label: '手を振る', prompt: 'waving hand with a friendly smile' },
    { value: 'nod', label: 'うなずく', prompt: 'nodding head gently in agreement' },
    { value: 'laugh', label: '笑う', prompt: 'laughing joyfully with natural movement' },
    { value: 'walk', label: '歩く', prompt: 'walking naturally forward' },
    { value: 'dance', label: '踊る', prompt: 'dancing gracefully with rhythm' },
    { value: 'shy', label: '照れる', prompt: 'showing shy expression with slight head tilt' },
    { value: 'surprised', label: '驚く', prompt: 'reacting with surprise, eyes widening' },
    { value: 'thinking', label: '考える', prompt: 'thinking pose with hand on chin' },
    { value: 'happy-jump', label: '喜んでジャンプ', prompt: 'jumping happily with excitement' },
    { value: 'turn-around', label: '振り向く', prompt: 'turning around to look back' },
  ];

  // Custom prompt presets
  const customPromptPresets = [
    { label: 'キラキラした目', value: 'Add sparkling, glittering eyes with star reflections.' },
    { label: '桜の花びら', value: 'Surround with soft pink cherry blossom petals floating around.' },
    { label: 'リボン付き', value: 'Add a cute hair ribbon and sparkling accessories.' },
    { label: 'ソフト照明', value: 'Add soft warm lighting and romantic atmosphere.' },
    { label: '動きのエフェクト', value: 'Add dynamic motion lines and energetic aura effect.' },
  ];

  // Helper function to safely format dates
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return '日付不明';
      }
      return date.toLocaleDateString('ja-JP');
    } catch {
      return '日付不明';
    }
  };

  useEffect(() => {
    const loadCharacterWithParams = async () => {
      const resolvedParams = await params;
      loadCharacter(resolvedParams.id);
    };
    loadCharacterWithParams();
  }, [params]);

  const loadCharacter = async (id: string) => {
    try {
      const response = await apiClient.getCharacter(id);
      setCharacter(response.character);
    } catch (error) {
      console.error('Failed to load character:', error);
      setError('キャラクターの読み込みに失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateImage = async () => {
    if (!character) return;
    setIsGeneratingImage(true);
    setError('');

    try {
      const response = await apiClient.generateCharacterImage(character.id);
      setCharacter((prev) => prev ? { ...prev, primaryImageUrl: response.imageUrl, imagesGenerated: true } : null);
    } catch (err: any) {
      setError(err.message || '画像生成に失敗しました');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleGeneratePrompt = async () => {
    if (!japaneseInput || !selectedExpression) return;
    setIsGeneratingPrompt(true);
    setError('');

    try {
      const response = await apiClient.generatePrompt(japaneseInput, selectedExpression);
      setCustomPrompt(response.data.prompt);
      setShowAdvanced(true); // 自動的にアドバンスドオプションを開く
      setJapaneseInput(''); // 入力をクリア
    } catch (err: any) {
      setError(err.message || 'プロンプト生成に失敗しました');
    } finally {
      setIsGeneratingPrompt(false);
    }
  };

  const handleGenerateExpression = async () => {
    if (!character || !selectedExpression) return;
    setIsGeneratingExpression(true);
    setError('');

    try {
      const response = await apiClient.generateExpression(
        character.id,
        selectedExpression,
        customPrompt || undefined
      );
      setCharacter((prev) => {
        if (!prev) return null;
        const newExpressionUrls = { ...(prev.expressionUrls || {}), [response.expression]: response.imageUrl };
        return { ...prev, expressionUrls: newExpressionUrls };
      });
      setSelectedExpression('');
      setCustomPrompt('');
    } catch (err: any) {
      setError(err.message || '表情生成に失敗しました');
    } finally {
      setIsGeneratingExpression(false);
    }
  };

  const handleChangeHairstyle = async () => {
    if (!character || !selectedHairstyle) return;
    setIsChangingHairstyle(true);
    setError('');

    try {
      const response = await apiClient.changeHairstyle(character.id, {
        hairstyle: selectedHairstyle,
        hairColor: hairColor || undefined,
        customPrompt: hairstyleCustomPrompt || undefined,
      });
      setCharacter((prev) => {
        if (!prev) return null;
        const newExpressionUrls = { ...(prev.expressionUrls || {}), [response.hairstyle]: response.imageUrl };
        return { ...prev, expressionUrls: newExpressionUrls };
      });
      setSelectedHairstyle('');
      setHairColor('');
      setHairstyleCustomPrompt('');
    } catch (err: any) {
      setError(err.message || '髪型変更に失敗しました');
    } finally {
      setIsChangingHairstyle(false);
    }
  };

  const handleChangeBackground = async () => {
    if (!character || !selectedLocation) return;
    setIsChangingBackground(true);
    setError('');

    try {
      const response = await apiClient.changeBackground(character.id, {
        location: selectedLocation,
        timeOfDay: (timeOfDay as any) || undefined,
        weather: (weather as any) || undefined,
        customPrompt: backgroundCustomPrompt || undefined,
      });
      setCharacter((prev) => {
        if (!prev) return null;
        const newExpressionUrls = { ...(prev.expressionUrls || {}), [response.location]: response.imageUrl };
        return { ...prev, expressionUrls: newExpressionUrls };
      });
      setSelectedLocation('');
      setTimeOfDay('');
      setWeather('');
      setBackgroundCustomPrompt('');
    } catch (err: any) {
      setError(err.message || '背景変更に失敗しました');
    } finally {
      setIsChangingBackground(false);
    }
  };

  const handleChangeOutfit = async () => {
    if (!character || !selectedOutfit) return;
    setIsChangingOutfit(true);
    setError('');

    try {
      const response = await apiClient.changeOutfit(character.id, {
        outfit: selectedOutfit,
        style: (outfitStyle as any) || undefined,
        color: outfitColor || undefined,
        accessories: outfitAccessories || undefined,
        customPrompt: outfitCustomPrompt || undefined,
      });
      setCharacter((prev) => {
        if (!prev) return null;
        const newExpressionUrls = { ...(prev.expressionUrls || {}), [response.outfit]: response.imageUrl };
        return { ...prev, expressionUrls: newExpressionUrls };
      });
      setSelectedOutfit('');
      setOutfitStyle('');
      setOutfitColor('');
      setOutfitAccessories('');
      setOutfitCustomPrompt('');
    } catch (err: any) {
      setError(err.message || '服装変更に失敗しました');
    } finally {
      setIsChangingOutfit(false);
    }
  };

  const handleGenerateVideo = async () => {
    if (!character || !selectedAction) return;
    setIsGeneratingVideo(true);
    setVideoStatus('pending');
    setVideoProgress(0);
    setError('');

    try {
      const actionData = videoActions.find(a => a.value === selectedAction);
      const actionPrompt = actionData ? actionData.prompt : selectedAction;
      const finalPrompt = videoCustomPrompt || actionPrompt;

      const response = await apiClient.generateVideo(character.id, {
        action: finalPrompt,
        duration: videoDuration,
        customPrompt: videoCustomPrompt || undefined,
      });

      setCurrentVideoTaskId(response.taskId);
      setVideoStatus('processing');

      // Start polling for status
      pollVideoStatus(response.taskId);
    } catch (err: any) {
      setError(err.message || '動画生成に失敗しました');
      setVideoStatus('failed');
      setIsGeneratingVideo(false);
    }
  };

  const pollVideoStatus = async (taskId: string) => {
    const maxAttempts = 60; // 5 minutes max (60 * 5 seconds)
    let attempts = 0;

    const poll = async () => {
      try {
        if (!character) return;

        const statusResponse = await apiClient.getVideoStatus(character.id, taskId);
        setVideoProgress(statusResponse.progress || (attempts / maxAttempts) * 100);

        if (statusResponse.status === 'completed' && statusResponse.videoUrl) {
          setVideoStatus('completed');
          setIsGeneratingVideo(false);
          setVideoProgress(100);

          // Update character with video URL
          setCharacter((prev) => {
            if (!prev) return null;
            const newVideoUrls = { ...(prev.expressionUrls || {}), [`video:${selectedAction}`]: statusResponse.videoUrl };
            return { ...prev, expressionUrls: newVideoUrls };
          });

          setSelectedAction('');
          setVideoCustomPrompt('');
          return;
        } else if (statusResponse.status === 'failed') {
          setVideoStatus('failed');
          setIsGeneratingVideo(false);
          setError('動画生成に失敗しました');
          return;
        }

        // Continue polling
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, 5000); // Poll every 5 seconds
        } else {
          setVideoStatus('failed');
          setIsGeneratingVideo(false);
          setError('動画生成がタイムアウトしました');
        }
      } catch (err: any) {
        setVideoStatus('failed');
        setIsGeneratingVideo(false);
        setError(err.message || '動画ステータス取得に失敗しました');
      }
    };

    poll();
  };

  const getFilteredGalleryImages = () => {
    if (!character?.expressionUrls) return [];

    const allImages = Object.entries(character.expressionUrls).map(([key, url]) => {
      let category: 'expression' | 'hairstyle' | 'background' | 'outfit' | 'video' = 'expression';
      let displayTitle = key;

      if (key.startsWith('hairstyle:')) {
        category = 'hairstyle';
        displayTitle = key.replace('hairstyle:', '');
      } else if (key.startsWith('background:')) {
        category = 'background';
        displayTitle = key.replace('background:', '');
      } else if (key.startsWith('outfit:')) {
        category = 'outfit';
        displayTitle = key.replace('outfit:', '');
      } else if (key.startsWith('video:')) {
        category = 'video';
        displayTitle = key.replace('video:', '');
      }

      return {
        key,
        url: url as string,
        category,
        displayTitle,
      };
    });

    if (activeGalleryTab === 'all') return allImages;
    if (activeGalleryTab === 'expressions') return allImages.filter(img => img.category === 'expression');
    if (activeGalleryTab === 'hairstyles') return allImages.filter(img => img.category === 'hairstyle');
    if (activeGalleryTab === 'backgrounds') return allImages.filter(img => img.category === 'background');
    if (activeGalleryTab === 'outfits') return allImages.filter(img => img.category === 'outfit');
    if (activeGalleryTab === 'videos') return allImages.filter(img => img.category === 'video');

    return allImages;
  };

  const getGalleryTabCounts = () => {
    if (!character?.expressionUrls) return { all: 0, expressions: 0, hairstyles: 0, backgrounds: 0, outfits: 0, videos: 0 };

    const entries = Object.entries(character.expressionUrls);
    return {
      all: entries.length,
      expressions: entries.filter(([key]) => !key.includes(':')).length,
      hairstyles: entries.filter(([key]) => key.startsWith('hairstyle:')).length,
      backgrounds: entries.filter(([key]) => key.startsWith('background:')).length,
      outfits: entries.filter(([key]) => key.startsWith('outfit:')).length,
      videos: entries.filter(([key]) => key.startsWith('video:')).length,
    };
  };

  const handleDeleteImage = async (imageKey: string, imageTitle: string) => {
    if (!character) return;
    if (!confirm(`「${imageTitle}」を削除してもよろしいですか？`)) return;

    setError('');

    try {
      await apiClient.deleteImage(character.id, imageKey);

      // Update character state to remove the deleted image
      setCharacter((prev) => {
        if (!prev) return null;
        const newExpressionUrls = { ...(prev.expressionUrls || {}) };
        delete newExpressionUrls[imageKey];
        return { ...prev, expressionUrls: newExpressionUrls };
      });
    } catch (err: any) {
      setError(err.message || '画像の削除に失敗しました');
    }
  };

  const handleDelete = async () => {
    if (!character) return;
    if (!confirm(`${character.name}を削除してもよろしいですか？`)) return;

    try {
      await apiClient.deleteCharacter(character.id);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || '削除に失敗しました');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (!character) {
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
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-gray-600 hover:text-gray-900"
          >
            ← ダッシュボードに戻る
          </button>
          <div className="flex space-x-4">
            <button
              onClick={() => router.push(`/chat/${character.id}`)}
              className="px-6 py-2 bg-pink-600 text-white rounded-lg font-medium hover:bg-pink-700 transition-colors"
            >
              チャットを開始
            </button>
            <button
              onClick={handleDelete}
              className="px-6 py-2 border border-red-600 text-red-600 rounded-lg font-medium hover:bg-red-50 transition-colors"
            >
              削除
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Image */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden sticky top-8">
              {character.primaryImageUrl ? (
                <img
                  src={character.primaryImageUrl}
                  alt={character.name}
                  className="w-full aspect-[3/4] object-cover"
                />
              ) : (
                <div className="w-full aspect-[3/4] bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-8xl mb-4">👤</div>
                    <p className="text-gray-600 mb-4">画像未生成</p>
                  </div>
                </div>
              )}
              <div className="p-6">
                <button
                  onClick={handleGenerateImage}
                  disabled={isGeneratingImage}
                  className="w-full px-4 py-3 bg-pink-600 text-white rounded-lg font-medium hover:bg-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGeneratingImage ? '生成中...' : character.imagesGenerated ? '画像を再生成' : '画像を生成'}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Card */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">{character.name}</h2>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 mb-2">基本情報</h3>
                  <div className="space-y-2">
                    <p><span className="font-medium">年齢:</span> {character.age}歳</p>
                    <p><span className="font-medium">誕生日:</span> {formatDate(character.birthday)}</p>
                    <p><span className="font-medium">職業:</span> {character.occupation}</p>
                    <p><span className="font-medium">好きな食べ物:</span> {character.favoriteFood}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-500 mb-2">統計</h3>
                  <div className="space-y-2">
                    <p><span className="font-medium">会話数:</span> {character.totalConversations}回</p>
                    <p><span className="font-medium">メッセージ数:</span> {character.totalMessages}通</p>
                    <p><span className="font-medium">デート回数:</span> {character.datesCount}回</p>
                    <p><span className="font-medium">最終交流:</span> {formatDate(character.lastInteraction)}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t">
                <h3 className="text-sm font-semibold text-gray-500 mb-2">自己紹介</h3>
                <p className="text-gray-700">{character.bio}</p>
              </div>

              <div className="mt-6 pt-6 border-t">
                <h3 className="text-sm font-semibold text-gray-500 mb-2">趣味</h3>
                <div className="flex flex-wrap gap-2">
                  {character.hobbies.split(',').map((hobby, i) => (
                    <span key={i} className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-sm">
                      {hobby.trim()}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Appearance Card */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">外見</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">スタイル</p>
                  <p className="font-medium">{character.appearanceStyle === 'anime' ? 'アニメ' : character.appearanceStyle === 'realistic' ? 'リアル' : 'マンガ'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">髪色</p>
                  <p className="font-medium">{character.hairColor}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">髪型</p>
                  <p className="font-medium">{character.hairStyle}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">瞳の色</p>
                  <p className="font-medium">{character.eyeColor}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">身長</p>
                  <p className="font-medium">{character.height}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">体型</p>
                  <p className="font-medium">{character.bodyType}</p>
                </div>
              </div>
            </div>

            {/* Personality Card */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">性格</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 mb-2">性格タイプ</p>
                  <span className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full font-medium">
                    {character.personalityArchetype === 'gentle' && '優しい'}
                    {character.personalityArchetype === 'cheerful' && '明るい'}
                    {character.personalityArchetype === 'cool' && 'クール'}
                    {character.personalityArchetype === 'shy' && '恥ずかしがり屋'}
                    {character.personalityArchetype === 'energetic' && '元気'}
                    {character.personalityArchetype === 'mysterious' && 'ミステリアス'}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-2">特徴</p>
                  <div className="flex flex-wrap gap-2">
                    {character.traits.split(',').map((trait, i) => (
                      <span key={i} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                        {trait.trim()}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">話し方</p>
                    <p className="font-medium">{character.speechStyle}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">感情表現</p>
                    <p className="font-medium">{character.emotionalTendency}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Expression Generation */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">表情生成</h3>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  生成する表情を選択
                </label>
                <select
                  value={selectedExpression}
                  onChange={(e) => setSelectedExpression(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                >
                  <option value="">表情を選択...</option>
                  {expressions.map((exp) => (
                    <option key={exp} value={exp}>
                      {exp === 'smile' && '笑顔'}
                      {exp === 'happy' && '嬉しい'}
                      {exp === 'sad' && '悲しい'}
                      {exp === 'surprised' && '驚き'}
                      {exp === 'angry' && '怒り'}
                      {exp === 'shy' && '照れ'}
                      {exp === 'excited' && '興奮'}
                    </option>
                  ))}
                </select>
              </div>

              {/* AI-Powered Japanese Input */}
              <div className="mb-4 space-y-3 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-purple-200">
                <label className="block text-sm font-medium text-gray-700 flex items-center">
                  <span className="mr-2">🤖</span>
                  AI自動生成（日本語で入力）
                </label>
                <p className="text-xs text-gray-600 mb-2">
                  日本語で要望を入力すると、AIが英語プロンプトに自動変換します
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={japaneseInput}
                    onChange={(e) => setJapaneseInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && japaneseInput && selectedExpression) {
                        handleGeneratePrompt();
                      }
                    }}
                    placeholder="例: キラキラした目と桜の花びら"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                  />
                  <button
                    onClick={handleGeneratePrompt}
                    disabled={!japaneseInput || !selectedExpression || isGeneratingPrompt}
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                  >
                    {isGeneratingPrompt ? '生成中...' : 'AI生成'}
                  </button>
                </div>
                {!selectedExpression && japaneseInput && (
                  <p className="text-xs text-orange-600">
                    ⚠️ 先に表情を選択してください
                  </p>
                )}
              </div>

              {/* Preset Buttons - Always Visible */}
              <div className="mb-4 space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  クイックプリセット
                </label>
                <div className="flex flex-wrap gap-2">
                  {customPromptPresets.map((preset) => (
                    <button
                      key={preset.label}
                      onClick={() => {
                        setCustomPrompt(preset.value);
                        setShowAdvanced(true); // 自動的にアドバンスドオプションを開く
                      }}
                      className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                        customPrompt === preset.value
                          ? 'bg-purple-600 text-white'
                          : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Advanced Options Toggle */}
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="mb-3 text-sm text-purple-600 hover:text-purple-700 flex items-center font-medium"
              >
                {showAdvanced ? '▼' : '▶'} カスタムプロンプトを編集
              </button>

              {/* Custom Prompt Section */}
              {showAdvanced && (
                <div className="mb-4 space-y-3 border-t pt-4">
                  <label className="block text-sm font-medium text-gray-700">
                    カスタムプロンプト
                  </label>
                  <p className="text-xs text-gray-500 mb-2">
                    プリセットを編集するか、独自のプロンプトを入力してください
                  </p>

                  {/* Custom Prompt Input */}
                  <div className="relative">
                    <textarea
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      placeholder="例: Add sparkling eyes with star reflections and cherry blossom petals"
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                    />
                    {customPrompt && (
                      <button
                        onClick={() => setCustomPrompt('')}
                        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-xs bg-white px-2 py-1 rounded"
                      >
                        クリア
                      </button>
                    )}
                  </div>

                  {customPrompt && (
                    <div className="p-3 bg-purple-50 rounded-lg border border-purple-100">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs text-gray-600 font-medium">プレビュー:</p>
                        <span className="text-xs text-purple-600">{customPrompt.length} 文字</span>
                      </div>
                      <p className="text-sm text-gray-800">{customPrompt}</p>
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={handleGenerateExpression}
                disabled={!selectedExpression || isGeneratingExpression}
                className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGeneratingExpression ? '生成中...' : customPrompt ? 'カスタム表情を生成' : '表情を生成'}
              </button>

              {character.expressionUrls && Object.keys(character.expressionUrls).length > 0 && (
                <div className="mt-6">
                  <h4 className="text-sm font-semibold text-gray-500 mb-3">生成済み表情</h4>
                  <div className="grid grid-cols-3 gap-3">
                    {Object.entries(character.expressionUrls).map(([exp, url]) => (
                      <div key={exp} className="relative group">
                        <img
                          src={url as string}
                          alt={exp}
                          className="w-full aspect-square object-cover rounded-lg"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                          <p className="text-white text-sm font-medium">{exp}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Hairstyle Change */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">髪型変更</h3>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  髪型を選択
                </label>
                <select
                  value={selectedHairstyle}
                  onChange={(e) => setSelectedHairstyle(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                >
                  <option value="">髪型を選択...</option>
                  <option value="long-straight">ロングストレート</option>
                  <option value="short-bob">ショートボブ</option>
                  <option value="ponytail">ポニーテール</option>
                  <option value="twin-tails">ツインテール</option>
                  <option value="wavy-long">ウェーブロング</option>
                  <option value="short-pixie">ショートピクシー</option>
                  <option value="curly-medium">カーリーミディアム</option>
                  <option value="messy-bun">メッシーバン</option>
                  <option value="braided">編み込み</option>
                  <option value="half-up">ハーフアップ</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  髪色（オプション）
                </label>
                <input
                  type="text"
                  value={hairColor}
                  onChange={(e) => setHairColor(e.target.value)}
                  placeholder="例: 茶色、金色、ピンク"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  カスタムプロンプト（オプション）
                </label>
                <textarea
                  value={hairstyleCustomPrompt}
                  onChange={(e) => setHairstyleCustomPrompt(e.target.value)}
                  placeholder="追加の詳細指定があれば入力してください"
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm"
                />
              </div>

              <button
                onClick={handleChangeHairstyle}
                disabled={!selectedHairstyle || isChangingHairstyle}
                className="w-full px-4 py-3 bg-pink-600 text-white rounded-lg font-medium hover:bg-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isChangingHairstyle ? '変更中...' : '髪型を変更'}
              </button>
            </div>

            {/* Background Change */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">背景変更</h3>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  場所を選択
                </label>
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">場所を選択...</option>
                  <option value="beach">ビーチ</option>
                  <option value="forest">森</option>
                  <option value="city-street">都会の街並み</option>
                  <option value="cafe">カフェ</option>
                  <option value="park">公園</option>
                  <option value="library">図書館</option>
                  <option value="home-interior">室内</option>
                  <option value="school">学校</option>
                  <option value="office">オフィス</option>
                  <option value="mountain">山</option>
                  <option value="night-city">夜の街</option>
                  <option value="traditional-japanese">和風</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    時間帯（オプション）
                  </label>
                  <select
                    value={timeOfDay}
                    onChange={(e) => setTimeOfDay(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">未指定</option>
                    <option value="morning">朝</option>
                    <option value="afternoon">昼</option>
                    <option value="evening">夕方</option>
                    <option value="night">夜</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    天気（オプション）
                  </label>
                  <select
                    value={weather}
                    onChange={(e) => setWeather(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">未指定</option>
                    <option value="sunny">晴れ</option>
                    <option value="cloudy">曇り</option>
                    <option value="rainy">雨</option>
                    <option value="snowy">雪</option>
                  </select>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  カスタムプロンプト（オプション）
                </label>
                <textarea
                  value={backgroundCustomPrompt}
                  onChange={(e) => setBackgroundCustomPrompt(e.target.value)}
                  placeholder="追加の詳細指定があれば入力してください"
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>

              <button
                onClick={handleChangeBackground}
                disabled={!selectedLocation || isChangingBackground}
                className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isChangingBackground ? '変更中...' : '背景を変更'}
              </button>
            </div>

            {/* Outfit Change */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">服装変更</h3>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  服装を選択
                </label>
                <select
                  value={selectedOutfit}
                  onChange={(e) => setSelectedOutfit(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">服装を選択...</option>
                  <option value="school-uniform">学生服</option>
                  <option value="business-suit">ビジネススーツ</option>
                  <option value="casual-t-shirt">カジュアルTシャツ</option>
                  <option value="dress-elegant">エレガントドレス</option>
                  <option value="sportswear">スポーツウェア</option>
                  <option value="kimono">着物</option>
                  <option value="maid-outfit">メイド服</option>
                  <option value="pajamas">パジャマ</option>
                  <option value="winter-coat">冬コート</option>
                  <option value="summer-dress">夏ドレス</option>
                  <option value="gothic-lolita">ゴシックロリータ</option>
                  <option value="hoodie-casual">パーカー</option>
                  <option value="swimsuit">水着</option>
                  <option value="cosplay">コスプレ</option>
                  <option value="party-dress">パーティードレス</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    スタイル（オプション）
                  </label>
                  <select
                    value={outfitStyle}
                    onChange={(e) => setOutfitStyle(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">未指定</option>
                    <option value="casual">カジュアル</option>
                    <option value="formal">フォーマル</option>
                    <option value="sporty">スポーティ</option>
                    <option value="elegant">エレガント</option>
                    <option value="cute">キュート</option>
                    <option value="cool">クール</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    色（オプション）
                  </label>
                  <input
                    type="text"
                    value={outfitColor}
                    onChange={(e) => setOutfitColor(e.target.value)}
                    placeholder="例: 赤、青、白"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  アクセサリー（オプション）
                </label>
                <input
                  type="text"
                  value={outfitAccessories}
                  onChange={(e) => setOutfitAccessories(e.target.value)}
                  placeholder="例: 帽子、リボン、ネックレス"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  カスタムプロンプト（オプション）
                </label>
                <textarea
                  value={outfitCustomPrompt}
                  onChange={(e) => setOutfitCustomPrompt(e.target.value)}
                  placeholder="追加の詳細指定があれば入力してください"
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                />
              </div>

              <button
                onClick={handleChangeOutfit}
                disabled={!selectedOutfit || isChangingOutfit}
                className="w-full px-4 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isChangingOutfit ? '変更中...' : '服装を変更'}
              </button>
            </div>

            {/* Video Generation */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">動画生成 (I2V)</h3>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  アクションを選択
                </label>
                <select
                  value={selectedAction}
                  onChange={(e) => setSelectedAction(e.target.value)}
                  disabled={isGeneratingVideo}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50"
                >
                  <option value="">アクションを選択...</option>
                  {videoActions.map((action) => (
                    <option key={action.value} value={action.value}>
                      {action.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  動画の長さ: {videoDuration}秒
                </label>
                <input
                  type="range"
                  min="3"
                  max="10"
                  step="1"
                  value={videoDuration}
                  onChange={(e) => setVideoDuration(Number(e.target.value))}
                  disabled={isGeneratingVideo}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>3秒</span>
                  <span>10秒</span>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  カスタムプロンプト（オプション）
                </label>
                <textarea
                  value={videoCustomPrompt}
                  onChange={(e) => setVideoCustomPrompt(e.target.value)}
                  disabled={isGeneratingVideo}
                  placeholder="追加の詳細指定があれば入力してください"
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm disabled:opacity-50"
                />
              </div>

              {/* Progress bar */}
              {isGeneratingVideo && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      {videoStatus === 'pending' && '初期化中...'}
                      {videoStatus === 'processing' && '生成中...'}
                    </span>
                    <span className="text-sm text-gray-600">{Math.round(videoProgress)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500"
                      style={{ width: `${videoProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    動画生成には1〜3分かかる場合があります
                  </p>
                </div>
              )}

              {/* Status messages */}
              {videoStatus === 'completed' && !isGeneratingVideo && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800 flex items-center">
                    <span className="mr-2">✅</span>
                    動画生成が完了しました！
                  </p>
                </div>
              )}

              {videoStatus === 'failed' && !isGeneratingVideo && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800 flex items-center">
                    <span className="mr-2">❌</span>
                    動画生成に失敗しました
                  </p>
                </div>
              )}

              <button
                onClick={handleGenerateVideo}
                disabled={!selectedAction || isGeneratingVideo}
                className="w-full px-4 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGeneratingVideo ? '生成中...' : '動画を生成'}
              </button>

              {/* Generated videos gallery */}
              {character.expressionUrls && Object.entries(character.expressionUrls).filter(([key]) => key.startsWith('video:')).length > 0 && (
                <div className="mt-6">
                  <h4 className="text-sm font-semibold text-gray-500 mb-3">生成済み動画</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(character.expressionUrls)
                      .filter(([key]) => key.startsWith('video:'))
                      .map(([videoKey, url]) => (
                        <div key={videoKey} className="relative group">
                          <video
                            src={url as string}
                            controls
                            className="w-full aspect-video object-cover rounded-lg"
                          />
                          <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                            {videoKey.replace('video:', '')}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>

            {/* Unified Gallery */}
            {character.expressionUrls && Object.keys(character.expressionUrls).length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">生成画像ギャラリー</h3>

                {/* Tab Navigation */}
                <div className="mb-6 border-b border-gray-200">
                  <nav className="flex flex-wrap -mb-px space-x-2">
                    {[
                      { key: 'all', label: '全て', count: getGalleryTabCounts().all },
                      { key: 'expressions', label: '表情', count: getGalleryTabCounts().expressions },
                      { key: 'hairstyles', label: '髪型', count: getGalleryTabCounts().hairstyles },
                      { key: 'backgrounds', label: '背景', count: getGalleryTabCounts().backgrounds },
                      { key: 'outfits', label: '服装', count: getGalleryTabCounts().outfits },
                      { key: 'videos', label: '動画', count: getGalleryTabCounts().videos },
                    ].map((tab) => (
                      <button
                        key={tab.key}
                        onClick={() => setActiveGalleryTab(tab.key as any)}
                        className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                          activeGalleryTab === tab.key
                            ? 'border-b-2 border-purple-600 text-purple-600'
                            : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        {tab.label}
                        {tab.count > 0 && (
                          <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                            activeGalleryTab === tab.key
                              ? 'bg-purple-100 text-purple-600'
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {tab.count}
                          </span>
                        )}
                      </button>
                    ))}
                  </nav>
                </div>

                {/* Gallery Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {getFilteredGalleryImages().map((item) => (
                    <div key={item.key} className="relative group">
                      {item.category === 'video' ? (
                        <video
                          src={item.url}
                          controls
                          className="w-full aspect-square object-cover rounded-lg"
                        />
                      ) : (
                        <img
                          src={item.url}
                          alt={item.displayTitle}
                          onClick={() => setSelectedImageForPreview({ url: item.url, title: item.displayTitle })}
                          className="w-full aspect-square object-cover rounded-lg cursor-pointer transition-transform group-hover:scale-105"
                        />
                      )}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-opacity rounded-lg flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <p className="text-white text-sm font-medium text-center px-2">
                            {item.displayTitle}
                          </p>
                        </div>
                      </div>
                      {/* Category Badge */}
                      <div className={`absolute top-2 left-2 px-2 py-1 text-xs font-medium rounded ${
                        item.category === 'expression' ? 'bg-purple-500 text-white' :
                        item.category === 'hairstyle' ? 'bg-pink-500 text-white' :
                        item.category === 'background' ? 'bg-blue-500 text-white' :
                        item.category === 'outfit' ? 'bg-green-500 text-white' :
                        'bg-indigo-500 text-white'
                      }`}>
                        {item.category === 'expression' && '表情'}
                        {item.category === 'hairstyle' && '髪型'}
                        {item.category === 'background' && '背景'}
                        {item.category === 'outfit' && '服装'}
                        {item.category === 'video' && '動画'}
                      </div>
                      {/* Delete Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteImage(item.key, item.displayTitle);
                        }}
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-red-600 hover:bg-red-700 text-white rounded-full p-2 shadow-lg"
                        title="削除"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>

                {/* Empty State */}
                {getFilteredGalleryImages().length === 0 && (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🖼️</div>
                    <p className="text-gray-600">
                      {activeGalleryTab === 'all' && 'まだ画像が生成されていません'}
                      {activeGalleryTab === 'expressions' && 'まだ表情が生成されていません'}
                      {activeGalleryTab === 'hairstyles' && 'まだ髪型が生成されていません'}
                      {activeGalleryTab === 'backgrounds' && 'まだ背景が生成されていません'}
                      {activeGalleryTab === 'outfits' && 'まだ服装が生成されていません'}
                      {activeGalleryTab === 'videos' && 'まだ動画が生成されていません'}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Image Preview Modal */}
            {selectedImageForPreview && (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4"
                onClick={() => setSelectedImageForPreview(null)}
              >
                <div className="relative max-w-4xl max-h-full">
                  <button
                    onClick={() => setSelectedImageForPreview(null)}
                    className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-75 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  <img
                    src={selectedImageForPreview.url}
                    alt={selectedImageForPreview.title}
                    className="max-w-full max-h-[90vh] object-contain rounded-lg"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-75 text-white px-4 py-2 rounded-lg">
                    {selectedImageForPreview.title}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}