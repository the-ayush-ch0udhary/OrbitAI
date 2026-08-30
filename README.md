# 🚀 Orbit AI — AI-Powered Career Guidance & Roadmap Platform

> Stop guessing your next career move. Orbit AI is an intelligent career counselor that analyzes your education, real-world skills, and CV to construct personalized, actionable step-by-step career roadmaps.

---

## ✨ Why Orbit AI? (Key Pros & Highlights)

Traditional career counseling is often generic, expensive, or outdated. **Orbit AI** bridges the gap between where you are today and where you want to be tomorrow by combining cutting-edge LLMs with your real background.

### 🌟 Pros of Orbit AI:

- **🎯 Truly Tailored Recommendations**: Instead of generic advice, Orbit AI reads your CV (PDF parsing via PyPDF2) and qualifications to suggest roles you are genuinely equipped for.
- **🗺️ Actionable Step-by-Step Milestones**: Every suggested career comes with a sequential roadmap (skills to master, real-world projects to build, and certifications to target) rather than vague bullet points.
- **🔍 Custom Role Deep-Dive**: Want to transition into a specific field (e.g. *AI Engineer*, *Cloud Architect*, *Product Manager*)? Simply search for any role, and Orbit AI will assess your alignment and build a custom bridging strategy.
- **🛡️ Secure & Private Architecture**:
  - Secure authentication with **Bcrypt** password hashing and **JWT** session tokens.
  - Interactive **Anti-Bot Visual CAPTCHA** with random distortion and noise lines to safeguard registrations.
  - BYOK (Bring Your Own Key) model: Your Google Gemini API key remains isolated in your profile or encrypted environment.
- **⚡ Dual-Engine Gemini AI Fallback**: Equipped with Google Gemini `gemini-3.6-flash` and automatic resilient fallbacks to ensure uninterrupted recommendations.
- **💾 Persistent Saved History**: All your analyses are automatically preserved in **MongoDB**, allowing you to revisit, export, and track your career growth over time.
- **📋 One-Click Export & Copy**: Easily copy full roadmap markdown plans to your clipboard or print clean PDF summaries for offline planning.
- **🌓 Modern Responsive UI**: Crafted with React 19, Tailwind CSS, Lucide/FontAwesome icons, and full support for both high-contrast Dark and Light modes.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Vite, TypeScript, Tailwind CSS, Axios, React Router v7, React Icons |
| **Backend** | FastAPI (Python 3.10+ / 3.14), Uvicorn, Pydantic, PyPDF2 |
| **Database** | MongoDB (Async Motor driver) / MongoDB Atlas |
| **AI Engine** | Google Gemini Generative AI (`gemini-3.6-flash` with multi-model fallback) |
| **Security** | JWT (JSON Web Tokens), Passlib / Bcrypt, Canvas-based CAPTCHA |

---

## 📁 Project Structure

```text
Orbit-AI/
├── backend/
│   ├── auth.py              # Password hashing, JWT token verification, user dependencies
│   ├── database.py          # Async Motor MongoDB connection, models & indexes
│   ├── gemini_service.py    # Gemini AI integration, prompts, model fallback & JSON parser
│   ├── pdf_parser.py        # PyPDF2 CV/Resume extraction from Base64
│   ├── requirements.txt     # Python backend dependencies
│   ├── server.py            # FastAPI main application & API routes
│   └── .env.example         # Backend environment variables template
│
├── frontend/
│   ├── src/
│   │   ├── components/      # React components (Dashboard, Login, ProfileForm, CareerAnalysis, etc.)
│   │   ├── context/         # AuthContext & ThemeContext providers
│   │   ├── services/        # Axios API client & interceptors
│   │   ├── types.ts         # TypeScript interfaces
│   │   └── App.tsx          # Main React router
│   ├── package.json         # Node.js dependencies & scripts
│   ├── vite.config.ts       # Vite build configuration
│   └── .env.example         # Frontend environment variables template
│
├── .gitignore               # Repository ignore rules
└── README.md                # Project documentation
```

---

## 🚀 Getting Started

Follow these simple steps to run Orbit AI locally on your machine.

### Prerequisites
- **Python 3.10+** (or Python 3.14)
- **Node.js 18+** & `npm`
- **MongoDB** (Local instance or free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster)
- **Google Gemini API Key** (Get a free key from [Google AI Studio](https://aistudio.google.com/app/apikey))

---

### 1. Clone the Repository
```bash
git clone https://github.com/the-ayush-ch0udhary/OrbitAI.git
cd OrbitAI
```

---

### 2. Configure Backend Environment
Create a `.env` file in the `backend/` directory:
```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:
```env
# MongoDB Connection URL (Local or Atlas)
MONGO_URL=mongodb://localhost:27017/orbit_ai
# or MongoDB Atlas:
# MONGO_URL=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/orbit_ai?retryWrites=true&w=majority

# Optional default Gemini API Key (Users can also enter their key in the UI)
GEMINI_API_KEY=your_gemini_api_key_here

# JWT Secret Key
SECRET_KEY=your-secret-key-change-this-in-production-min-32-chars
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080
```

---

### 3. Install Backend Dependencies & Start Server
```bash
# In the backend directory:
pip install -r requirements.txt

# Start FastAPI server:
uvicorn server:app --reload --port 8001
```
*Backend will be running at [http://localhost:8001](http://localhost:8001) (API Docs: [http://localhost:8001/docs](http://localhost:8001/docs))*

---

### 4. Install Frontend Dependencies & Start App
In a new terminal window:
```bash
cd frontend
npm install

# Start Vite development server:
npm run dev
```
*Frontend will be running at [http://localhost:3000](http://localhost:3000)*

---

## 🧭 Using Orbit AI

1. **Sign Up / Login**: Register your account using the secure sign-up form with interactive CAPTCHA verification.
2. **Build Profile**: Enter your current degree, skills, upload your resume/CV (PDF), and paste your Gemini API key.
3. **Generate Roadmaps**: Go to **Career Analysis** to let Orbit AI evaluate your background and generate top recommended career trajectories.
4. **Search Custom Roles**: Use **Search Careers** to explore any role across technology, data science, product management, or business engineering.
5. **View History**: Access **Saved History** anytime to review previous roadmaps and copy or export your plans.

---

## 🔒 Security Best Practices

- `.env` files and confidential API keys are excluded via `.gitignore`.
- Passwords are encrypted with standard Bcrypt algorithms before persisting to MongoDB.
- Bearer tokens expire automatically and are verified on all protected routes.

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).