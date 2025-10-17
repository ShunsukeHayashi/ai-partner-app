/**
 * API Client for AI Partner App
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public response?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

class APIClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string = API_URL) {
    this.baseURL = baseURL;

    // Load token from localStorage on client side
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('token');
    }
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const url = `${this.baseURL}${endpoint}`;

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new APIError(
          error.error?.message || 'Request failed',
          response.status,
          error
        );
      }

      return response.json();
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError('Network error', 0);
    }
  }

  // Auth endpoints
  async register(data: {
    email: string;
    username: string;
    password: string;
  }) {
    return this.request<{
      user: any;
      token: string;
    }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(data: { email: string; password: string }) {
    return this.request<{
      user: any;
      token: string;
    }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async logout() {
    return this.request('/api/auth/logout', {
      method: 'POST',
    });
  }

  async getMe() {
    return this.request<{ user: any }>('/api/auth/me');
  }

  // Character endpoints
  async createCharacter(data: any) {
    return this.request<{ character: any }>('/api/characters', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async generateCharacterDetails(data: { name: string; age: number; description: string }) {
    return this.request<{ character: any; generatedDetails: boolean }>(
      '/api/characters/generate-details',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  }

  async generateCharacterFromImage(data: {
    imageData: string; // Base64 encoded image
    mimeType?: 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp';
    name?: string;
    age?: number;
    description?: string;
  }) {
    return this.request<{
      character: any;
      generatedFromImage: boolean;
      analysis: {
        appearance: any;
        personality: string;
      };
    }>(
      '/api/characters/generate-from-image',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  }

  async getCharacters() {
    return this.request<{ characters: any[] }>('/api/characters');
  }

  async getCharacter(id: string) {
    return this.request<{ character: any }>(`/api/characters/${id}`);
  }

  async generateCharacterImage(characterId: string) {
    return this.request<{ imageUrl: string; message: string }>(
      `/api/characters/${characterId}/generate-image`,
      {
        method: 'POST',
      }
    );
  }

  async generateExpression(characterId: string, expression: string, customPrompt?: string) {
    return this.request<{
      expression: string;
      imageUrl: string;
      message: string;
      usedCustomPrompt?: boolean;
    }>(
      `/api/characters/${characterId}/generate-expression`,
      {
        method: 'POST',
        body: JSON.stringify({ expression, customPrompt }),
      }
    );
  }

  async generatePrompt(userInput: string, expression: string) {
    return this.request<{
      success: boolean;
      data: {
        prompt: string;
        originalInput: string;
      };
    }>(
      '/api/test/generate-prompt',
      {
        method: 'POST',
        body: JSON.stringify({ userInput, expression }),
      }
    );
  }

  async changeHairstyle(
    characterId: string,
    data: {
      hairstyle: string;
      hairColor?: string;
      customPrompt?: string;
    }
  ) {
    return this.request<{
      hairstyle: string;
      imageUrl: string;
      message: string;
      usedCustomPrompt?: boolean;
    }>(
      `/api/characters/${characterId}/change-hairstyle`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  }

  async changeBackground(
    characterId: string,
    data: {
      location: string;
      timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night';
      weather?: 'sunny' | 'cloudy' | 'rainy' | 'snowy';
      customPrompt?: string;
    }
  ) {
    return this.request<{
      location: string;
      imageUrl: string;
      message: string;
      usedCustomPrompt?: boolean;
    }>(
      `/api/characters/${characterId}/change-background`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  }

  async changeOutfit(
    characterId: string,
    data: {
      outfit: string;
      style?: 'casual' | 'formal' | 'sporty' | 'elegant' | 'cute' | 'cool';
      color?: string;
      accessories?: string;
      customPrompt?: string;
    }
  ) {
    return this.request<{
      outfit: string;
      imageUrl: string;
      message: string;
      usedCustomPrompt?: boolean;
    }>(
      `/api/characters/${characterId}/change-outfit`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  }

  async generateVideo(
    characterId: string,
    data: {
      action: string;
      duration?: number;
      customPrompt?: string;
    }
  ) {
    return this.request<{
      taskId: string;
      message: string;
    }>(
      `/api/characters/${characterId}/generate-video`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  }

  async getVideoStatus(characterId: string, taskId: string) {
    return this.request<{
      taskId: string;
      status: 'pending' | 'processing' | 'completed' | 'failed';
      videoUrl?: string;
      progress?: number;
    }>(
      `/api/characters/${characterId}/video-status/${taskId}`
    );
  }

  async deleteImage(characterId: string, imageKey: string) {
    return this.request<{ message: string; deletedKey: string }>(
      `/api/characters/${characterId}/image/${encodeURIComponent(imageKey)}`,
      {
        method: 'DELETE',
      }
    );
  }

  async deleteCharacter(id: string) {
    return this.request<{ message: string }>(`/api/characters/${id}`, {
      method: 'DELETE',
    });
  }

  // Conversation endpoints
  async createConversation(characterId: string) {
    return this.request<{ conversation: any }>('/api/conversations', {
      method: 'POST',
      body: JSON.stringify({ characterId }),
    });
  }

  async getConversation(id: string) {
    return this.request<{ conversation: any }>(`/api/conversations/${id}`);
  }

  async sendMessage(conversationId: string, content: string, type: 'text' | 'voice' = 'text') {
    return this.request<{
      userMessage: any;
      characterMessage: any;
      affectionChange: number;
    }>(`/api/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content, type }),
    });
  }

  async getMessages(conversationId: string, limit = 50, offset = 0) {
    return this.request<{ messages: any[] }>(
      `/api/conversations/${conversationId}/messages?limit=${limit}&offset=${offset}`
    );
  }

  async getConversations() {
    return this.request<{ conversations: any[] }>('/api/conversations');
  }
}

export const apiClient = new APIClient();
