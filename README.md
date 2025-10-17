# AI Partner App - 擬似恋愛・結婚生活体験アプリ

生成AIを使った擬似的なパートナー体験アプリケーション。出会いから結婚生活までをシミュレートします。

## プロジェクト概要

このアプリは、生成AIを活用して「擬似的な恋愛・結婚体験」を提供します。
ユーザーは理想のパートナーキャラクターを作成し、出会い→デート→告白→結婚→結婚生活という一連の体験を楽しめます。

## 技術スタック

### フロントエンド
- **Next.js 15** - React フレームワーク
- **TypeScript** - 型安全性
- **Tailwind CSS** - スタイリング
- **React Query** - データフェッチング

### バックエンド
- **Node.js + Express** - APIサーバー
- **TypeScript** - 型安全性
- **PostgreSQL** - リレーショナルデータ
- **Redis** - セッション管理・キャッシュ
- **Prisma** - ORM

### AI Services
- **BytePlus APIs**
  - `i2i` (Image-to-Image) - 表情変化、ポーズ変更
  - `i2v` (Image-to-Video) - 動くキャラクター生成
  - `t2i` (Text-to-Image) - キャラクター画像生成
  - `t2v` (Text-to-Video) - シーン動画生成
- **Gemini 2.5 Flash TTS** - 音声合成（テキスト→音声）
- **Claude API** - 会話エンジン（Anthropic）

## 主要機能

### 1. キャラクター作成（Character Creation）
- 外見カスタマイズ（BytePlus t2i）
- 性格・趣味設定
- 音声タイプ選択（Gemini TTS）
- プロフィール作成

### 2. 恋愛体験システム（Romance Experience）

#### Stage 1: 出会い（First Meet）
- 初対面会話イベント
- 連絡先交換
- 第一印象システム

#### Stage 2: デート期間（Dating）
- デートプラン作成
- デートシーン生成（BytePlus t2v）
- 思い出アルバム
- 好感度システム

#### Stage 3: 告白・交際（Confession & Relationship）
- 告白イベント
- 記念日管理
- カップル日常会話

#### Stage 4: プロポーズ（Proposal）
- プロポーズ準備
- 指輪選択
- プロポーズシーン（BytePlus t2v）

#### Stage 5: 結婚生活（Marriage Life）
- 新婚生活シミュレーション
- 日常ルーティン
  - モーニングルーティン
  - 仕事後の会話
  - 就寝前の会話
- 記念日イベント自動生成

### 3. インタラクション機能

#### テキストチャット
- Claude API による自然な会話
- 文脈理解・記憶機能
- 感情認識と適切な反応

#### 音声会話
- Gemini 2.5 Flash TTS による音声生成
- リアルタイム音声再生
- 感情に応じた声のトーン変化

#### ビジュアル生成
- キャラクター画像生成（BytePlus t2i）
- 表情変化（BytePlus i2i）
- 動画生成（BytePlus i2v, t2v）

### 4. 記憶・学習システム
- 会話履歴の永続化
- ユーザーの好み学習
- パーソナライズされた応答
- 重要なイベント記憶

### 5. 通知・リマインダー
- 定期的な会話通知
- 記念日リマインド
- デートプラン提案
- モーニング/ナイトメッセージ

## プロジェクト構造

```
ai-partner-app/
├── frontend/                  # Next.js フロントエンド
│   ├── app/                   # App Router
│   │   ├── (auth)/           # 認証関連ページ
│   │   ├── dashboard/        # ダッシュボード
│   │   ├── character/        # キャラクター管理
│   │   ├── chat/             # チャット画面
│   │   └── timeline/         # 思い出タイムライン
│   ├── components/           # Reactコンポーネント
│   │   ├── character/        # キャラクター関連
│   │   ├── chat/             # チャット関連
│   │   ├── timeline/         # タイムライン関連
│   │   └── ui/               # 共通UIコンポーネント
│   ├── lib/                  # ユーティリティ
│   │   ├── api-client.ts     # API クライアント
│   │   ├── hooks/            # カスタムフック
│   │   └── utils/            # ヘルパー関数
│   └── public/               # 静的ファイル
│
├── backend/                   # Express バックエンド
│   ├── src/
│   │   ├── routes/           # APIルート
│   │   │   ├── auth.ts       # 認証
│   │   │   ├── character.ts  # キャラクター管理
│   │   │   ├── chat.ts       # チャット
│   │   │   ├── timeline.ts   # タイムライン
│   │   │   └── ai.ts         # AI統合
│   │   ├── services/         # ビジネスロジック
│   │   │   ├── byteplus/     # BytePlus API統合
│   │   │   │   ├── i2i.ts    # Image-to-Image
│   │   │   │   ├── i2v.ts    # Image-to-Video
│   │   │   │   ├── t2i.ts    # Text-to-Image
│   │   │   │   └── t2v.ts    # Text-to-Video
│   │   │   ├── gemini-tts.ts # Gemini TTS統合
│   │   │   ├── claude.ts     # Claude API統合
│   │   │   ├── character.ts  # キャラクター管理
│   │   │   ├── conversation.ts # 会話管理
│   │   │   └── stage.ts      # ステージ管理
│   │   ├── models/           # データモデル（Prisma）
│   │   ├── middleware/       # ミドルウェア
│   │   └── utils/            # ユーティリティ
│   ├── prisma/
│   │   └── schema.prisma     # データベーススキーマ
│   └── package.json
│
├── shared/                    # 共有型定義
│   └── types/
│       ├── character.ts      # キャラクター型
│       ├── conversation.ts   # 会話型
│       ├── stage.ts          # ステージ型
│       └── api.ts            # API型
│
└── docs/                      # ドキュメント
    ├── ARCHITECTURE.md       # アーキテクチャ設計
    ├── API.md                # API仕様
    ├── STAGE_SYSTEM.md       # ステージシステム設計
    └── BYTEPLUS_INTEGRATION.md # BytePlus統合ガイド
```

## ステージシステム

### Stage 1: 出会い（first_meet）
- 初期状態
- キャラクター作成完了後に開始
- 初対面会話イベント

### Stage 2: デート期間（dating）
- 好感度 20% 以上で解放
- デート計画機能
- デートシーン生成

### Stage 3: 告白・交際（relationship）
- 好感度 50% 以上で解放
- 告白イベント
- 記念日管理

### Stage 4: プロポーズ（proposal）
- 好感度 80% 以上で解放
- プロポーズ準備
- 指輪選択

### Stage 5: 結婚生活（marriage）
- プロポーズ成功後に解放
- 新婚生活
- 日常ルーティン

## 好感度システム

- **0-20%**: 知り合い（出会いステージ）
- **20-50%**: 友達以上（デートステージ）
- **50-80%**: 恋人（交際ステージ）
- **80-100%**: 婚約者（プロポーズステージ）
- **100%**: 配偶者（結婚ステージ）

好感度は以下で上昇：
- 会話頻度
- デート実施
- イベント参加
- プレゼント贈呈

## 環境変数

```bash
# Backend (.env)
DATABASE_URL=postgresql://user:password@localhost:5432/aipartner
REDIS_URL=redis://localhost:6379

# BytePlus API
BYTEPLUS_API_KEY=your_byteplus_api_key
BYTEPLUS_API_ENDPOINT=https://api.byteplus.com

# Gemini API
GEMINI_API_KEY=your_gemini_api_key

# Claude API
ANTHROPIC_API_KEY=your_anthropic_api_key

# JWT
JWT_SECRET=your_jwt_secret

# Frontend (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## セットアップ

### 1. 依存関係インストール

```bash
# Frontend
cd frontend
npm install

# Backend
cd backend
npm install
```

### 2. データベースセットアップ

```bash
cd backend
npx prisma migrate dev
npx prisma generate
```

### 3. 開発サーバー起動

```bash
# Backend (Port 3001)
cd backend
npm run dev

# Frontend (Port 3000)
cd frontend
npm run dev
```

## 開発ガイドライン

### TypeScript
- Strict mode 必須
- すべてのAPIレスポンスに型定義
- `shared/types` を活用

### コミット規約
- Conventional Commits 準拠
- `feat:`, `fix:`, `chore:`, `docs:`

### テスト
- Vitest 使用
- カバレッジ目標: 80%以上

## リポジトリ

このプロジェクトは独立したリポジトリとして管理されています。

**Repository**: https://github.com/ShunsukeHayashi/ai-partner-app

## ライセンス

MIT License

## 開発履歴

このプロジェクトは元々 [Miyabi](https://github.com/ShunsukeHayashi/Miyabi) リポジトリの一部として開発されましたが、2025年10月18日に独立したリポジトリに分離されました。

## 作成者

Shunsuke Hayashi
- GitHub: [@ShunsukeHayashi](https://github.com/ShunsukeHayashi)
- Email: supernovasyun@gmail.com
