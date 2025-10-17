'use client';

import { useState } from 'react';
import { apiClient } from '@/lib/api-client';
import Link from 'next/link';

interface Character {
  id: string;
  name: string;
  age: number;
  occupation: string;
  bio: string;
  imageUrl?: string;
  stageProgress: {
    currentStage: string;
    affectionLevel: number;
  };
  createdAt: string;
}

interface CharacterCardProps {
  character: Character;
  onDelete: (id: string) => void;
}

export function CharacterCard({ character, onDelete }: CharacterCardProps) {
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleGenerateImage = async () => {
    setIsGeneratingImage(true);
    try {
      await apiClient.generateCharacterImage(character.id);
      // Refresh the page to show the new image
      window.location.reload();
    } catch (error) {
      console.error('Failed to generate image:', error);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`「${character.name}」を削除しますか？`)) return;
    
    setIsDeleting(true);
    try {
      await apiClient.deleteCharacter(character.id);
      onDelete(character.id);
    } catch (error) {
      console.error('Failed to delete character:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const getStageLabel = (stage: string) => {
    const stageLabels: Record<string, string> = {
      first_meet: '出会い',
      dating: 'デート期間',
      relationship: '交際中',
      proposal: 'プロポーズ',
      marriage: '結婚生活',
    };
    return stageLabels[stage] || stage;
  };

  const getAffectionColor = (level: number) => {
    if (level >= 80) return 'text-red-500';
    if (level >= 50) return 'text-pink-500';
    if (level >= 20) return 'text-blue-500';
    return 'text-gray-500';
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {/* Character Image */}
      <div className="aspect-square bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">
        {character.imageUrl ? (
          <img
            src={character.imageUrl}
            alt={character.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-center text-gray-500">
            <div className="text-4xl mb-2">👤</div>
            <p className="text-sm">画像未生成</p>
            <button
              onClick={handleGenerateImage}
              disabled={isGeneratingImage}
              className="mt-2 px-3 py-1 bg-pink-500 text-white text-xs rounded hover:bg-pink-600 disabled:opacity-50"
            >
              {isGeneratingImage ? '生成中...' : '画像生成'}
            </button>
          </div>
        )}
      </div>

      {/* Character Info */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg text-gray-900">{character.name}</h3>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
          >
            {isDeleting ? '削除中...' : '🗑️'}
          </button>
        </div>

        <div className="space-y-1 text-sm text-gray-600 mb-3">
          <p>{character.age}歳 • {character.occupation}</p>
          <p className="line-clamp-2">{character.bio}</p>
        </div>

        {/* Progress Info */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500">現在のステージ</span>
            <span className="text-xs font-medium text-pink-600">
              {getStageLabel(character.stageProgress.currentStage)}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500">好感度</span>
            <span className={`text-xs font-medium ${getAffectionColor(character.stageProgress.affectionLevel)}`}>
              {character.stageProgress.affectionLevel}%
            </span>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                character.stageProgress.affectionLevel >= 80
                  ? 'bg-red-500'
                  : character.stageProgress.affectionLevel >= 50
                  ? 'bg-pink-500'
                  : character.stageProgress.affectionLevel >= 20
                  ? 'bg-blue-500'
                  : 'bg-gray-400'
              }`}
              style={{ width: `${character.stageProgress.affectionLevel}%` }}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 space-y-2">
          <Link
            href={`/chat/${character.id}`}
            className="block w-full text-center py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
          >
            チャットを開始
          </Link>
          
          <Link
            href={`/character/${character.id}/edit`}
            className="block w-full text-center py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            編集
          </Link>
        </div>
      </div>
    </div>
  );
}
