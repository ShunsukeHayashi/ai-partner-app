'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';

export function CharacterGrid() {
  const router = useRouter();
  const [characters, setCharacters] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCharacters();
  }, []);

  const loadCharacters = async () => {
    try {
      const response = await apiClient.getCharacters();
      setCharacters(response.characters);
    } catch (error) {
      console.error('Failed to load characters:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">あなたのパートナー</h2>
        <button
          onClick={() => router.push('/character/create')}
          className="px-4 py-2 bg-pink-600 text-white rounded-lg font-medium hover:bg-pink-700 transition-colors"
        >
          + 新しいパートナーを作成
        </button>
      </div>

      {characters.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm">
          <div className="text-6xl mb-4">💕</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            まだパートナーがいません
          </h3>
          <p className="text-gray-600 mb-6">
            理想のパートナーを作成して、恋愛体験を始めましょう
          </p>
          <button
            onClick={() => router.push('/character/create')}
            className="px-6 py-3 bg-pink-600 text-white rounded-lg font-medium hover:bg-pink-700 transition-colors"
          >
            パートナーを作成する
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {characters.map((character) => (
            <div
              key={character.id}
              onClick={() => router.push(`/character/${character.id}`)}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden"
            >
              {character.primaryImageUrl ? (
                <img
                  src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/${character.primaryImageUrl}`}
                  alt={character.name}
                  className="w-full h-64 object-cover"
                />
              ) : (
                <div className="w-full h-64 bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">
                  <div className="text-6xl">👤</div>
                </div>
              )}
              
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {character.name}
                </h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>
                    <span className="font-medium">年齢:</span> {character.age}歳
                  </p>
                  <p>
                    <span className="font-medium">職業:</span> {character.occupation}
                  </p>
                  <p className="line-clamp-2">{character.bio}</p>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">
                      会話: {character.totalConversations}回
                    </span>
                    <span className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full font-medium">
                      {character.personalityArchetype === 'gentle' && '優しい'}
                      {character.personalityArchetype === 'cheerful' && '明るい'}
                      {character.personalityArchetype === 'cool' && 'クール'}
                      {character.personalityArchetype === 'shy' && '恥ずかしがり屋'}
                      {character.personalityArchetype === 'energetic' && '元気'}
                      {character.personalityArchetype === 'mysterious' && 'ミステリアス'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}