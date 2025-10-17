/**
 * BytePlus Image-to-Video API Client
 */

import { BytePlusClient } from './client';
import {
  ImageToVideoRequest,
  ImageToVideoResponse,
  VideoStatusRequest,
  VideoStatusResponse,
  BytePlusConfig,
} from './types';

export class ImageToVideoClient extends BytePlusClient {
  constructor(config: BytePlusConfig) {
    super(config);
  }

  /**
   * Generate video from image
   */
  async generate(request: ImageToVideoRequest): Promise<ImageToVideoResponse> {
    const payload = {
      image_url: request.image_url,
      prompt: request.prompt || '',
      duration: request.duration || 5,
      seed: request.seed || Math.floor(Math.random() * 1000000),
    };

    return this.post<ImageToVideoResponse>('/image-to-video', payload);
  }

  /**
   * Get video generation status
   */
  async getStatus(taskId: string): Promise<VideoStatusResponse> {
    return this.get<VideoStatusResponse>(`/video-status/${taskId}`);
  }

  /**
   * Wait for video generation to complete with polling
   */
  async waitForCompletion(
    taskId: string,
    options: {
      maxAttempts?: number;
      pollInterval?: number;
      onProgress?: (progress: number, status: string) => void;
    } = {}
  ): Promise<VideoStatusResponse> {
    const {
      maxAttempts = 60,
      pollInterval = 5000,
      onProgress,
    } = options;

    let attempts = 0;

    while (attempts < maxAttempts) {
      const status = await this.getStatus(taskId);

      if (onProgress && status.progress) {
        onProgress(status.progress, status.status);
      }

      if (status.status === 'completed') {
        return status;
      }

      if (status.status === 'failed') {
        const errorMessage = status.error || 'Unknown error';
        throw new Error(`Video generation failed: ${errorMessage}`);
      }

      attempts++;
      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }

    throw new Error('Video generation timeout: Maximum polling attempts reached');
  }

  /**
   * Generate video and wait for completion
   */
  async generateAndWait(
    request: ImageToVideoRequest,
    options?: {
      maxAttempts?: number;
      pollInterval?: number;
      onProgress?: (progress: number, status: string) => void;
    }
  ): Promise<string> {
    const response = await this.generate(request);
    const finalStatus = await this.waitForCompletion(response.task_id, options);

    if (!finalStatus.video_url) {
      throw new Error('Video generation completed but no video URL returned');
    }

    return finalStatus.video_url;
  }
}
