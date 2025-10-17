-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "characters" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "occupation" TEXT NOT NULL,
    "hobbies" TEXT NOT NULL,
    "favoriteFood" TEXT NOT NULL,
    "birthday" DATETIME NOT NULL,
    "bio" TEXT NOT NULL,
    "appearanceStyle" TEXT NOT NULL,
    "hairColor" TEXT NOT NULL,
    "hairStyle" TEXT NOT NULL,
    "eyeColor" TEXT NOT NULL,
    "skinTone" TEXT NOT NULL,
    "height" TEXT NOT NULL,
    "bodyType" TEXT NOT NULL,
    "outfit" TEXT NOT NULL,
    "accessories" TEXT NOT NULL,
    "customPrompt" TEXT,
    "personalityArchetype" TEXT NOT NULL,
    "traits" TEXT NOT NULL,
    "speechStyle" TEXT NOT NULL,
    "emotionalTendency" TEXT NOT NULL,
    "interests" TEXT NOT NULL,
    "values" TEXT NOT NULL,
    "voiceProvider" TEXT NOT NULL DEFAULT 'gemini',
    "voiceId" TEXT NOT NULL,
    "voicePitch" REAL NOT NULL DEFAULT 0,
    "voiceSpeed" REAL NOT NULL DEFAULT 1.0,
    "voiceStyle" TEXT NOT NULL DEFAULT 'normal',
    "sourceImagePath" TEXT,
    "primaryImageUrl" TEXT,
    "expressionUrls" JSONB,
    "imagesGenerated" BOOLEAN NOT NULL DEFAULT false,
    "lastGeneratedAt" DATETIME,
    "totalConversations" INTEGER NOT NULL DEFAULT 0,
    "totalMessages" INTEGER NOT NULL DEFAULT 0,
    "datesCount" INTEGER NOT NULL DEFAULT 0,
    "giftsReceived" INTEGER NOT NULL DEFAULT 0,
    "eventsCompleted" INTEGER NOT NULL DEFAULT 0,
    "lastInteraction" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "averageResponseTime" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "characters_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "stage_progress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "characterId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "currentStage" TEXT NOT NULL,
    "affection" REAL NOT NULL DEFAULT 0,
    "unlockedStages" TEXT NOT NULL,
    "completedEvents" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "stage_progress_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "characters" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "conversations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "stage" TEXT NOT NULL,
    "recentTopics" TEXT NOT NULL,
    "importantEvents" TEXT NOT NULL,
    "userPreferences" JSONB,
    "currentMood" TEXT NOT NULL DEFAULT 'neutral',
    "location" TEXT,
    "timeOfDay" TEXT NOT NULL,
    "totalMessages" INTEGER NOT NULL DEFAULT 0,
    "userMessages" INTEGER NOT NULL DEFAULT 0,
    "characterMessages" INTEGER NOT NULL DEFAULT 0,
    "averageResponseTime" REAL NOT NULL DEFAULT 0,
    "longestConversation" INTEGER NOT NULL DEFAULT 0,
    "lastActive" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "lastMessageAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "conversations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "conversations_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "characters" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "messages" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "conversationId" TEXT NOT NULL,
    "sender" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "emotion" TEXT,
    "expression" TEXT,
    "voiceUrl" TEXT,
    "imageUrl" TEXT,
    "videoUrl" TEXT,
    "eventId" TEXT,
    "audioLength" REAL,
    "readAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "messages_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversations" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "memories" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "characterId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "importance" REAL NOT NULL,
    "relatedEventId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "memories_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "characters" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "scenes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "characterId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "location" TEXT,
    "event" TEXT,
    "mood" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "scenes_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "characters" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "readAt" DATETIME,
    "scheduledFor" DATETIME,
    "sentAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "stage_progress_characterId_key" ON "stage_progress"("characterId");

-- CreateIndex
CREATE INDEX "messages_conversationId_createdAt_idx" ON "messages"("conversationId", "createdAt");

-- CreateIndex
CREATE INDEX "memories_characterId_importance_idx" ON "memories"("characterId", "importance");

-- CreateIndex
CREATE INDEX "notifications_userId_read_idx" ON "notifications"("userId", "read");
