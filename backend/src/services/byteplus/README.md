# BytePlus SDK

BytePlus API の TypeScript SDK

## 機能

- ✅ Text-to-Image 画像生成
- ✅ Image-to-Video 動画生成
- ✅ 型安全な API クライアント
- ✅ エラーハンドリング
- ✅ 自動リトライ・ポーリング

## インストール

```typescript
import { initBytePlus, getBytePlus } from '@/services/byteplus';

// 初期化
initBytePlus(process.env.BYTEPLUS_API_KEY!);

// SDK取得
const byteplus = getBytePlus();
```

## 使用例

### Text-to-Image（画像生成）

```typescript
const byteplus = getBytePlus();

// 基本的な画像生成
const response = await byteplus.textToImage.generate({
  prompt: 'A beautiful anime girl with long black hair',
  width: 1024,
  height: 1024,
});

const imageUrl = response.data.images[0].url;

// バッチ生成（複数画像）
const batchResponse = await byteplus.textToImage.generateBatch(
  'A cute cat sitting on a table',
  4 // 4枚生成
);

// カスタムサイズ
const customResponse = await byteplus.textToImage.generateWithSize(
  'A scenic landscape',
  1920,
  1080
);
```

### Image-to-Video（動画生成）

```typescript
const byteplus = getBytePlus();

// 動画生成開始
const response = await byteplus.imageToVideo.generate({
  image_url: 'https://example.com/image.jpg',
  prompt: 'waving hand with a smile',
  duration: 5,
});

// ステータス確認
const status = await byteplus.imageToVideo.getStatus(response.task_id);

// ポーリングして完了まで待機
const finalStatus = await byteplus.imageToVideo.waitForCompletion(
  response.task_id,
  {
    maxAttempts: 60,
    pollInterval: 5000,
    onProgress: (progress, status) => {
      console.log(`Progress: ${progress}% - Status: ${status}`);
    },
  }
);

const videoUrl = finalStatus.video_url;

// ワンライナー（生成 + 待機）
const videoUrl = await byteplus.imageToVideo.generateAndWait({
  image_url: 'https://example.com/image.jpg',
  prompt: 'dancing gracefully',
  duration: 10,
});
```

## API リファレンス

### TextToImageClient

#### `generate(request: TextToImageRequest): Promise<TextToImageResponse>`

画像を生成します。

**パラメータ**:
- `prompt` (string, required): 生成プロンプト
- `model` (string, optional): モデル名（デフォルト: "flux-schnell"）
- `width` (number, optional): 幅（デフォルト: 1024）
- `height` (number, optional): 高さ（デフォルト: 1024）
- `seed` (number, optional): シード値
- `num_images` (number, optional): 生成枚数（デフォルト: 1）
- `guidance_scale` (number, optional): ガイダンススケール（デフォルト: 7.5）
- `steps` (number, optional): ステップ数（デフォルト: 20）

#### `generateBatch(prompt: string, count: number): Promise<TextToImageResponse>`

複数の画像を一度に生成します。

#### `generateWithSize(prompt: string, width: number, height: number): Promise<TextToImageResponse>`

指定サイズの画像を生成します。

### ImageToVideoClient

#### `generate(request: ImageToVideoRequest): Promise<ImageToVideoResponse>`

動画生成を開始します（非同期）。

**パラメータ**:
- `image_url` (string, required): 元画像のURL
- `prompt` (string, optional): 動きの指示
- `duration` (number, optional): 動画の長さ（秒）（デフォルト: 5）
- `seed` (number, optional): シード値

#### `getStatus(taskId: string): Promise<VideoStatusResponse>`

動画生成のステータスを取得します。

#### `waitForCompletion(taskId: string, options?): Promise<VideoStatusResponse>`

動画生成が完了するまでポーリングします。

**オプション**:
- `maxAttempts` (number): 最大試行回数（デフォルト: 60）
- `pollInterval` (number): ポーリング間隔（ミリ秒）（デフォルト: 5000）
- `onProgress` (function): 進捗コールバック

#### `generateAndWait(request: ImageToVideoRequest, options?): Promise<string>`

動画を生成して完了まで待機します（ワンライナー）。

## エラーハンドリング

```typescript
import { BytePlusError } from '@/services/byteplus';

try {
  const response = await byteplus.textToImage.generate({ prompt: 'test' });
} catch (error) {
  if (error instanceof BytePlusError) {
    console.error('Status:', error.statusCode);
    console.error('Message:', error.message);
    console.error('Response:', error.response);
  }
}
```

## ファイル構成

```
services/byteplus/
├── README.md                  # このファイル
├── index.ts                   # エントリーポイント
├── types.ts                   # 型定義
├── client.ts                  # ベースクライアント
├── text-to-image.ts           # 画像生成クライアント
└── image-to-video.ts          # 動画生成クライアント
```

## ライセンス

MIT
