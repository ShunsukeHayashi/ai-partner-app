# ステージシステム設計書

## 概要

AI Partner Appの恋愛・結婚体験は5つのステージで構成されます。
各ステージは好感度によって解放され、異なる機能・イベントを提供します。

## ステージ一覧

### Stage 1: 出会い（first_meet）

**解放条件**: キャラクター作成完了（初期状態）

**好感度範囲**: 0% - 20%

**主要機能**:
- 初対面会話イベント
- 自己紹介
- 連絡先交換
- 第一印象形成

**イベント**:
- `initial_greeting`: 初回挨拶
- `self_introduction`: 自己紹介
- `contact_exchange`: 連絡先交換
- `first_impression`: 第一印象評価

**ビジュアル生成**:
- キャラクター初期画像（BytePlus t2i）
- 基本表情セット（neutral, smile, shy）

**会話トピック**:
- 趣味
- 仕事・学校
- 好きな食べ物
- 休日の過ごし方

---

### Stage 2: デート期間（dating）

**解放条件**: 好感度 20% 以上

**好感度範囲**: 20% - 50%

**主要機能**:
- デートプラン作成
- デートシーン生成
- 思い出アルバム
- プレゼント機能

**イベント**:
- `first_date`: 初デート
- `movie_date`: 映画デート
- `cafe_date`: カフェデート
- `park_date`: 公園デート
- `aquarium_date`: 水族館デート
- `gift_exchange`: プレゼント交換

**ビジュアル生成**:
- デートシーン動画（BytePlus t2v）
  - カフェでの会話シーン
  - 公園での散歩シーン
  - 映画館シーン
- 表情変化（BytePlus i2i）
  - happy, excited, blushing, surprised

**会話トピック**:
- 将来の夢
- 恋愛観
- 理想のデート
- 好きなタイプ

---

### Stage 3: 告白・交際（relationship）

**解放条件**: 好感度 50% 以上

**好感度範囲**: 50% - 80%

**主要機能**:
- 告白イベント
- 記念日管理
- カップル日常会話
- ペット名設定

**イベント**:
- `confession`: 告白イベント
- `first_anniversary`: 1ヶ月記念
- `three_months`: 3ヶ月記念
- `half_year`: 半年記念
- `date_night`: デートナイト
- `christmas`: クリスマスイベント
- `valentines`: バレンタインイベント
- `birthday`: 誕生日イベント

**ビジュアル生成**:
- 告白シーン（BytePlus t2v）
- カップル写真（BytePlus i2i）
- 記念日イベント画像（BytePlus t2i）
- 表情: in_love, tender, emotional

**会話トピック**:
- 記念日の思い出
- 将来の計画
- お互いの好きなところ
- 恋人としての日常

---

### Stage 4: プロポーズ（proposal）

**解放条件**: 好感度 80% 以上

**好感度範囲**: 80% - 100%

**主要機能**:
- プロポーズ準備
- 指輪選択
- プロポーズシーン
- 婚約者モード

**イベント**:
- `ring_shopping`: 指輪選び
- `proposal_planning`: プロポーズ計画
- `proposal`: プロポーズシーン
- `engagement_party`: 婚約パーティー
- `wedding_planning`: 結婚式準備

**ビジュアル生成**:
- プロポーズシーン動画（BytePlus t2v）
  - レストラン
  - 夜景スポット
  - ビーチサンセット
- 指輪画像（BytePlus t2i）
- 婚約写真（BytePlus i2i）
- 表情: emotional, tears_of_joy, overwhelmed

**会話トピック**:
- 結婚への想い
- 両親への挨拶
- 結婚式の希望
- 新生活の計画

---

### Stage 5: 結婚生活（marriage）

**解放条件**: プロポーズ成功（好感度 100%）

**好感度範囲**: 100% 維持

**主要機能**:
- 新婚生活シミュレーション
- 日常ルーティン
- 記念日イベント自動生成
- ライフイベント

**日常ルーティン**:
- `morning_routine`: 朝の挨拶・会話
  - 「おはよう」
  - 天気の話
  - 今日の予定
- `work_return`: 仕事・外出から帰宅時
  - 「おかえり」
  - 疲れを癒す会話
  - 夕食の話
- `dinner_time`: 夕食時
  - 食事の感想
  - 今日あった出来事
- `evening_chat`: 夜のリラックスタイム
  - テレビ・趣味の話
  - 明日の計画
- `bedtime`: 就寝前
  - 「おやすみ」
  - 愛情表現

**記念日イベント**:
- `wedding_anniversary`: 結婚記念日
- `monthly_anniversary`: 月ごと記念日
- `birthday`: 誕生日
- `christmas`: クリスマス
- `new_year`: お正月
- `valentines`: バレンタイン
- `white_day`: ホワイトデー

**ライフイベント**:
- `house_hunting`: 家探し
- `pet_adoption`: ペットを飼う
- `vacation_planning`: 旅行計画
- `family_visit`: 実家訪問

**ビジュアル生成**:
- 結婚式シーン（BytePlus t2v）
- 新婚生活シーン（BytePlus t2v）
  - リビングでの会話
  - キッチンでの料理
  - ベッドルーム
- 記念写真（BytePlus i2i）
- 表情: content, loving, peaceful, playful

**会話トピック**:
- 夫婦としての日常
- 将来の家族計画
- 共同生活の工夫
- お互いへの感謝

---

## 好感度システム

### 好感度の計算

好感度は以下の要素で上昇：

```typescript
interface AffectionCalculation {
  baseValue: number;           // 基礎値
  conversationFrequency: number;  // 会話頻度（日毎）
  dateCount: number;           // デート回数
  eventParticipation: number;  // イベント参加数
  giftGiven: number;           // プレゼント数
  responseQuality: number;     // 会話の質（AIが評価）
}

// 好感度上昇式
affection = baseValue
  + (conversationFrequency * 2)
  + (dateCount * 5)
  + (eventParticipation * 3)
  + (giftGiven * 4)
  + (responseQuality * 1.5)
```

### 好感度レベル

| 範囲 | レベル | ステージ | 関係性 |
|------|--------|----------|--------|
| 0-20% | Level 1 | first_meet | 知り合い |
| 20-50% | Level 2 | dating | 友達以上恋人未満 |
| 50-80% | Level 3 | relationship | 恋人 |
| 80-100% | Level 4 | proposal | 婚約者 |
| 100% | Level 5 | marriage | 配偶者 |

### 好感度減少条件

- 7日以上会話なし: -5% / 日
- イベント無視: -10%
- 不適切な返答: -2%

---

## ステージ遷移フロー

```
┌─────────────────────────────────────────────────────────┐
│ Character Creation                                       │
│ - 外見・性格・声の設定                                     │
│ - プロフィール作成                                         │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│ Stage 1: First Meet (0-20%)                             │
│ - 初対面会話                                              │
│ - 自己紹介・連絡先交換                                     │
│ - 第一印象形成                                            │
└─────────────────┬───────────────────────────────────────┘
                  │ 好感度 20% 達成
                  ▼
┌─────────────────────────────────────────────────────────┐
│ Stage 2: Dating (20-50%)                                │
│ - デート計画・実施                                         │
│ - 思い出作り                                              │
│ - プレゼント交換                                          │
└─────────────────┬───────────────────────────────────────┘
                  │ 好感度 50% 達成
                  ▼
┌─────────────────────────────────────────────────────────┐
│ Stage 3: Relationship (50-80%)                          │
│ - 告白イベント                                            │
│ - 記念日管理                                              │
│ - カップル日常生活                                        │
└─────────────────┬───────────────────────────────────────┘
                  │ 好感度 80% 達成
                  ▼
┌─────────────────────────────────────────────────────────┐
│ Stage 4: Proposal (80-100%)                             │
│ - 指輪選び                                               │
│ - プロポーズ計画                                          │
│ - プロポーズシーン                                        │
└─────────────────┬───────────────────────────────────────┘
                  │ プロポーズ成功
                  ▼
┌─────────────────────────────────────────────────────────┐
│ Stage 5: Marriage (100%)                                │
│ - 結婚式                                                 │
│ - 新婚生活                                               │
│ - 日常ルーティン・記念日イベント                           │
└─────────────────────────────────────────────────────────┘
```

---

## イベントトリガーシステム

### 時刻ベーストリガー

```typescript
interface TimeBasedTrigger {
  time: string;        // "07:00", "18:00", "22:00"
  event: string;       // "morning_routine", "work_return", "bedtime"
  stage: StageType;    // イベントが発生するステージ
  frequency: string;   // "daily", "weekly", "monthly"
}

// 例
const triggers: TimeBasedTrigger[] = [
  { time: "07:00", event: "morning_routine", stage: "marriage", frequency: "daily" },
  { time: "18:00", event: "work_return", stage: "marriage", frequency: "daily" },
  { time: "22:00", event: "bedtime", stage: "marriage", frequency: "daily" },
];
```

### 日付ベーストリガー

```typescript
interface DateBasedTrigger {
  date: Date;          // 記念日
  event: string;       // "anniversary", "birthday"
  stage: StageType;
  recurring: boolean;  // 毎年繰り返すか
}

// 例
const dateBasedTriggers: DateBasedTrigger[] = [
  {
    date: new Date("2025-01-01"),
    event: "new_year",
    stage: "all",
    recurring: true
  },
  {
    date: new Date("2025-02-14"),
    event: "valentines",
    stage: "relationship",
    recurring: true
  },
];
```

### 好感度ベーストリガー

```typescript
interface AffectionBasedTrigger {
  threshold: number;      // 好感度閾値
  event: string;
  triggerOnce: boolean;   // 一度だけ発火
}

// 例
const affectionTriggers: AffectionBasedTrigger[] = [
  { threshold: 20, event: "unlock_dating", triggerOnce: true },
  { threshold: 50, event: "unlock_relationship", triggerOnce: true },
  { threshold: 80, event: "unlock_proposal", triggerOnce: true },
  { threshold: 100, event: "unlock_marriage", triggerOnce: true },
];
```

---

## ビジュアル生成戦略

### キャラクター画像（t2i）

**初期生成**:
```typescript
const characterPrompt = `
A beautiful anime-style character with ${appearance.hairColor} hair,
${appearance.eyeColor} eyes, wearing ${appearance.outfit}.
Style: ${appearance.style} (realistic/anime/manga).
Expression: neutral, high quality, detailed.
`;
```

**表情バリエーション（i2i）**:
- neutral（基本）
- smile（笑顔）
- happy（喜び）
- shy（恥ずかしい）
- surprised（驚き）
- in_love（恋する表情）
- tears_of_joy（嬉し涙）

### シーン動画（t2v）

**デートシーン**:
```typescript
const dateScenePrompt = `
Anime-style couple on a date at ${location}.
${character.name} with ${appearance.description}.
Scene: ${dateType} (cafe/park/movie/aquarium).
Mood: romantic, happy, high quality animation.
`;
```

**プロポーズシーン**:
```typescript
const proposalPrompt = `
Romantic proposal scene at ${location} during ${timeOfDay}.
Man proposing to ${character.name} with ${appearance.description}.
She shows ${emotion} expression.
Beautiful lighting, emotional atmosphere, cinematic quality.
`;
```

---

## 会話コンテキスト管理

### コンテキスト構造

```typescript
interface ConversationContext {
  userId: string;
  characterId: string;
  stage: StageType;
  affection: number;
  recentTopics: string[];        // 最近の話題
  importantEvents: Event[];      // 重要イベント
  userPreferences: Record<string, any>; // ユーザーの好み
  conversationHistory: Message[]; // 最近の会話（最大50件）
}
```

### Claude API プロンプト構築

```typescript
const systemPrompt = `
あなたは${character.name}です。${character.personality}な性格で、${character.hobbies}が趣味です。

現在の関係: ${stage.displayName}
好感度: ${affection}%

ユーザーとの関係性に応じて、適切な距離感・言葉遣いで応答してください。
最近の会話内容を考慮し、一貫性のある応答を心がけてください。

最近の話題: ${recentTopics.join(", ")}
重要なイベント: ${importantEvents.map(e => e.name).join(", ")}
`;
```

---

## 実装優先順位

### Phase 1: 基本機能（MVP）
1. キャラクター作成（t2i）
2. テキストチャット（Claude API）
3. Stage 1: First Meet
4. 好感度システム基本実装

### Phase 2: ビジュアル拡張
1. 表情変化（i2i）
2. 音声合成（Gemini TTS）
3. Stage 2: Dating
4. デートシーン生成（t2v）

### Phase 3: 体験深化
1. Stage 3: Relationship
2. 記念日システム
3. イベント自動生成
4. 思い出アルバム

### Phase 4: 最終ステージ
1. Stage 4: Proposal
2. Stage 5: Marriage
3. 日常ルーティン
4. 通知システム

---

## まとめ

このステージシステムにより、ユーザーは段階的に深まる関係性を体験できます。
各ステージは独自のイベント・機能を提供し、好感度システムによって自然な進行を実現します。
