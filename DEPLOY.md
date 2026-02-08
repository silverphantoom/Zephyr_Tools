# Deploy PM App to Vercel

## Quick Deploy (when you have VERCEL_TOKEN)

```bash
# Install Vercel CLI
npm i -g vercel

# Login (or use token)
vercel login

# Deploy
vercel --prod
```

## GitHub Integration (Recommended)

1. Connect GitHub repo to Vercel
2. Auto-deploy on push
3. Preview deployments for PRs

## Manual Deploy

1. Go to https://vercel.com/new
2. Import `silverphantoom/Zephyr_Tools`
3. Framework: Next.js
4. Deploy

Live URL: `https://zephyr-tools.vercel.app`

## ENV Variables (if needed)
- None required for current build (localStorage only)