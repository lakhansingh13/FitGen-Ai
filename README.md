# FitGen AI 🚀

FitGen AI is a premium, dark-themed, full-stack AI-powered personal trainer and sports nutrition platform. It uses real-time computer vision models to correct workout form, dynamically schedules weekly routines and diets using Google Gemini models, tracks historical fitness metrics, and gamifies user progress with active level badges.

---

## 🎨 Design & Theme
- **Theme**: Dark Futuristic Fitness Identity.
- **Accents**: Neon Green (`#39ff14`) & Neon Blue (`#00f0ff`).
- **Aesthetic**: Glassmorphism cards with subtle glows, smooth hover scaling, and responsive side panels built on Framer Motion.

---

## 🛠️ Technology Stack

### Frontend & Backend API
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4, Framer Motion
- **Icons**: Lucide React
- **Analytics**: Recharts (Custom Gradient Areas)
- **Database**: MongoDB Atlas via Mongoose
- **Auth**: JWT stored in HTTP-Only Cookies (bcryptjs password hashing)

### AI Posture Service
- **Framework**: Python FastAPI
- **CV Models**: MediaPipe Pose Landmarker
- **Video Handling**: OpenCV
- **Communication**: Full-Duplex WebSockets (Base64 JPEG streams)
- **Language Models**: Google Gemini API integration (`gemini-2.5-flash`)

---

## 📁 Repository Structure
```
FitGen Ai/
├── client/                   # Next.js App Router codebase
│   ├── app/                  # Page routes, Layouts, API endpoints
│   │   ├── api/              # Route handlers (Auth, Generative, Progress)
│   │   └── ...               # Public & Protected pages
│   ├── components/           # Navbar, Sidebar, ChatBot, TrainerCam
│   ├── lib/                  # dbConnect, auth helpers, Gemini setup
│   ├── models/               # Mongoose MongoDB schemas
│   └── package.json          # Node dependencies
├── ai-service/               # Python Pose Estimator codebase
│   ├── main.py               # FastAPI websocket server
│   ├── pose_detector.py      # MediaPipe math & OpenCV drawing overlays
│   └── requirements.txt      # Python dependencies
└── README.md                 # Complete documentation
```

---

## ⚙️ Installation & Setup

### 1. Database & Gemini Key
Ensure you have access to:
- A **MongoDB Atlas** Connection URI.
- A **Google Gemini API Key** from Google AI Studio.

### 2. Frontend / Next.js API Setup
1. Open your terminal and navigate to the `client/` folder:
   ```bash
   cd client
   ```
2. Copy `.env.example` to `.env.local`:
   ```bash
   copy .env.example .env.local
   ```
3. Open `.env.local` and fill in your keys:
   ```env
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/fitgen-ai
   JWT_SECRET=YOUR_SECURE_JWT_SECRET
   GEMINI_API_KEY=YOUR_GEMINI_API_KEY
   ```
4. Install the Node packages:
   ```bash
   npm install
   ```
5. Launch the Next.js development server:
   ```bash
   npm run dev
   ```
   The site will be active at `http://localhost:3000`.

### 3. AI Pose Tracker Setup (FastAPI)
1. Open a new terminal and navigate to the `ai-service/` folder:
   ```bash
   cd ai-service
   ```
2. Set up a Python virtual environment (Python 3.8-3.11 recommended):
   ```bash
   python -m venv venv
   ```
3. Activate the virtual environment:
   - **Windows (PowerShell)**:
     ```powershell
     .\venv\Scripts\Activate.ps1
     ```
   - **macOS/Linux**:
     ```bash
     source venv/bin/activate
     ```
4. Install the Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
5. Launch the FastAPI service:
   ```bash
   python main.py
   ```
   The socket service will listen on `ws://localhost:8000/pose`.

---

## 🚀 Deployment Guide

### Frontend & API (Vercel)
1. Connect your GitHub repository containing the `client/` folder to Vercel.
2. Set the **Root Directory** setting on Vercel to `client`.
3. Add the Environment Variables:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `GEMINI_API_KEY`
4. Deploy.

### Posture Detection WebSocket Service (Render)
1. Connect your repository to Render.
2. Select **Web Service** deployment.
3. Configure:
   - **Root Directory**: `ai-service`
   - **Runtime**: `Python`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Deploy.

---

## 🏆 Gamification Rules
- **Workout completion**: `+150 XP`
- **Weight logging**: `+50 XP`
- **Water logging**: `+10 XP`
- **Pose tracking rep**: `+5 XP`
- **Level Up threshold**: `levelNumber * 1000 XP`. Cross the threshold to increase Level and unlock custom badges!
