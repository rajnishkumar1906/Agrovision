# 🌾 AgroVision - AI-Powered Agricultural Platform

AgroVision is a modern, microservices-based platform designed to empower farmers with advanced AI tools. It provides crop recommendations, disease detection, and an intelligent multilingual chatbot (KrishiBot) to improve agricultural productivity.

---

## ✨ Features

- **🌱 Crop Recommendation**: Suggests the best crops based on soil nutrients (N, P, K, pH) and real-time weather data.
- **🔬 Disease Detection**: Identifies plant diseases from leaf images using deep learning.
- **🤖 KrishiBot**: A multilingual AI assistant (English, Hindi, Punjabi) for farming queries, powered by Gemini and RAG.
- **🌍 Multilingual UI**: Fully translated interface in English, Hindi, and Punjabi.
- **📊 History Tracking**: Logs and tracks all previous recommendations and detections.
- **🌦️ Real-time Weather**: Integrated weather data for precise farm management.
- **📱 Modern UI/UX**: Clean, responsive dashboard with professional agricultural aesthetics.

---

## 🛠️ Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, Lucide Icons, i18next.
- **API Gateway**: Node.js, Express (Centralized entry point).
- **Microservices**:
  - **Auth Service**: Node.js, Express, MongoDB.
  - **History Service**: Node.js, Express, MongoDB.
  - **AI Services**: Python 3.11, FastAPI, TensorFlow, Scikit-learn.
  - **KrishiBot**: Python, RAG (FAISS), Gemini AI.
- **Databases**: MongoDB (Users/History), Redis (Caching), FAISS (Vector Store).
- **Infrastructure**: Docker, Docker Compose.

---

## 📁 Project Structure

```text
Agro-vision/
├── agri-microservice/
│   ├── auth-service/           # User Authentication
│   ├── crop-recomendation-system/ # AI Crop Advice
│   ├── disease-detection/      # Leaf Image Analysis
│   ├── gateway/                # API Gateway
│   ├── history-service/        # Activity Logging
│   └── krishibot/              # RAG-based AI Chatbot
├── frontend/                   # React Frontend (Vite)
├── docker-compose.yml          # Docker Orchestration
└── RUN_ALL_SERVICES.ps1        # Local Windows Startup Script
```

---

## � Getting Started

### Prerequisites
- **Docker & Docker Compose** (Recommended)
- **Node.js v18+** & **Python 3.11** (For manual setup)
- **MongoDB** (For manual setup)

### Option 1: Running with Docker (easiest)

1. **Clone the repo**:
   ```bash
   git clone https://github.com/rajnishkumar1906/Agro-vision.git
   cd Agro-vision
   ```

2. **Set up Environment Variables**:
   Create a `.env` file in the root directory (refer to `.env.example` in services).

3. **Build and Start**:
   ```bash
   docker compose up -d --build
   ```

4. **Access the App**:
   - **Frontend**: `http://localhost:5173`
   - **Gateway**: `http://localhost:3000`

---

### Option 2: Manual Local Setup

#### 1. Python Environment (Mandatory: Python 3.11)
```bash
# Create and activate venv
python -m venv .venv
source .venv/bin/activate  # or .venv\Scripts\activate on Windows

# Install dependencies
pip install -r requirements.txt
```

#### 2. Install Node.js Dependencies
```bash
# Run in gateway, auth-service, history-service, and frontend
npm install
```

#### 3. Run Services
You can use the provided [agro.ps1](file:///f:/Agro-vision/agro.ps1) or [RUN_ALL_SERVICES.ps1](file:///f:/Agro-vision/RUN_ALL_SERVICES.ps1) on Windows, or start them manually:
- **Auth**: `npm run dev` (Port 4001)
- **History**: `npm run dev` (Port 8003)
- **Gateway**: `npm run server` (Port 5001)
- **AI Services**: `python main.py` (Ports 8001, 8002, 8003)
- **Frontend**: `npm run dev` (Port 5173)

---

## 🌍 Multilingual Support

The platform supports **English (en)**, **Hindi (hi)**, and **Punjabi (pa)**. 
- Language can be toggled in the Header.
- Backend services automatically adapt based on the user's preferred language.

---

## 🔧 Troubleshooting

- **Vite Import Errors**: Ensure `src/i18n.js` and `src/translations.js` exist in the frontend folder.
- **Docker TLS Handshake Timeout**: This is usually a network issue. Restart Docker Desktop or try a different internet connection.
- **YAML Errors**: Ensure `docker-compose.yml` does not have duplicate keys (like `version`).

---

## 👥 Authors

- **Rajnish Kumar** - *Lead Developer*

## 🙏 Acknowledgments

- **Google Gemini** for LLM capabilities.
- **Open-Meteo** for weather data.
- **Unsplash** for professional agricultural imagery.

---
**AgroVision** - Empowering the hands that feed us. 🌾
