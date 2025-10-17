# Getting Started - AI Partner App

## プロジェクト概要

AI Partner Appのプロジェクトセットアップが完了しました！
このガイドに従って開発を始めましょう。

## プロジェクト構造

```
ai-partner-app/
├── README.md              # プロジェクト概要
├── GETTING_STARTED.md     # このファイル
├── docs/                  # ドキュメント
│   └── STAGE_SYSTEM.md   # ステージシステム設計
├── shared/                # 共有型定義
│   └── types/
│       ├── stage.ts      # ステージ型
│       ├── character.ts  # キャラクター型
│       └── conversation.ts # 会話型
├── backend/               # Express API
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example
│   ├── prisma/
│   │   └── schema.prisma # データベーススキーマ
│   └── src/
│       ├── index.ts      # エントリーポイント
│       ├── routes/       # APIルート（未実装）
│       ├── services/     # ビジネスロジック（未実装）
│       ├── middleware/   # ミドルウェア
│       └── utils/        # ユーティリティ
└── frontend/              # Next.js App
    ├── package.json
    ├── tsconfig.json
    ├── next.config.ts
    ├── tailwind.config.ts
    ├── .env.local.example
    └── app/
        ├── layout.tsx    # ルートレイアウト
        ├── page.tsx      # ホームページ
        └── globals.css   # グローバルスタイル
```

## セットアップ手順

### 1. 環境変数の設定

#### Backend

```bash
cd backend
cp .env.example .env
```

`.env`を編集して以下を設定：

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/aipartner

# Redis
REDIS_URL=redis://localhost:6379

# BytePlus API
BYTEPLUS_API_KEY=your_byteplus_api_key
BYTEPLUS_API_ENDPOINT=https://api.byteplus.com

# Gemini API
GEMINI_API_KEY=your_gemini_api_key

# Claude API
ANTHROPIC_API_KEY=your_anthropic_api_key

# JWT
JWT_SECRET=your_random_secret_key_here
```

#### Frontend

```bash
cd frontend
cp .env.local.example .env.local
```

`.env.local`を編集：

```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 2. 依存関係のインストール

#### Backend

```bash
cd backend
npm install
```

#### Frontend

```bash
cd frontend
npm install
```

### 3. データベースのセットアップ

PostgreSQLとRedisが必要です。Dockerを使う場合：

```bash
# docker-compose.yml を作成してから
docker-compose up -d

# Prisma マイグレーション
cd backend
npx prisma migrate dev --name init
npx prisma generate
```

### 4. 開発サーバーの起動

#### Backend (Port 3001)

```bash
cd backend
npm run dev
```

#### Frontend (Port 3000)

```bash
cd frontend
npm run dev
```

### 5. 動作確認

- Frontend: http://localhost:3000
- Backend Health: http://localhost:3001/health
- Backend API: http://localhost:3001/api

## 次のステップ

### Phase 1: MVP開発（最小限の機能）

#### 1. データベースとAPI基盤

**Backend実装**:
- [ ] Prisma Clientのセットアップ
- [ ] 認証システム（JWT）
- [ ] ユーザー登録・ログインAPI
- [ ] キャラクター作成API
- [ ] 基本的な会話API

**実装優先順位**:
1. `backend/src/routes/auth.ts` - 認証API
2. `backend/src/routes/character.ts` - キャラクター管理API
3. `backend/src/routes/chat.ts` - チャットAPI
4. `backend/src/services/ai/claude.ts` - Claude API統合

#### 2. BytePlus API統合

**実装**:
- [ ] BytePlus t2i（Text-to-Image）統合
- [ ] BytePlus i2i（Image-to-Image）統合
- [ ] BytePlus t2v（Text-to-Video）統合
- [ ] BytePlus i2v（Image-to-Video）統合

**ファイル**:
- `backend/src/services/byteplus/t2i.ts`
- `backend/src/services/byteplus/i2i.ts`
- `backend/src/services/byteplus/t2v.ts`
- `backend/src/services/byteplus/i2v.ts`

#### 3. Gemini TTS統合

**実装**:
- [ ] Gemini TTS API統合
- [ ] 音声生成エンドポイント
- [ ] 音声ファイルのキャッシュ

**ファイル**:
- `backend/src/services/ai/gemini-tts.ts`
- `backend/src/routes/voice.ts`

#### 4. Frontend基本UI

**実装**:
- [ ] 認証画面（ログイン・登録）
- [ ] キャラクター作成画面
- [ ] チャット画面
- [ ] ステージ表示

**ファイル**:
- `frontend/app/(auth)/login/page.tsx`
- `frontend/app/(auth)/register/page.tsx`
- `frontend/app/character/create/page.tsx`
- `frontend/app/chat/[characterId]/page.tsx`
- `frontend/components/character/CharacterForm.tsx`
- `frontend/components/chat/ChatBox.tsx`

### Phase 2: ステージシステム実装

#### 1. Stage 1: 出会い（First Meet）

**実装**:
- [ ] 初対面会話イベント
- [ ] 自己紹介フロー
- [ ] 好感度システム基礎

**ファイル**:
- `backend/src/services/stage.ts`
- `backend/src/services/affection.ts`
- `frontend/components/stages/FirstMeet.tsx`

#### 2. Stage 2: デート期間（Dating）

**実装**:
- [ ] デートプラン機能
- [ ] デートシーン生成（BytePlus t2v）
- [ ] 思い出アルバム

**ファイル**:
- `backend/src/services/date.ts`
- `frontend/components/stages/Dating.tsx`
- `frontend/components/timeline/Album.tsx`

### Phase 3: ビジュアル生成

#### 1. キャラクター画像生成

**実装**:
- [ ] 初期キャラクター画像生成（t2i）
- [ ] 表情バリエーション生成（i2i）
- [ ] 画像キャッシュシステム

#### 2. シーン動画生成

**実装**:
- [ ] デートシーン動画（t2v）
- [ ] プロポーズシーン動画（t2v）
- [ ] 動画プレビュー機能

### Phase 4: 完成形

#### 1. Stage 3-5 実装

**実装**:
- [ ] Stage 3: 交際
- [ ] Stage 4: プロポーズ
- [ ] Stage 5: 結婚生活

#### 2. 通知システム

**実装**:
- [ ] 時刻ベース通知
- [ ] 記念日リマインダー
- [ ] プッシュ通知（オプション）

#### 3. 記憶・学習システム

**実装**:
- [ ] 会話履歴分析
- [ ] ユーザー好み学習
- [ ] コンテキスト管理

## 開発ツール

### Prisma Studio（データベースGUI）

```bash
cd backend
npx prisma studio
```

### 型チェック

```bash
# Backend
cd backend
npm run type-check

# Frontend
cd frontend
npm run type-check
```

### Linting

```bash
# Backend
cd backend
npm run lint

# Frontend
cd frontend
npm run lint
```

## API ドキュメント

### 認証

```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
```

### キャラクター

```
POST   /api/characters          # キャラクター作成
GET    /api/characters          # キャラクター一覧
GET    /api/characters/:id      # キャラクター詳細
PATCH  /api/characters/:id      # キャラクター更新
DELETE /api/characters/:id      # キャラクター削除
POST   /api/characters/:id/generate-image  # 画像生成
```

### 会話

```
POST /api/conversations                    # 会話セッション作成
GET  /api/conversations/:id                # 会話履歴取得
POST /api/conversations/:id/messages       # メッセージ送信
GET  /api/conversations/:id/messages       # メッセージ一覧
```

### AI生成

```
POST /api/ai/generate-character  # キャラクター画像生成（t2i）
POST /api/ai/change-expression   # 表情変更（i2i）
POST /api/ai/generate-scene      # シーン動画生成（t2v）
POST /api/ai/text-to-speech      # 音声生成（Gemini TTS）
```

## トラブルシューティング

### データベース接続エラー

```bash
# PostgreSQLが起動しているか確認
docker-compose ps

# Prismaクライアントを再生成
cd backend
npx prisma generate
```

### ポート衝突

```bash
# ポート3001が使用中の場合
lsof -ti:3001 | xargs kill -9

# ポート3000が使用中の場合
lsof -ti:3000 | xargs kill -9
```

### 型エラー

```bash
# 型定義を再生成
cd backend
npm run db:generate

cd frontend
npm run type-check
```

## リソース

- **BytePlus API Docs**: https://docs.byteplus.com
- **Gemini API Docs**: https://ai.google.dev/gemini-api/docs
- **Claude API Docs**: https://docs.anthropic.com/
- **Next.js Docs**: https://nextjs.org/docs
- **Prisma Docs**: https://www.prisma.io/docs

## サポート

質問や問題があれば、以下をチェック：

1. `docs/STAGE_SYSTEM.md` - ステージシステム詳細
2. `README.md` - プロジェクト全体概要
3. Backend API ログ - `backend/logs/`
4. Prisma Studio - データベース確認

---

**Happy Coding!** 🚀
