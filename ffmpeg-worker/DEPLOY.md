# FFmpeg Worker Deployment Guide

## Prerequisites
1. Install Fly.io CLI:
   ```bash
   # Windows (PowerShell)
   iwr https://fly.io/install.ps1 -useb | iex
   
   # Mac/Linux
   curl -L https://fly.io/install.sh | sh
   ```

2. Sign up and login:
   ```bash
   fly auth signup  # or fly auth login
   ```

## Deploy to Fly.io

### 1. Navigate to worker directory
```bash
cd ffmpeg-worker
```

### 2. Launch the app (first time only)
```bash
fly launch --no-deploy
```
- Choose app name (or use auto-generated)
- Select region (choose closest to you)
- Don't add PostgreSQL or Redis

### 3. Deploy
```bash
fly deploy
```

### 4. Get your worker URL
```bash
fly status
```
Copy the hostname (e.g., `weavy-ffmpeg-worker.fly.dev`)

## Configure Next.js App

### 1. Add environment variable
In `.env.local`:
```
FFMPEG_WORKER_URL=https://your-app-name.fly.dev
```

### 2. Rebuild and deploy Next.js
```bash
npm run build
git add .
git commit -m "Add external FFmpeg worker"
git push
```

## Test the Worker

### Health check
```bash
curl https://your-app-name.fly.dev/health
```

### Test crop endpoint
```bash
curl -X POST https://your-app-name.fly.dev/crop \
  -H "Content-Type: application/json" \
  -d '{"image": "data:image/png;base64,...", "x": 10, "y": 10, "width": 50, "height": 50}'
```

## Monitoring

View logs:
```bash
fly logs
```

Scale resources (if needed):
```bash
fly scale vm shared-cpu-1x --memory 512
```

## Cost
✅ **100% FREE** on Fly.io free tier (3 VMs with 256MB each)

## Troubleshooting

If deployment fails:
```bash
fly logs
fly status
```

Redeploy:
```bash
fly deploy --ha=false
```
