/**
 * Legacy BytePlus API Compatibility Layer
 *
 * This file provides backward compatibility for the old BytePlus API
 * that was refactored from 4 files (t2i, i2i, i2v, t2v) to 2 files (text-to-image, image-to-video).
 *
 * It wraps the new simplified API with the old helper methods.
 */

import { initBytePlus, getBytePlus } from './index';
import type { TextToImageResponse, ImageToVideoResponse, VideoStatusResponse } from './types';

// Initialize BytePlus SDK on first use
let initialized = false;
function ensureInitialized() {
  if (!initialized) {
    const apiKey = process.env.BYTEPLUS_API_KEY || '';
    if (!apiKey) {
      throw new Error('BYTEPLUS_API_KEY environment variable is not set');
    }
    initBytePlus(apiKey);
    initialized = true;
  }
  return getBytePlus();
}

/**
 * Legacy Text-to-Image API (bytePlusT2I)
 */
export const bytePlusT2I = {
  async generate(params: {
    prompt: string;
    size?: string;
    watermark?: boolean;
  }): Promise<{ imageUrl: string }> {
    const sdk = ensureInitialized();

    // Parse size parameter (e.g., "1024x1024" or "2k")
    let width = 1024;
    let height = 1024;

    if (params.size) {
      if (params.size === '2k') {
        width = 2048;
        height = 2048;
      } else if (params.size.includes('x')) {
        const [w, h] = params.size.split('x').map(Number);
        width = w;
        height = h;
      }
    }

    const response = await sdk.textToImage.generate({
      prompt: params.prompt,
      width,
      height,
      watermark: params.watermark,
    });

    return {
      imageUrl: response.data[0].url,
    };
  },
};

/**
 * Legacy Image-to-Image API (bytePlusI2I)
 */
export const bytePlusI2I = {
  async generate(params: {
    prompt: string;
    imageUrl?: string | string[];
    imageData?: string;
    mimeType?: string;
    size?: string;
    watermark?: boolean;
    strength?: number;
  }): Promise<{ imageUrl: string; imageUrls?: string[] }> {
    const sdk = ensureInitialized();

    // Parse size parameter
    let width = 1024;
    let height = 1024;

    if (params.size) {
      if (params.size === '2k') {
        width = 2048;
        height = 2048;
      } else if (typeof params.size === 'string' && params.size.includes('x')) {
        const [w, h] = params.size.split('x').map(Number);
        width = w;
        height = h;
      }
    }

    // Prepare request with image data for I2I
    const request: any = {
      prompt: params.prompt,
      width,
      height,
      watermark: params.watermark !== undefined ? params.watermark : true,
    };

    // Add image parameter for I2I (Image-to-Image)
    if (params.imageUrl) {
      // If imageUrl is an array, use the first one
      request.imageUrl = Array.isArray(params.imageUrl) ? params.imageUrl[0] : params.imageUrl;
    } else if (params.imageData && params.mimeType) {
      request.imageData = params.imageData;
      request.mimeType = params.mimeType;
    }

    const response = await sdk.textToImage.generate(request);

    // Debug: Log response structure
    console.log('[bytePlusI2I.generate] API Response:', JSON.stringify(response, null, 2));

    // Check if response has expected structure (new format: data is array directly)
    if (!response || !response.data || !Array.isArray(response.data) || response.data.length === 0) {
      throw new Error(`Invalid API response structure: ${JSON.stringify(response)}`);
    }

    return {
      imageUrl: response.data[0].url,
      imageUrls: response.data.map(img => img.url),
    };
  },

  async changeExpression(params: {
    sourceImageUrl: string;
    expression: string;
    customPrompt?: string;
  }): Promise<{ imageUrl: string }> {
    const sdk = ensureInitialized();

    const prompt = params.customPrompt
      ? `${params.expression}. ${params.customPrompt}`
      : `Change expression to ${params.expression}, maintain all other characteristics`;

    const response = await sdk.textToImage.generate({
      prompt,
      width: 1024,
      height: 1024,
      imageUrl: params.sourceImageUrl,
    });

    return {
      imageUrl: response.data[0].url,
    };
  },

  async changeHairstyle(params: {
    sourceImageUrl: string;
    hairstyle: string;
    hairColor?: string;
    customPrompt?: string;
  }): Promise<{ imageUrl: string }> {
    const sdk = ensureInitialized();

    let prompt = `Change hairstyle to ${params.hairstyle}`;
    if (params.hairColor) {
      prompt += ` with ${params.hairColor} color`;
    }
    if (params.customPrompt) {
      prompt += `. ${params.customPrompt}`;
    }
    prompt += ', maintain all other characteristics';

    const response = await sdk.textToImage.generate({
      prompt,
      width: 1024,
      height: 1024,
      imageUrl: params.sourceImageUrl,
    });

    return {
      imageUrl: response.data[0].url,
    };
  },

  async changeBackground(params: {
    sourceImageUrl: string;
    location: string;
    timeOfDay?: string;
    weather?: string;
    customPrompt?: string;
  }): Promise<{ imageUrl: string }> {
    const sdk = ensureInitialized();

    let prompt = `Change background to ${params.location}`;
    if (params.timeOfDay) {
      prompt += ` at ${params.timeOfDay}`;
    }
    if (params.weather) {
      prompt += `, ${params.weather} weather`;
    }
    if (params.customPrompt) {
      prompt += `. ${params.customPrompt}`;
    }
    prompt += ', maintain character';

    const response = await sdk.textToImage.generate({
      prompt,
      width: 1024,
      height: 1024,
      imageUrl: params.sourceImageUrl,
    });

    return {
      imageUrl: response.data[0].url,
    };
  },

  async changeOutfit(params: {
    sourceImageUrl: string;
    outfit: string;
    style?: string;
    color?: string;
    accessories?: string;
    customPrompt?: string;
  }): Promise<{ imageUrl: string }> {
    const sdk = ensureInitialized();

    let prompt = `Change outfit to ${params.outfit}`;
    if (params.style) {
      prompt += ` in ${params.style} style`;
    }
    if (params.color) {
      prompt += `, ${params.color} color`;
    }
    if (params.accessories) {
      prompt += `, with ${params.accessories}`;
    }
    if (params.customPrompt) {
      prompt += `. ${params.customPrompt}`;
    }
    prompt += ', maintain character face and features';

    const response = await sdk.textToImage.generate({
      prompt,
      width: 1024,
      height: 1024,
      imageUrl: params.sourceImageUrl,
    });

    return {
      imageUrl: response.data[0].url,
    };
  },
};

/**
 * Legacy Image-to-Video API (bytePlusI2V)
 */
export const bytePlusI2V = {
  async generate(params: {
    prompt: string;
    imageUrl: string;
    options?: {
      resolution?: string;
      duration?: number;
      cameraFixed?: boolean;
    };
  }): Promise<{ taskId: string; status: string }> {
    const sdk = ensureInitialized();

    const response = await sdk.imageToVideo.generate({
      image_url: params.imageUrl,
      prompt: params.prompt,
      duration: params.options?.duration || 5,
    });

    return {
      taskId: response.task_id,
      status: response.status,
    };
  },

  async animateCharacter(params: {
    imageUrl: string;
    action: string;
    duration?: number;
  }): Promise<{ taskId: string; status: string; videoUrl?: string }> {
    const sdk = ensureInitialized();

    const response = await sdk.imageToVideo.generate({
      image_url: params.imageUrl,
      prompt: params.action,
      duration: params.duration || 5,
    });

    return {
      taskId: response.task_id,
      status: response.status,
      videoUrl: undefined, // Will be available after polling
    };
  },

  async queryTask(taskId: string): Promise<{
    status: string;
    videoUrl?: string;
    duration?: number;
    resolution?: string;
  }> {
    const sdk = ensureInitialized();

    const response = await sdk.imageToVideo.getStatus(taskId);

    return {
      status: response.status,
      videoUrl: response.video_url,
      duration: undefined, // Not provided by new API
      resolution: undefined, // Not provided by new API
    };
  },

  async getTaskStatus(taskId: string): Promise<{
    status: string;
    videoUrl?: string;
    duration?: number;
    resolution?: string;
  }> {
    return this.queryTask(taskId);
  },
};

/**
 * Legacy Text-to-Video API (bytePlusT2V)
 */
export const bytePlusT2V = {
  async generate(params: {
    prompt: string;
    options?: {
      resolution?: string;
      duration?: number;
      cameraFixed?: boolean;
    };
  }): Promise<{ taskId: string; status: string }> {
    // Note: The new API doesn't have T2V support
    // This is a stub that throws an error
    throw new Error('Text-to-Video (T2V) is not supported in the new BytePlus API. Please use Image-to-Video (I2V) instead.');
  },

  async queryTask(taskId: string): Promise<{
    status: string;
    videoUrl?: string;
    duration?: number;
    resolution?: string;
  }> {
    // Use the I2V query since it's the same backend
    return bytePlusI2V.queryTask(taskId);
  },
};
