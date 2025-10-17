# BytePlus API Testing Guide

This guide shows how to test all four BytePlus API integrations: T2I, I2I, I2V, and T2V.

## Prerequisites

Add your BytePlus API credentials to `backend/.env`:

```bash
BYTEPLUS_API_KEY=your_api_key_here
BYTEPLUS_API_ENDPOINT=https://ark.ap-southeast-1.bytepluses.com
BYTEPLUS_T2I_MODEL=seedream-3-0-t2i-250415
BYTEPLUS_I2I_MODEL=seededit-3-0-i2i-250628
BYTEPLUS_I2V_MODEL=seedance-1-0-pro-250528
BYTEPLUS_T2V_MODEL=seedance-1-0-pro-250528
```

## 1. Text-to-Image (T2I) API

### Test via curl

```bash
curl -X POST http://localhost:3001/api/test/t2i \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "prompt": "A beautiful anime girl with long black hair, wearing a casual dress, smiling warmly",
    "size": "1024x1024",
    "guidanceScale": 5,
    "watermark": false
  }'
```

### Direct API Call

```bash
curl -X POST https://ark.ap-southeast-1.bytepluses.com/api/v3/images/generations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_BYTEPLUS_API_KEY" \
  -d '{
    "model": "seedream-3-0-t2i-250415",
    "prompt": "A beautiful anime character portrait, high quality",
    "response_format": "url",
    "size": "1024x1024",
    "guidance_scale": 3,
    "watermark": false
  }'
```

### Expected Response

```json
{
  "data": [
    {
      "url": "https://example.com/generated-image.png",
      "width": 1024,
      "height": 1024
    }
  ]
}
```

---

## 2. Image-to-Image (I2I) API

### Test via curl

```bash
curl -X POST http://localhost:3001/api/test/i2i \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "prompt": "Make the character smile warmly",
    "imageUrl": "https://example.com/original-image.png",
    "size": "adaptive",
    "guidanceScale": 5.5,
    "watermark": false
  }'
```

### Direct API Call

```bash
curl -X POST https://ark.ap-southeast-1.bytepluses.com/api/v3/images/generations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_BYTEPLUS_API_KEY" \
  -d '{
    "model": "seededit-3-0-i2i-250628",
    "prompt": "Make the character smile warmly",
    "image": "https://example.com/original-image.png",
    "response_format": "url",
    "size": "adaptive",
    "guidance_scale": 5.5,
    "watermark": false
  }'
```

### Expected Response

```json
{
  "data": [
    {
      "url": "https://example.com/transformed-image.png",
      "width": 1024,
      "height": 1024
    }
  ]
}
```

---

## 3. Image-to-Video (I2V) API

### Test via curl - Task Creation

```bash
curl -X POST http://localhost:3001/api/test/i2v \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "prompt": "Animate the character waving hand and smiling",
    "imageUrl": "https://example.com/character-image.png",
    "options": {
      "resolution": "1080p",
      "duration": 5,
      "cameraFixed": true
    }
  }'
```

### Direct API Call - Create Task

```bash
curl -X POST https://ark.ap-southeast-1.bytepluses.com/api/v3/video_generation/submit \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_BYTEPLUS_API_KEY" \
  -d '{
    "model": "seedance-1-0-pro-250528",
    "content": [
      {
        "type": "text",
        "text": "Animate the character waving hand --resolution 1080p --duration 5 --camerafixed true"
      },
      {
        "type": "image_url",
        "image_url": {
          "url": "https://example.com/character-image.png"
        }
      }
    ]
  }'
```

### Query Task Status

```bash
curl -X GET http://localhost:3001/api/test/i2v/TASK_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Direct API Call - Query Task

```bash
curl -X GET https://ark.ap-southeast-1.bytepluses.com/api/v3/video_generation/query?id=TASK_ID \
  -H "Authorization: Bearer YOUR_BYTEPLUS_API_KEY"
```

### Expected Response (Task Created)

```json
{
  "id": "task_12345",
  "status": "pending",
  "model": "seedance-1-0-pro-250528",
  "created_at": "2025-10-16T20:00:00Z"
}
```

### Expected Response (Task Completed)

```json
{
  "id": "task_12345",
  "status": "completed",
  "model": "seedance-1-0-pro-250528",
  "created_at": "2025-10-16T20:00:00Z",
  "output": {
    "video_url": "https://example.com/generated-video.mp4",
    "duration": 5,
    "resolution": "1080p"
  }
}
```

---

## 4. Text-to-Video (T2V) API

### Test via curl - Task Creation

```bash
curl -X POST http://localhost:3001/api/test/t2v \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "prompt": "Two anime characters having a romantic dinner at a fancy restaurant, candlelight, beautiful ambiance",
    "options": {
      "resolution": "1080p",
      "duration": 10,
      "cameraFixed": false
    }
  }'
```

### Direct API Call - Create Task

```bash
curl -X POST https://ark.ap-southeast-1.bytepluses.com/api/v3/video_generation/submit \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_BYTEPLUS_API_KEY" \
  -d '{
    "model": "seedance-1-0-pro-250528",
    "content": [
      {
        "type": "text",
        "text": "Two anime characters having a romantic dinner at a fancy restaurant --resolution 1080p --duration 10 --camerafixed false"
      }
    ]
  }'
```

### Query Task Status

```bash
curl -X GET http://localhost:3001/api/test/t2v/TASK_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Expected Response (Same as I2V)

See I2V response format above.

---

## Testing Through Frontend

### 1. Character Image Generation (T2I)

1. Create a character at `/character/create`
2. Go to character detail page `/character/[id]`
3. Click "画像を生成" button
4. Wait for image generation (uses T2I API)

### 2. Expression Generation (I2I)

1. Go to character detail page with existing image
2. Select expression from dropdown (smile, happy, sad, etc.)
3. Click "表情を生成" button
4. View generated expression (uses I2I API)

### 3. Character Animation (I2V)

Coming soon - requires API route implementation

### 4. Scene Generation (T2V)

Coming soon - requires API route implementation

---

## Troubleshooting

### 1. API Key Issues

**Error**: `401 Unauthorized`

**Solution**: 
- Check `BYTEPLUS_API_KEY` in `.env`
- Verify API key is active on BytePlus dashboard
- Ensure no extra spaces in the key

### 2. Model Not Found

**Error**: `404 Model not found`

**Solution**:
- Verify model IDs in `.env`
- Check BytePlus documentation for current model names
- Update model IDs if they've changed

### 3. Image URL Issues

**Error**: `Invalid image URL`

**Solution**:
- Ensure image URLs are publicly accessible
- Use HTTPS URLs only
- Check image format (PNG, JPG supported)

### 4. Task Timeout

**Error**: `Task timeout after 5 minutes`

**Solution**:
- Video generation can take 2-5 minutes
- Implement polling with exponential backoff
- Use webhooks if available

---

## API Rate Limits

**BytePlus Typical Limits**:
- T2I: 100 requests/minute
- I2I: 100 requests/minute
- I2V: 10 tasks/minute (async)
- T2V: 10 tasks/minute (async)

Check your BytePlus dashboard for exact limits.

---

## Next Steps

1. Test each API endpoint with curl
2. Verify responses match expected format
3. Implement frontend UI for I2V and T2V
4. Add error handling and retry logic
5. Implement task polling for async operations
6. Add progress indicators for video generation

