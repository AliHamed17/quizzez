# Python Live Quiz App - Deployment Guide

## 1. Quick Start

### Prerequisites
- Node.js installed.
- Internet connection (to install dependencies).

### Installation
Open a terminal in this folder and run:
```bash
npm install
```

### Running the Server
```bash
npm start
```
You should see: `Server running on http://localhost:3000`

## 2. Classroom Instructions

### For the Teacher (Host)
1. Open **[http://localhost:3000/host](http://localhost:3000/host)** in your browser.
2. Click **Create New Room**.
3. A Room Code (e.g., `ABC123`) will appear.
4. Project this screen on the board so students can see the code.
5. Wait for students to join (their names will appear on the screen).
6. Click **Start Quiz** when ready.

### For Students
1. Ask students to go to **[http://localhost:3000](http://localhost:3000)** (or your computer's IP address if playing from different devices on the same Wi-Fi, e.g., `http://192.168.1.5:3000`).
2. They enter a **Nickname** and the **Room Code**.
3. They wait for you to start.

### During the Quiz
- The question appears on student screens and the host screen.
- Students have 20 seconds to answer.
- Faster answers = more points.
- After time is up, the Correct Answer and Leaderboard are shown.
- Click **Next Question** to proceed.

## 3. Troubleshooting
- **No Internet?** Application works locally without internet (except for initial `npm install`).
- **Student disconnects?** They can refresh, but might lose their score if the server restarts. If just refreshing the page, they can rejoin if the server is still running, but they'll need to re-enter details (basic implementation resets score on rejoin to prevent abuse, but names are locked). *Note: In this simple version, rejoining with the same name might be blocked. Use a slightly different name if needed.*
- **Reset?** Click "Reset Room" at the end to play again.
