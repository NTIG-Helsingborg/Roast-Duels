# Setup Instructions

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
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d
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
2. Choose **"Solo"** or **"Duel"** mode
3. Create an account or login
4. Type a roast (max 200 characters)
5. Hit **Submit Roast** or **Ready to Battle**
6. Get your AI score (0-100) in 1-2 seconds! 🎉

---

## Architecture

```
Frontend (React + Vite)  →  Backend (Express)  →  SQLite Database
     :5173                    :3001                    (local file)
                           ↓
                       Groq API (Llama 3.3)
                           (API key hidden)
```

**Key Features:**
- ✅ User authentication with JWT tokens
- ✅ SQLite database for persistent storage
- ✅ Solo and Dual game modes
- ✅ Real-time leaderboards with multiple views
- ✅ Roast search functionality
- ✅ Hides API key from browser/users

---

## Project Structure

```
Roast-Duels/
├── backend/                    # Express API server
│   ├── server.js              # Main server (319 lines)
│   ├── db.js                  # SQLite database operations
│   ├── roasts.db              # SQLite database file (auto-created)
│   ├── .env                   # Environment variables (gitignored)
│   └── package.json
├── React.JS/                  # React frontend (Vite)
│   ├── src/
│   │   ├── components/
│   │   │   ├── GamePanel.jsx      # Solo roast submission + scoring
│   │   │   ├── DualGamePanel.jsx  # Head-to-head battle mode
│   │   │   ├── Leaderboard.jsx    # Multi-view leaderboards
│   │   │   ├── LoginModal.jsx     # User authentication
│   │   │   ├── LandingPage.jsx    # Game mode selection
│   │   │   ├── DrawingCanvas.jsx  # Animated graffiti background
│   │   │   ├── MusicPlayer.jsx    # Background music system
│   │   │   └── useButtonSounds.js # Audio effects
│   │   ├── utils/
│   │   │   └── auth.js            # Authentication utilities
│   │   └── App.jsx               # Main app component
│   └── package.json
└── README.md
```

---

## Production Deployment (Azure)

### Backend Deployment

1. **Deploy to Azure App Service:**
   - Upload `backend/` folder
   - Set environment variables in Azure portal:
     - **Name:** `GROQ_API_KEY` **Value:** Your Groq API key
     - **Name:** `JWT_SECRET` **Value:** Your JWT secret key
     - **Name:** `JWT_EXPIRES_IN` **Value:** `7d`
   - Note: SQLite database will be created automatically on first run

2. **Note your backend URL:**
   - Example: `https://roast-duels-backend.azurewebsites.net`

### Frontend Deployment

1. **Update API endpoints in code:**
   
   Update `React.JS/src/utils/auth.js` (line 1):
   ```javascript
   const API_URL = 'https://roast-duels-backend.azurewebsites.net';
   ```
   
   Update `React.JS/src/components/GamePanel.jsx` (line 12):
   ```javascript
   const response = await fetch('https://roast-duels-backend.azurewebsites.net/api/judge-roast', {
   ```
   
   Update `React.JS/src/components/DualGamePanel.jsx` (line 12):
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

## Security

- ✅ API key stored in backend `.env` file (gitignored)
- ✅ JWT tokens for secure authentication
- ✅ Password hashing with bcrypt
- ✅ Azure uses environment variables (no files)
- ✅ Safe for public deployment

---

## API Details

### Authentication Endpoints

**POST `/api/auth/register`** - Create new account
**POST `/api/auth/login`** - User login
**GET `/api/auth/verify`** - Verify JWT token
**PUT `/api/auth/update-username`** - Update username

### Game Endpoints

**POST `/api/judge-roast`** - Judge a roast submission
```json
{
  "roastText": "Your code is so bad, even bugs refuse to run it.",
  "userId": 123
}
```

**Response:**
```json
{
  "score": 92
}
```

### Leaderboard Endpoints

**GET `/api/leaderboard/all-time`** - Top roasts of all time
**GET `/api/leaderboard/past-7-days`** - Top roasts from past week
**GET `/api/leaderboard/recent`** - Most recent submissions
**GET `/api/leaderboard/search?q=searchterm`** - Search roasts

**Groq API rate limits (Free Tier):**
- 14,400 requests per day
- 30 requests per minute
- More than enough for a small project!

---

## 🛠️ Troubleshooting

### Backend won't start?
- Make sure you ran `npm install` in `backend/` folder
- Check that `backend/.env` has all required variables:
  - `GROQ_API_KEY=gsk_your_actual_key_here`
  - `JWT_SECRET=your_jwt_secret_here`
  - `JWT_EXPIRES_IN=7d`
- Key should start with `gsk_`

### Frontend shows "Backend server not running"?
- Backend must be running on port 3001
- Check backend terminal for errors
- Make sure both servers run simultaneously

### Authentication issues?
- Clear browser localStorage: `localStorage.clear()`
- Make sure JWT_SECRET is set in backend `.env`
- Check that passwords are at least 6 characters
- Usernames must be 3-15 characters, no spaces

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


## Game Features

### Solo Mode
- Submit individual roasts for AI judging
- View your score and performance feedback
- Compete on global leaderboards

### Dual Mode  
- Head-to-head roast battles
- Both players ready up simultaneously
- Scores revealed together for comparison

### Leaderboards
- **All-Time**: Best roasts ever submitted
- **Past 7 Days**: Recent top performers  
- **Recent**: Latest submissions
- **Search**: Find specific roasts or users

### User Features
- Account creation and login
- Editable usernames (click to change)
- Persistent roast history
- JWT-based session management

---

**Have fun roasting!**

