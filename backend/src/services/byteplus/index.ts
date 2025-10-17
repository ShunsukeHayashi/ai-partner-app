/**
 * BytePlus SDK
 * 
 * Unified client for BytePlus text-to-image and image-to-video APIs
 */

import { TextToImageClient } from './text-to-image';
import { ImageToVideoClient } from './image-to-video';
import { BytePlusConfig } from './types';

export class BytePlusSDK {
  public textToImage: TextToImageClient;
  public imageToVideo: ImageToVideoClient;

  constructor(config: BytePlusConfig) {
    this.textToImage = new TextToImageClient(config);
    this.imageToVideo = new ImageToVideoClient(config);
  }
}

// Export all types and clients
export * from './types';
export { TextToImageClient } from './text-to-image';
export { ImageToVideoClient } from './image-to-video';
export { BytePlusClient } from './client';

// Create singleton instance
let sdkInstance: BytePlusSDK | null = null;

export function initBytePlus(apiKey: string): BytePlusSDK {
  sdkInstance = new BytePlusSDK({ apiKey });
  return sdkInstance;
}

export function getBytePlus(): BytePlusSDK {
  if (!sdkInstance) {
    throw new Error('BytePlus SDK not initialized. Call initBytePlus() first.');
  }
  return sdkInstance;
}
