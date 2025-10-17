-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_characters" (
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
    "videoUrls" JSONB,
    "videosGenerated" BOOLEAN NOT NULL DEFAULT false,
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
INSERT INTO "new_characters" ("accessories", "age", "appearanceStyle", "averageResponseTime", "bio", "birthday", "bodyType", "createdAt", "customPrompt", "datesCount", "emotionalTendency", "eventsCompleted", "expressionUrls", "eyeColor", "favoriteFood", "giftsReceived", "hairColor", "hairStyle", "height", "hobbies", "id", "imagesGenerated", "interests", "lastGeneratedAt", "lastInteraction", "name", "occupation", "outfit", "personalityArchetype", "primaryImageUrl", "skinTone", "sourceImagePath", "speechStyle", "totalConversations", "totalMessages", "traits", "updatedAt", "userId", "values", "voiceId", "voicePitch", "voiceProvider", "voiceSpeed", "voiceStyle") SELECT "accessories", "age", "appearanceStyle", "averageResponseTime", "bio", "birthday", "bodyType", "createdAt", "customPrompt", "datesCount", "emotionalTendency", "eventsCompleted", "expressionUrls", "eyeColor", "favoriteFood", "giftsReceived", "hairColor", "hairStyle", "height", "hobbies", "id", "imagesGenerated", "interests", "lastGeneratedAt", "lastInteraction", "name", "occupation", "outfit", "personalityArchetype", "primaryImageUrl", "skinTone", "sourceImagePath", "speechStyle", "totalConversations", "totalMessages", "traits", "updatedAt", "userId", "values", "voiceId", "voicePitch", "voiceProvider", "voiceSpeed", "voiceStyle" FROM "characters";
DROP TABLE "characters";
ALTER TABLE "new_characters" RENAME TO "characters";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
