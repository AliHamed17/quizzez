# Deployment Guide

## 1. Localhost Fix
I have fixed the issue where `http://localhost:3000/host` was not working. You can now access:
- Student Page: [http://localhost:3000](http://localhost:3000)
- Host Page: [http://localhost:3000/host](http://localhost:3000/host)

## 2. GitHub Deployment
I have initialized a local Git repository for you. To push it to your GitHub:

1. Create a new repository on GitHub named `quizzez`.
2. Run these commands in your terminal:
   ```bash
   git remote add origin https://github.com/AliHamed17/quizzez.git
   git branch -M main
   git push -u origin main
   ```

## 3. Vercel Deployment
**Important Note**: This app uses **Socket.IO** (real-time communication) and stores game state in **memory**. Vercel is designed for static and serverless apps, which means:
- The server might "sleep" when not in use.
- Connectons might drop.
- In-memory data (scores, rooms) will be lost if the server restarts (which happens often on Vercel).

**Recommended Alternative**: [Render.com](https://render.com) or [Railway.app](https://railway.app) (Better for real-time apps).

**If you still want to try Vercel:**
1. Push your code to GitHub (Step 2).
2. Go to Vercel and Import `quizzez`.
3. Vercel should auto-detect it's a Node.js project.
4. Deploy.
   - *Note*: You might need to add a `vercel.json` configuration if it fails to start.
