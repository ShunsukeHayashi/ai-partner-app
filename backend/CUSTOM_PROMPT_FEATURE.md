# カスタムプロンプト機能 (Custom Prompt Feature)

## 概要 (Overview)

表情変更時にユーザーが独自のプロンプトを追加できる機能です。
基本の表情プロンプトに加えて、ユーザーの要望を細かく反映させることができます。

Allows users to add custom prompts when changing character expressions.
User requirements can be reflected in detail in addition to the base expression prompts.

## 機能の特徴 (Features)

1. **基本プロンプトとの組み合わせ**
   - 12種類の最適化された表情プロンプト（smile, happy, sad, angry, etc.）
   - カスタムプロンプトは基本プロンプトに**追加**される形で適用
   - 基本プロンプトなし（カスタムのみ）も可能

2. **柔軟なカスタマイズ**
   - 背景効果の追加（Add cherry blossom petals floating around）
   - アクセサリーの追加（Add a cute hair ribbon and sparkling earrings）
   - 特殊効果の追加（Add dramatic motion lines and shocked aura effect）
   - 表情の微調整（Make the eyes more sparkling with star reflections）

3. **seedream-4-0-250828対応**
   - 最新のBytePlus APIモデルで動作
   - サイズパラメータ自動調整（adaptive → 1k）
   - ウォーターマーク無効

## API仕様 (API Specification)

### 1. キャラクター表情生成エンドポイント

**Endpoint**: `POST /api/characters/:id/generate-expression`

**Request Body**:
```json
{
  "expression": "happy",
  "customPrompt": "Add sparkling eyes with star reflections and cherry blossom petals around the character."
}
```

**Parameters**:
- `expression` (required, string): 表情タイプ（12種類から選択）
  - smile, happy, shy, surprised, in_love, tears_of_joy
  - sad, angry, neutral, excited, worried, sleepy
- `customPrompt` (optional, string): ユーザー追加のプロンプト

**Response**:
```json
{
  "expression": "happy",
  "imageUrl": "https://...",
  "message": "Expression generated successfully",
  "usedCustomPrompt": true
}
```

### 2. 複数画像組み合わせエンドポイント

**Endpoint**: `POST /api/characters/:id/combine-images`

**Request Body**:
```json
{
  "sourceImageUrl": "https://example.com/outfit.jpg",
  "prompt": "Replace the clothing with the outfit from the reference image.",
  "customPrompt": "Maintain the character's facial features and pose."
}
```

**Parameters**:
- `sourceImageUrl` (required, string): 参照画像のURL（服装、背景等）
- `prompt` (optional, string): ベースプロンプト（デフォルト: "Combine elements from both images while maintaining character identity."）
- `customPrompt` (optional, string): 追加のカスタムプロンプト

**Response**:
```json
{
  "imageUrl": "https://...",
  "imageUrls": ["https://...", "https://..."],
  "message": "Images combined successfully",
  "usedMultipleImages": true
}
```

### 3. テストエンドポイント（表情変更）

**Endpoint**: `POST /api/test/expression`

**Request Body**:
```json
{
  "imageUrl": "https://example.com/character-image.jpg",
  "expression": "smile",
  "customPrompt": "Add soft lighting and warm atmosphere."
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "imageUrl": "https://...",
    "prompt": "Transform the character to have a warm, genuine smile... Add soft lighting and warm atmosphere.",
    "sourceImageUrl": "https://example.com/character-image.jpg",
    "createdAt": "2025-10-16T21:20:00.000Z"
  },
  "usedCustomPrompt": true
}
```

### 4. テストエンドポイント（複数画像組み合わせ）

**Endpoint**: `POST /api/test/combine-images`

**Request Body**:
```json
{
  "imageUrls": [
    "https://example.com/character.jpg",
    "https://example.com/outfit.jpg"
  ],
  "prompt": "Replace the clothing in image 1 with the outfit from image 2.",
  "customPrompt": "Keep the original character pose and background."
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "imageUrl": "https://...",
    "imageUrls": ["https://..."],
    "prompt": "Replace the clothing in image 1 with the outfit from image 2. Keep the original character pose and background.",
    "createdAt": "2025-10-17T10:30:00.000Z"
  },
  "usedMultipleImages": true,
  "usedCustomPrompt": true
}
```

## 使用例 (Usage Examples)

### 例1: 基本的な表情変更（カスタムプロンプトなし）

```bash
curl -X POST http://localhost:3001/api/characters/YOUR_CHAR_ID/generate-expression \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "expression": "happy"
  }'
```

**適用されるプロンプト**:
```
Make the character express pure happiness and joy with wide, sparkling eyes, a bright smile, raised eyebrows, and an overall radiant, positive aura. The face should glow with genuine delight.
```

### 例2: キラキラした目を追加

```bash
curl -X POST http://localhost:3001/api/characters/YOUR_CHAR_ID/generate-expression \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "expression": "happy",
    "customPrompt": "Add sparkling, glittering eyes with star reflections."
  }'
```

**適用されるプロンプト**:
```
Make the character express pure happiness and joy with wide, sparkling eyes, a bright smile, raised eyebrows, and an overall radiant, positive aura. The face should glow with genuine delight. Add sparkling, glittering eyes with star reflections.
```

### 例3: 背景効果を追加

```bash
curl -X POST http://localhost:3001/api/characters/YOUR_CHAR_ID/generate-expression \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "expression": "smile",
    "customPrompt": "Surround the character with soft pink cherry blossom petals floating around."
  }'
```

### 例4: アクセサリーを追加

```bash
curl -X POST http://localhost:3001/api/characters/YOUR_CHAR_ID/generate-expression \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "expression": "excited",
    "customPrompt": "Add a cute hair ribbon and sparkling earrings."
  }'
```

### 例5: 特殊効果を追加

```bash
curl -X POST http://localhost:3001/api/characters/YOUR_CHAR_ID/generate-expression \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "expression": "surprised",
    "customPrompt": "Add dramatic motion lines and a shocked aura effect around the character."
  }'
```

### 例6: 複数画像の組み合わせ（服装変更）

```bash
curl -X POST http://localhost:3001/api/characters/YOUR_CHAR_ID/combine-images \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "sourceImageUrl": "https://example.com/outfit-reference.jpg",
    "prompt": "Replace the clothing with the outfit from the reference image.",
    "customPrompt": "Keep the character face and pose unchanged."
  }'
```

**機能**:
- キャラクターの基本画像（`primaryImageUrl`）と参照画像を組み合わせ
- 服装、背景、アクセサリーなどの要素を参照画像から取得
- 顔や表情はキャラクターの基本画像を維持

### 例7: テストエンドポイントで複数画像を組み合わせ

```bash
curl -X POST http://localhost:3001/api/test/combine-images \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "imageUrls": [
      "https://example.com/character.jpg",
      "https://example.com/outfit.jpg"
    ],
    "prompt": "Combine the character from image 1 with the outfit from image 2.",
    "customPrompt": "Maintain realistic lighting and shadows."
  }'
```

**ユースケース**:
- 服装の変更（ドレス、カジュアル、コスプレ等）
- 背景の変更（屋内、屋外、特殊効果等）
- アクセサリーの追加（帽子、眼鏡、装飾品等）
- ポーズやアングルの調整

## テストスクリプト (Test Script)

テストスクリプトを用意しています：

```bash
./test-custom-prompt.sh
```

スクリプトを実行する前に、以下を編集してください：
1. `TOKEN` - 実際のJWTトークン
2. `CHAR_ID` - 実際のキャラクターID

## 技術的な実装詳細 (Technical Implementation)

### 1. バックエンド実装

**ファイル**: `src/services/byteplus/i2i.ts`

```typescript
async changeExpression(params: {
  sourceImageUrl: string;
  expression: string;
  customPrompt?: string; // ユーザー追加プロンプト
}): Promise<I2IResponse> {
  const { sourceImageUrl, expression, customPrompt } = params;

  // 基本プロンプト取得
  const basePrompt = expressionPrompts[expression] || defaultPrompt;

  // カスタムプロンプトを追加
  const finalPrompt = customPrompt
    ? `${basePrompt} ${customPrompt}`
    : basePrompt;

  return this.generate({
    prompt: finalPrompt,
    imageUrl: sourceImageUrl,
    size: '1k',
    watermark: false,
  });
}
```

### 2. ルート実装

**ファイル**: `src/routes/character.ts`

```typescript
router.post(
  '/:id/generate-expression',
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    const { expression, customPrompt } = req.body;

    const result = await bytePlusI2I.changeExpression({
      sourceImageUrl: character.primaryImageUrl,
      expression,
      customPrompt, // オプショナル
    });

    res.json({
      expression,
      imageUrl: result.imageUrl,
      message: 'Expression generated successfully',
      usedCustomPrompt: !!customPrompt,
    });
  }
);
```

## カスタムプロンプトのベストプラクティス (Best Practices)

### 1. 具体的な指示を記述

❌ 悪い例:
```
"Make it better"
"More cute"
```

✅ 良い例:
```
"Add sparkling eyes with star reflections and a gentle pink blush on the cheeks."
"Surround with soft pink cherry blossom petals floating in the air."
```

### 2. 視覚的要素を明確に

- 色を指定（soft pink, bright blue, warm golden）
- 質感を指定（sparkling, glittering, soft, gentle）
- 配置を指定（around the character, on the cheeks, in the background）

### 3. 表情との整合性を保つ

例えば `sad` 表情に `Add cheerful rainbow background` のような矛盾した指示は避ける。

### 4. 長すぎるプロンプトは避ける

推奨：1-2文（50-100単語）
理由：プロンプトが長すぎるとAIが混乱する可能性がある

## 注意事項 (Notes)

1. **APIキー必須**: BytePlus APIキーが `.env` に設定されている必要があります
2. **認証必須**: JWT認証トークンが必要です
3. **画像URL必須**: キャラクターの `primaryImageUrl` が生成済みである必要があります
4. **レート制限**: BytePlus APIのレート制限に注意してください
5. **コスト**: 各リクエストでBytePlus APIが課金されます

## 関連ファイル (Related Files)

- `src/services/byteplus/i2i.ts` - I2Iサービス実装
- `src/routes/character.ts` - キャラクター管理ルート
- `src/routes/test.ts` - テストエンドポイント
- `test-custom-prompt.sh` - テストスクリプト

## 今後の拡張予定 (Future Enhancements)

1. **プロンプトテンプレート**: よく使われるカスタムプロンプトのテンプレート集
2. **プロンプト履歴**: ユーザーが過去に使用したカスタムプロンプトの保存
3. **プロンプト推奨**: AIが推奨するカスタムプロンプトの提案
4. **複数バリエーション**: 1つのリクエストで複数の画像バリエーションを生成
5. **リアルタイムプレビュー**: フロントエンドでプロンプトのプレビュー機能

---

**最終更新**: 2025-10-16
**バージョン**: 1.0.0
