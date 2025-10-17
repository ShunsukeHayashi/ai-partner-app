/**
 * Image Storage Utility
 * Handles local image storage for character images
 */

import fs from 'fs/promises';
import path from 'path';
import { createLogger } from './logger.js';

const logger = createLogger('image-storage');

// Base upload directory
const UPLOAD_BASE_DIR = path.join(process.cwd(), 'uploads');
const CHARACTER_IMAGES_DIR = path.join(UPLOAD_BASE_DIR, 'characters');

interface SaveImageOptions {
  userId: string;
  characterId?: string;
  imageType: 'source' | 'generated';
  base64Data: string;
  mimeType: 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp';
  suffix?: string; // 複数画像保存時のインデックス (例: "_1", "_2")
  metadata?: {
    expression?: string;
    originalFilename?: string;
  };
}

interface SaveImageResult {
  filePath: string;
  relativePath: string;
  filename: string;
  size: number;
}

/**
 * Get file extension from MIME type
 */
function getExtensionFromMimeType(mimeType: string): string {
  const mimeToExt: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
  };
  return mimeToExt[mimeType] || 'jpg';
}

/**
 * Generate unique filename
 */
function generateFilename(
  characterId: string | undefined,
  imageType: 'source' | 'generated',
  extension: string,
  suffix?: string,
  metadata?: SaveImageOptions['metadata']
): string {
  const timestamp = Date.now();
  const charId = characterId || 'temp';

  if (imageType === 'source') {
    // source-images: {characterId}_{timestamp}{suffix}.{ext}
    // 例: temp_1234567890_1.jpg (複数画像の1枚目)
    const suffixPart = suffix || '';
    return `${charId}_${timestamp}${suffixPart}.${extension}`;
  } else {
    // generated-images: {characterId}_{expression}_{timestamp}{suffix}.{ext}
    const expression = metadata?.expression || 'default';
    const suffixPart = suffix || '';
    return `${charId}_${expression}_${timestamp}${suffixPart}.${extension}`;
  }
}

/**
 * Ensure directory exists
 */
async function ensureDirectoryExists(dirPath: string): Promise<void> {
  try {
    await fs.access(dirPath);
  } catch {
    await fs.mkdir(dirPath, { recursive: true });
    logger.info('Created directory', { dirPath });
  }
}

/**
 * Save base64 image to local filesystem
 */
export async function saveImage(options: SaveImageOptions): Promise<SaveImageResult> {
  const {
    userId,
    characterId,
    imageType,
    base64Data,
    mimeType,
    suffix,
    metadata,
  } = options;

  logger.info('Saving image', {
    userId,
    characterId,
    imageType,
    mimeType,
    suffix,
    metadata,
  });

  try {
    // Determine directory path
    const userDir = path.join(CHARACTER_IMAGES_DIR, userId);
    const imageTypeDir = imageType === 'source' ? 'source-images' : 'generated-images';
    const targetDir = path.join(userDir, imageTypeDir);

    // Ensure directory exists
    await ensureDirectoryExists(targetDir);

    // Generate filename
    const extension = getExtensionFromMimeType(mimeType);
    const filename = generateFilename(characterId, imageType, extension, suffix, metadata);
    const filePath = path.join(targetDir, filename);

    // Convert base64 to buffer
    const buffer = Buffer.from(base64Data, 'base64');

    // Write file
    await fs.writeFile(filePath, buffer);

    // Calculate relative path (from backend root)
    const relativePath = path.relative(process.cwd(), filePath);

    logger.info('Image saved successfully', {
      filePath,
      relativePath,
      size: buffer.length,
    });

    return {
      filePath,
      relativePath,
      filename,
      size: buffer.length,
    };
  } catch (error) {
    logger.error('Failed to save image', { error, options });
    throw new Error('画像の保存に失敗しました');
  }
}

/**
 * Read image from local filesystem and return as base64
 */
export async function readImageAsBase64(filePath: string): Promise<string> {
  try {
    const buffer = await fs.readFile(filePath);
    return buffer.toString('base64');
  } catch (error) {
    logger.error('Failed to read image', { error, filePath });
    throw new Error('画像の読み込みに失敗しました');
  }
}

/**
 * Delete image from local filesystem
 */
export async function deleteImage(filePath: string): Promise<void> {
  try {
    await fs.unlink(filePath);
    logger.info('Image deleted', { filePath });
  } catch (error) {
    logger.error('Failed to delete image', { error, filePath });
    throw new Error('画像の削除に失敗しました');
  }
}

/**
 * Get image info
 */
export async function getImageInfo(filePath: string): Promise<{
  exists: boolean;
  size?: number;
  mimeType?: string;
}> {
  try {
    const stats = await fs.stat(filePath);
    const extension = path.extname(filePath).toLowerCase();

    const extToMime: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
    };

    return {
      exists: true,
      size: stats.size,
      mimeType: extToMime[extension] || 'application/octet-stream',
    };
  } catch {
    return {
      exists: false,
    };
  }
}

/**
 * Get all images for a character
 */
export async function getCharacterImages(
  userId: string,
  characterId: string
): Promise<{
  sourceImages: string[];
  generatedImages: string[];
}> {
  const userDir = path.join(CHARACTER_IMAGES_DIR, userId);

  const sourceDir = path.join(userDir, 'source-images');
  const generatedDir = path.join(userDir, 'generated-images');

  const sourceImages: string[] = [];
  const generatedImages: string[] = [];

  try {
    const sourceFiles = await fs.readdir(sourceDir);
    sourceImages.push(
      ...sourceFiles
        .filter(file => file.startsWith(characterId))
        .map(file => path.join(sourceDir, file))
    );
  } catch {
    // Directory doesn't exist or is empty
  }

  try {
    const generatedFiles = await fs.readdir(generatedDir);
    generatedImages.push(
      ...generatedFiles
        .filter(file => file.startsWith(characterId))
        .map(file => path.join(generatedDir, file))
    );
  } catch {
    // Directory doesn't exist or is empty
  }

  return {
    sourceImages,
    generatedImages,
  };
}

/**
 * Initialize upload directories on startup
 */
export async function initializeUploadDirectories(): Promise<void> {
  await ensureDirectoryExists(UPLOAD_BASE_DIR);
  await ensureDirectoryExists(CHARACTER_IMAGES_DIR);
  logger.info('Upload directories initialized', {
    baseDir: UPLOAD_BASE_DIR,
    characterImagesDir: CHARACTER_IMAGES_DIR,
  });
}
