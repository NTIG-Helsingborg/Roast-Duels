# 🚀 Setup Instructions

Complete guide to get Roast Battles running on your machine.

---

## Prerequisites

- Node.js (v16 or higher)
- npm
- Groq API key (free)

---

## Quick Start

### Step 1: Get Your FREE Groq API Key

1. Go to **https://console.groq.com**
2. Sign up (no credit card required)
3. Click **"API Keys"** → **"Create API Key"**
4. Copy the key (starts with `gsk_`)

### Step 2: Setup Backend

```bash
cd backend
npm install
```

Create `backend/.env` file and add your key:
```
GROQ_API_KEY=gsk_your_actual_key_here
```

Start the backend server:
```bash
npm start
```

✅ Backend running on **http://localhost:3001**

### Step 3: Setup Frontend (New Terminal)

```bash
cd React.JS
npm install
npm run dev
```

✅ Frontend running on **http://localhost:5173**

### Step 4: Test It!

1. Open **http://localhost:5173** in your browser
2. Click **"Solo"** or **"Duel"**
3. Type a roast
4. Hit **Submit Roast**
5. Get your AI score (0-100) in 1-2 seconds! 🎉

---

## Architecture

```
Frontend (React)  →  Backend (Express)  →  Groq API (Llama 3.3)
     :5173              :3001               (API key hidden)
```

**Why a backend?**
- ✅ Hides API key from browser (security)
- ✅ Safe for production deployment
- ✅ Prevents key theft from DevTools

---

## Project Structure

```
Roast-Duels/
├── backend/              # Express API server
│   ├── server.js         # Main server (68 lines)
│   ├── .env              # Your Groq API key (gitignored)
│   └── package.json
├── React.JS/             # React frontend
│   └── src/
│       └── components/
│           ├── GamePanel.jsx    # Roast submission + scoring
│           └── Leaderboard.jsx  # Top 10 roasts
└── README.md
```

---

## 🌐 Production Deployment (Azure)

### Backend Deployment

1. **Deploy to Azure App Service:**
   - Upload `backend/` folder
   - Set environment variable in Azure portal:
     - **Name:** `GROQ_API_KEY`
     - **Value:** Your Groq API key

2. **Note your backend URL:**
   - Example: `https://roast-duels-backend.azurewebsites.net`

### Frontend Deployment

1. **Update API endpoint in code:**
   
   Open `React.JS/src/components/GamePanel.jsx` (line 8)
   
   Change from:
   ```javascript
   const response = await fetch('http://localhost:3001/api/judge-roast', {
   ```
   
   To your Azure backend URL:
   ```javascript
   const response = await fetch('https://roast-duels-backend.azurewebsites.net/api/judge-roast', {
   ```

2. **Build and deploy frontend:**
   ```bash
   cd React.JS
   npm run build
   ```
   
   Deploy the `dist/` folder to **Azure Static Web Apps**

---

## 🔐 Security

- ✅ API key stored in backend `.env` file (gitignored)
- ✅ Never exposed to browser/client
- ✅ Azure uses environment variables (no files)
- ✅ Safe for public deployment

---

## 🤖 API Details

### Endpoint: POST `/api/judge-roast`

**Request:**
```json
{
  "roastText": "Your code is so bad, even bugs refuse to run it."
}
```

**Response:**
```json
{
  "score": 92
}
```

**Rate Limits (Free Tier):**
- 14,400 requests per day
- 30 requests per minute
- More than enough for development!

---

## 🛠️ Troubleshooting

### Backend won't start?
- Make sure you ran `npm install` in `backend/` folder
- Check that `backend/.env` has your Groq API key
- Key should start with `gsk_`

### Frontend shows "Backend server not running"?
- Backend must be running on port 3001
- Check backend terminal for errors
- Make sure both servers run simultaneously

### PowerShell script execution errors?
Run this once:
```bash
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Need help?
- Check the [Groq documentation](https://console.groq.com/docs)
- Verify your API key is valid
- Make sure both servers are running in separate terminals

---

## Team Development

Each team member should:
1. Get their own FREE Groq API key
2. Create their own `backend/.env` file locally
3. Never commit `.env` to git (already in `.gitignore`)

This gives each person 14,400 requests/day and keeps keys secure!

---

**Have fun roasting! 🔥**

