/**
 * Image Downloader Service
 * Downloads images from external URLs and stores them locally
 */

import axios from 'axios';
import { promises as fs } from 'fs';
import path from 'path';
import { createHash } from 'crypto';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('image-downloader');

export interface DownloadedImage {
  localPath: string;
  originalUrl: string;
  fileSize: number;
  mimeType: string;
}

export class ImageDownloader {
  private baseDir: string;

  constructor(baseDir: string = 'uploads/generated-images') {
    this.baseDir = baseDir;
  }

  /**
   * Ensure directory exists
   */
  private async ensureDirectory(dirPath: string): Promise<void> {
    try {
      await fs.mkdir(dirPath, { recursive: true });
    } catch (error) {
      logger.error(`Failed to create directory ${dirPath}:`, error);
      throw error;
    }
  }

  /**
   * Download image from URL and save locally
   */
  async downloadImage(
    imageUrl: string,
    userId: string,
    characterId: string,
    imageType: 'primary' | 'expression' = 'primary'
  ): Promise<DownloadedImage> {
    try {
      // Download image
      const response = await axios.get(imageUrl, {
        responseType: 'arraybuffer',
        timeout: 30000, // 30 seconds
      });

      // Get MIME type from response
      const mimeType = response.headers['content-type'] || 'image/jpeg';
      const extension = this.getExtensionFromMimeType(mimeType);

      // Generate filename with hash to avoid collisions
      const timestamp = Date.now();
      const hash = createHash('md5').update(imageUrl).digest('hex').substring(0, 8);
      const filename = `${characterId}-${imageType}-${timestamp}-${hash}${extension}`;

      // Create user-specific directory
      const userDir = path.join(this.baseDir, userId, characterId);
      await this.ensureDirectory(userDir);

      // Save file
      const localPath = path.join(userDir, filename);
      await fs.writeFile(localPath, response.data);

      const stats = await fs.stat(localPath);

      logger.info(`Image downloaded successfully: ${filename}`, {
        userId,
        characterId,
        fileSize: stats.size,
        originalUrl: imageUrl.substring(0, 100), // Log first 100 chars
      });

      return {
        localPath,
        originalUrl: imageUrl,
        fileSize: stats.size,
        mimeType,
      };
    } catch (error) {
      logger.error('Failed to download image:', {
        error,
        imageUrl: imageUrl.substring(0, 100),
        userId,
        characterId,
      });
      throw new Error(`Failed to download image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Download multiple images
   */
  async downloadImages(
    imageUrls: string[],
    userId: string,
    characterId: string,
    imageType: 'primary' | 'expression' = 'expression'
  ): Promise<DownloadedImage[]> {
    const results: DownloadedImage[] = [];

    for (const url of imageUrls) {
      try {
        const downloaded = await this.downloadImage(url, userId, characterId, imageType);
        results.push(downloaded);
      } catch (error) {
        logger.warn(`Failed to download one image, continuing...`, { url: url.substring(0, 100) });
      }
    }

    return results;
  }

  /**
   * Get file extension from MIME type
   */
  private getExtensionFromMimeType(mimeType: string): string {
    const mimeToExt: Record<string, string> = {
      'image/jpeg': '.jpg',
      'image/jpg': '.jpg',
      'image/png': '.png',
      'image/gif': '.gif',
      'image/webp': '.webp',
      'image/svg+xml': '.svg',
    };

    return mimeToExt[mimeType.toLowerCase()] || '.jpg';
  }

  /**
   * Clean up old generated images for a character
   */
  async cleanupOldImages(userId: string, characterId: string, keepCount: number = 5): Promise<void> {
    try {
      const userDir = path.join(this.baseDir, userId, characterId);

      // Check if directory exists
      try {
        await fs.access(userDir);
      } catch {
        return; // Directory doesn't exist, nothing to clean
      }

      const files = await fs.readdir(userDir);

      // Get file stats
      const fileStats = await Promise.all(
        files.map(async (file) => {
          const filePath = path.join(userDir, file);
          const stats = await fs.stat(filePath);
          return { file, filePath, mtime: stats.mtime };
        })
      );

      // Sort by modification time (newest first)
      fileStats.sort((a, b) => b.mtime.getTime() - a.mtime.getTime());

      // Delete old files
      const filesToDelete = fileStats.slice(keepCount);
      for (const { filePath, file } of filesToDelete) {
        await fs.unlink(filePath);
        logger.info(`Cleaned up old image: ${file}`);
      }

      if (filesToDelete.length > 0) {
        logger.info(`Cleaned up ${filesToDelete.length} old images for character ${characterId}`);
      }
    } catch (error) {
      logger.error('Failed to cleanup old images:', { error, userId, characterId });
    }
  }
}

// Export singleton instance
export const imageDownloader = new ImageDownloader();
