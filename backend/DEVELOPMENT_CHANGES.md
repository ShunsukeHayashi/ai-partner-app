# Development Changes Summary

## Session Date: 2025-10-17

### Overview
Implemented local image storage system and disabled authentication for development testing.

---

## Changes Made

### 1. Local Image Storage System

#### New File: `src/utils/image-storage.ts`
- **Purpose**: Handle local filesystem image storage operations
- **Key Functions**:
  - `saveImage()`: Save Base64 images to local filesystem
  - `readImageAsBase64()`: Read images as Base64
  - `deleteImage()`: Delete images
  - `getImageInfo()`: Get image metadata
  - `getCharacterImages()`: Get all images for a character
  - `initializeUploadDirectories()`: Create required directories on startup

- **Storage Structure**:
  ```
  uploads/
  └── characters/
      └── {userId}/
          ├── source-images/     # User-uploaded original images
          └── generated-images/  # AI-generated images
  ```

#### Database Schema Update
- **File**: `prisma/schema.prisma`
- **Changes**: Added `sourceImagePath` field to Character model
- **Migration**: `20251017055813_initial_with_source_image_path`

#### Server Initialization
- **File**: `src/index.ts`
- **Changes**:
  - Added `initializeUploadDirectories()` call on startup
  - Increased body size limit to 10MB for Base64 image uploads
    ```typescript
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true, limit: '10mb' }));
    ```

#### Route Updates
- **File**: `src/routes/character.ts`
- **Updated Endpoint**: `POST /api/characters/generate-from-image`
  - Now saves uploaded image to local filesystem BEFORE Claude Vision analysis
  - Stores relative file path in `sourceImagePath` field

### 2. Authentication Bypass (Development Only)

**⚠️ IMPORTANT: Re-enable authentication before production deployment!**

The following endpoints have authentication temporarily disabled with fallback to `dev-user-001`:

- `POST /api/characters/generate-from-image` (line 161)
- `POST /api/characters/:id/generate-image` (line 399)
- `POST /api/characters/:id/generate-expression` (line 453)
- `GET /api/characters` (line 345)
- `GET /api/characters/:id` (line 369)

Pattern used:
```typescript
// requireAuth, // 開発中は一時的にコメントアウト
async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.user?.userId || 'dev-user-001';
  // ...
}
```

#### Development User Script
- **File**: `scripts/create-dev-user.ts`
- **Purpose**: Create `dev-user-001` user for testing without authentication
- **Run with**: `npx tsx scripts/create-dev-user.ts`

### 3. Image Analysis Improvements

#### JSON Parsing Enhancement
- **File**: `src/services/ai/image-analyzer.ts`
- **Changes**: Added markdown code block stripping for Claude responses
  ```typescript
  // Strip markdown code blocks if present
  let jsonText = responseText;
  if (jsonText.startsWith('```json')) {
    jsonText = jsonText.replace(/```json\n?/, '').replace(/\n?```$/, '');
  } else if (jsonText.startsWith('```')) {
    jsonText = jsonText.replace(/```\n?/, '').replace(/\n?```$/, '');
  }
  ```

### 4. Configuration Changes

#### Environment Variables
- **File**: `.env`
- **Changes**: Fixed CORS origin from `http://localhost:3002` to `http://localhost:3000`

---

## Testing Scripts Created

All scripts are located in `scripts/` directory:

1. **`create-dev-user.ts`**
   - Creates development user with ID `dev-user-001`

2. **`get-latest-character.ts`**
   - Retrieves the most recently created character

3. **`test-image-generation.ts`**
   - Tests T2I (Text-to-Image) primary image generation

4. **`test-expression-generation.ts`**
   - Tests I2I (Image-to-Image) expression generation

5. **`check-character-images.ts`**
   - Displays all images associated with a character

---

## Complete Flow Verification

### ✅ Full Pipeline Tested Successfully

1. **Image Upload** → Local filesystem storage
2. **Claude Vision Analysis** → Appearance extraction
3. **Character Creation** → Database storage with image path
4. **T2I Generation** → Primary neutral image
5. **I2I Transformation** → Expression variations (happy, surprised, sad)

### Performance Metrics
- **Claude Vision Analysis**: ~6 seconds
- **T2I Primary Image**: ~5 seconds
- **I2I Each Expression**: ~7-8 seconds each
- **Total Time**: ~35 seconds for complete character with 4 images

---

## Known Issues

### Frontend 401 Errors (Resolved)
- **Issue**: GET endpoints still required authentication after initial changes
- **Resolution**: Disabled auth on all character GET endpoints

### Claude Vision JSON Parsing (Resolved)
- **Issue**: Claude sometimes returns JSON wrapped in markdown code blocks
- **Resolution**: Added markdown stripping logic

---

## TODO Before Production

### Critical
- [ ] Re-enable `requireAuth` middleware on all endpoints
- [ ] Remove `dev-user-001` fallback logic
- [ ] Update all TOD comments marked with "本番環境では requireAuth を有効化すること"
- [ ] Test with actual user authentication

### Recommended
- [ ] Add image serving endpoint (GET /api/characters/:id/image)
- [ ] Implement image cleanup when characters are deleted
- [ ] Use characterId in filename instead of "temp_" prefix
- [ ] Add image size validation (currently accepts up to 10MB)
- [ ] Consider cloud storage migration (S3, Firebase Storage, etc.)

---

## Files Modified

### Core Implementation
- `src/utils/image-storage.ts` (NEW - 260 lines)
- `src/routes/character.ts` (MODIFIED - auth bypass + image storage integration)
- `src/index.ts` (MODIFIED - body limit + directory initialization)
- `src/services/ai/image-analyzer.ts` (MODIFIED - JSON parsing fix)

### Database
- `prisma/schema.prisma` (MODIFIED - added sourceImagePath field)
- `prisma/migrations/20251017055813_initial_with_source_image_path/` (NEW)

### Configuration
- `.env` (MODIFIED - CORS origin fix)

### Scripts
- `scripts/create-dev-user.ts` (NEW)
- `scripts/get-latest-character.ts` (NEW)
- `scripts/test-image-generation.ts` (NEW)
- `scripts/test-expression-generation.ts` (NEW)
- `scripts/check-character-images.ts` (NEW)

---

## Development Environment

- **Backend Port**: 3001
- **Frontend Port**: 3000
- **Node.js**: v24.9.0
- **Package Manager**: npm
- **Watch Mode**: tsx watch (auto-restart on file changes)

---

## Notes

- All image storage paths use forward slashes (Unix-style) even on Windows
- Images are stored with timestamp-based unique filenames
- Base64 encoding/decoding handled in `image-storage.ts`
- Comprehensive logging added for debugging
- All TODO comments clearly marked for easy searching

---

**Last Updated**: 2025-10-17 15:20 JST
**Session**: Claude Code AI Assistant
