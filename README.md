# TruthShield — Advanced Document Verifiability & Content Analysis

> **Subject:** Big Analytics (SE-506)
> **Student:** Ali Hunain
> **Roll Number:** 2023-ag-9918

---

## 📌 Project Overview

TruthShield is a comprehensive AI-powered digital verification platform designed to detect misinformation and fraudulent documentation in the digital age. It enables users to upload documents (PDFs/images), extract text via OCR, and run multi-layered AI analysis to generate a detailed risk profile, credibility score, and legal guidance.

### Key Features
- 🔍 **AI-Powered Analysis** — Gemini 2.5 Flash for intelligent document risk assessment
- 📄 **OCR Extraction** — Tesseract.js & PDF.js for text extraction from images and PDFs
- ⚖️ **Legal Guidance** — Contextual legal recommendations based on document type
- 🔐 **Firebase Auth** — Secure user authentication and session management
- 📊 **Dashboard** — Real-time verification history and trust score overview
- 🌐 **Fallback Pipeline** — Hugging Face fallback if primary AI is rate-limited

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + Vite, TypeScript |
| Styling | Tailwind CSS v4, Custom CSS |
| Backend | Firebase (Firestore, Storage, Auth, Cloud Functions) |
| OCR | Tesseract.js, PDF.js |
| AI Analysis | Google Gemini 2.5 Flash |
| Fallback AI | Hugging Face Inference API |

---

## ⚙️ Project Setup

Follow these steps to run the project locally from scratch.

### Prerequisites

Make sure you have the following installed:
- [Node.js](https://nodejs.org/) — v18 or higher
- [npm](https://www.npmjs.com/) — comes with Node.js
- [Git](https://git-scm.com/)
- [Firebase CLI](https://firebase.google.com/docs/cli) — install via:
  ```bash
  npm install -g firebase-tools
  ```

---

### Step 1 — Clone the Repository

```bash
git clone https://github.com/Hassan-Jamal8735/Hackathon-Project-.git
cd Hackathon-Project-
```

---

### Step 2 — Install Dependencies

```bash
npm install
```

This will install all frontend dependencies listed in `package.json`, including React, Firebase SDK, Tesseract.js, PDF.js, and Tailwind CSS.

---

### Step 3 — Configure Environment Variables

Create a `.env` file in the root of the project:

```bash
# Copy the example or create manually
touch .env
```

Add the following variables to your `.env` file:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# AI Keys
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_HF_TOKEN=your_huggingface_token

# App Behavior
VITE_USE_MOCK_AI=false
VITE_USE_LOCAL_OCR=true

# Gemini Model
GEMINI_MODEL=gemini-2.5-flash
GEMINI_DISABLE_SSL=true
```

> **How to get Firebase credentials:**
> 1. Go to [Firebase Console](https://console.firebase.google.com/)
> 2. Create a new project (or use existing)
> 3. Go to Project Settings → General → Your Apps → Web App
> 4. Copy the config values

> **How to get Gemini API Key:**
> 1. Visit [Google AI Studio](https://aistudio.google.com/)
> 2. Create an API key and paste it as `VITE_GEMINI_API_KEY`

> **How to get Hugging Face Token:**
> 1. Visit [huggingface.co](https://huggingface.co/settings/tokens)
> 2. Create an access token and paste it as `VITE_HF_TOKEN`

---

### Step 4 — Firebase Setup

#### 4a. Login to Firebase
```bash
firebase login
```

#### 4b. Initialize Firebase (if not already done)
```bash
firebase init
```
Select: **Firestore**, **Storage**, **Authentication**, **Functions**

#### 4c. Deploy Firestore Rules & Indexes
```bash
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
firebase deploy --only storage:rules
```

#### 4d. (Optional) Install Cloud Functions Dependencies
```bash
cd functions
npm install
cd ..
```

#### 4e. (Optional) Deploy Cloud Functions
```bash
firebase deploy --only functions
```

---

### Step 5 — Run the Development Server

```bash
npm run dev
```

The app will start at: **http://localhost:5173**

---

### Step 6 — (Optional) Run with Firebase Emulators

To run the app with local Firebase emulators (no live Firebase needed):

```bash
npm run dev:with-emulators
```

This starts both the Vite dev server and Firebase emulators simultaneously.

---

## 📁 Project Structure

```
truthshield/
├── src/
│   ├── components/        # Reusable UI components (Navbar, buttons, cards, etc.)
│   │   ├── dashboard/     # Dashboard-specific components
│   │   ├── layout/        # Navbar and layout wrappers
│   │   ├── ui/            # Base UI elements (Button, Input, Loader)
│   │   └── upload/        # Upload flow components
│   ├── pages/             # Route-level pages
│   │   ├── Home.tsx       # Landing page
│   │   ├── Dashboard.jsx  # User dashboard with stats & history
│   │   ├── Upload.jsx     # Document upload & analysis trigger
│   │   ├── Analysis.jsx   # Detailed analysis result view
│   │   ├── Legal.jsx      # Legal guidance page
│   │   ├── Login.jsx      # Authentication - Login
│   │   └── Register.jsx   # Authentication - Register
│   ├── hooks/             # Custom React hooks (useAuth, etc.)
│   ├── services/          # Firebase & AI API service layers
│   ├── context/           # React context providers
│   ├── utils/             # Utility/helper functions
│   ├── types/             # TypeScript type definitions
│   └── main.jsx           # Application entry point
├── functions/             # Firebase Cloud Functions (Node.js)
├── public/                # Static assets
├── .env                   # Environment variables (not committed to Git)
├── firebase.json          # Firebase configuration
├── firestore.rules        # Firestore security rules
├── firestore.indexes.json # Firestore composite indexes
├── storage.rules          # Firebase Storage security rules
├── vite.config.js         # Vite build configuration
└── package.json           # Project dependencies and scripts
```

---

## 🚀 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server at localhost:5173 |
| `npm run build` | Build production bundle to `/dist` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint for code quality checks |
| `npm run emulators:start` | Start Firebase emulators only |
| `npm run dev:with-emulators` | Start dev server + Firebase emulators |

---

## 🔒 Security Notes

- Never commit your `.env` file — it's already in `.gitignore`
- Firebase security rules are configured in `firestore.rules` and `storage.rules`
- All user data is stored under authenticated user IDs in Firestore

---

## 📚 Subject Context

This project was developed as part of the coursework for:

| Detail | Value |
|---|---|
| Subject | Big Analytics |
| Subject Code | SE-506 |
| Student Name | Ali Hunain |
| Roll Number | 2023-ag-9918 |

TruthShield demonstrates the application of **big data analytics principles** through:
- Large-scale document ingestion and text extraction (OCR pipeline)
- AI/ML model integration for pattern recognition and risk classification
- Real-time data persistence and retrieval via cloud infrastructure (Firebase)
- Multi-source API orchestration with intelligent fallback mechanisms
