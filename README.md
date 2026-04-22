Here's a comprehensive **README.md** for your AgroVision project:

## **README.md**

```markdown
# 🌾 AgroVision - AI-Powered Agricultural Assistant

AgroVision is a comprehensive AI-powered platform for farmers, offering crop recommendation, disease detection, and an intelligent chatbot (KrishiBot) for agricultural guidance.

## 📋 Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Services](#running-the-services)
- [API Endpoints](#api-endpoints)
- [Environment Variables](#environment-variables)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

## ✨ Features

### 🌱 Crop Recommendation
- AI-based crop suggestion based on soil nutrients (N, P, K)
- Weather parameters (temperature, humidity, rainfall)
- pH level analysis
- Multi-language support (English, Hindi, Punjabi)

### 🔬 Disease Detection
- Plant disease identification from leaf images
- TensorFlow-based deep learning model
- Fast and accurate predictions

### 🤖 KrishiBot Chatbot
- Voice-enabled agricultural assistant
- RAG (Retrieval-Augmented Generation) system
- Gemini AI integration
- Multi-language support
- Text and voice queries

### 📊 History Tracking
- User prediction history
- MongoDB-based storage
- Crop recommendation history
- Disease detection records

### 🔐 Authentication
- JWT-based user authentication
- Secure API access
- User profile management

## 🛠️ Tech Stack

### Backend Services
| Service | Technology | Port |
|---------|-----------|------|
| Gateway | Node.js + Express | 5001 |
| Auth | Node.js + Express | 4000 |
| History | Node.js + Express | 8003 |
| CropRec | Python + FastAPI | 8001 |
| Disease | Python + FastAPI | 8002 |
| KrishiBot | Python + FastAPI | 8000 |

### Databases
- **MongoDB** - User data and history
- **Vector Store** - KrishiBot RAG system

### AI/ML
- **TensorFlow** - Disease detection & Crop recommendation
- **Transformers** - KrishiBot LLM integration
- **Scikit-learn** - Crop prediction models
- **Sentence-Transformers** - Embeddings for RAG

### Frontend
- **React + Vite** - Modern UI framework
- **Tailwind CSS** - Styling
- **Lucide Icons** - Icon library

## 📁 Project Structure

```
Agro-Vision/
├── agri-microservice/
│   ├── gateway/              # API Gateway (Node.js)
│   ├── auth/                 # Authentication Service (Node.js)
│   ├── history/              # History Service (Node.js)
│   ├── croprec/              # Crop Recommendation (Python/FastAPI)
│   │   ├── main.py
│   │   ├── model.pkl
│   │   ├── standscaler.pkl
│   │   └── minmaxscaler.pkl
│   ├── disease/              # Disease Detection (Python/FastAPI)
│   │   ├── main.py
│   │   └── models/
│   └── krishibot/            # KrishiBot Chatbot (Python/FastAPI)
│       ├── app/
│       ├── routes.py
│       └── main.py
├── frontend/                 # React Frontend
├── requirements.txt          # Combined Python dependencies
└── start-services.ps1       # Service launcher script
```

## 📋 Prerequisites

### Required Software
- **Node.js** (v18 or higher)
- **Python 3.11**
- **MongoDB** (v8.0 or higher)
- **Git**

### Optional
- **Windows Terminal** (for better service management)
- **Redis** (for caching - can be disabled)

## 🚀 Installation

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/Agro-Vision.git
cd Agro-Vision
```

### 2. Install Node.js Dependencies
```bash
# Install dependencies for each Node.js service
cd agri-microservice/gateway && npm install
cd ../auth && npm install
cd ../history && npm install
cd ../../frontend && npm install
```

### 3. Setup Python Virtual Environment
```powershell
# Create shared virtual environment on D drive
& "C:\Users\YourName\AppData\Local\Programs\Python\Python311\python.exe" -m venv D:\agroenv

# Activate virtual environment
D:\agroenv\Scripts\Activate.ps1

# Install all Python dependencies
pip install -r requirements.txt
```

### 4. Setup MongoDB
```powershell
# Create data directory
mkdir D:\data\db -Force

# Start MongoDB (adjust version path)
& "C:\Program Files\MongoDB\Server\8.0\bin\mongod.exe" --dbpath "D:\data\db"
```

## ⚙️ Configuration

### Environment Variables

#### Gateway (`gateway/.env`)
```env
PORT=5001
REDIS_ENABLED=false
AUTH_SERVICE_URL=http://127.0.0.1:4000
CROP_RECOMMENDATION_URL=http://127.0.0.1:8001
HISTORY_SERVICE_URL=http://127.0.0.1:8003
DISEASE_DETECTION_URL=http://127.0.0.1:8002
KRISHIBOT_URL=http://127.0.0.1:8000
JWT_SECRET=your_jwt_secret_here
```

#### Auth Service (`auth/.env`)
```env
PORT=4000
MONGODB_URI=mongodb://127.0.0.1:27017/agri_app_users
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRE=7d
```

#### History Service (`history/.env`)
```env
PORT=8003
MONGODB_URI=mongodb://127.0.0.1:27017/agri_history
```

#### KrishiBot (`krishibot/krishibot.env`)
```env
GEMINI_API_KEY=your_gemini_api_key
HUGGINGFACE_API_TOKEN=your_huggingface_token
MODEL_NAME=gemini-2.5-flash-lite
```

## 🏃 Running the Services

### Option 1: Using PowerShell Script (Windows)
```powershell
# Run as Administrator
.\start-services.ps1
```

### Option 2: Manual Start (Individual Terminals)

#### Terminal 1 - MongoDB
```powershell
& "C:\Program Files\MongoDB\Server\8.0\bin\mongod.exe" --dbpath "D:\data\db"
```

#### Terminal 2 - Auth Service
```powershell
cd agri-microservice/auth
npm run dev
```

#### Terminal 3 - History Service
```powershell
cd agri-microservice/history
npm run dev
```

#### Terminal 4 - Gateway
```powershell
cd agri-microservice/gateway
npm run server
```

#### Terminal 5 - CropRec Service
```powershell
cd agri-microservice/croprec
D:\agroenv\Scripts\Activate.ps1
python main.py
```

#### Terminal 6 - Disease Service
```powershell
cd agri-microservice/disease
D:\agroenv\Scripts\Activate.ps1
python main.py
```

#### Terminal 7 - KrishiBot Service
```powershell
cd agri-microservice/krishibot
D:\agroenv\Scripts\Activate.ps1
python run.py
```

#### Terminal 8 - Frontend
```powershell
cd frontend
npm run dev
```

## 🔗 API Endpoints

### Gateway (http://localhost:5001)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | User registration | Public |
| POST | `/api/auth/login` | User login | Public |
| POST | `/api/auth/verify` | Verify token | Public |
| POST | `/api/recommend` | Get crop recommendation | Required |
| POST | `/api/disease-detect` | Detect plant disease | Required |
| GET | `/api/history` | Get prediction history | Required |
| GET | `/api/health` | Service health check | Required |

### KrishiBot (http://localhost:8000)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ask-text` | Text query to chatbot |
| POST | `/api/ask-voice` | Voice query to chatbot |
| GET | `/api/health` | Health check |
| GET | `/api/languages` | Supported languages |

### CropRec (http://localhost:8001)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/recommend/{language}` | Get crop recommendation |
| GET | `/health` | Health check |

### Disease (http://localhost:8002)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/predict` | Detect disease from image |
| GET | `/health` | Health check |

## 🌍 Language Support

AgroVision supports three languages:
- 🇬🇧 **English** (en)
- 🇮🇳 **Hindi** (hi)
- 🇵🇯 **Punjabi** (pa)

To use a specific language, include it in the URL:
```http
POST /api/recommend/hi
POST /api/recommend/pa
POST /api/recommend/en
```

## 🔧 Troubleshooting

### MongoDB Connection Issues
```powershell
# Check if MongoDB is running
netstat -an | findstr :27017

# Start MongoDB service as Administrator
net start MongoDB

# Or run manually
& "C:\Program Files\MongoDB\Server\8.0\bin\mongod.exe" --dbpath "D:\data\db"
```

### Port Already in Use
```powershell
# Find process using port (e.g., 8000)
netstat -ano | findstr :8000

# Kill the process (replace PID with actual number)
taskkill /PID 12345 /F
```

### Python Package Issues
```powershell
# Reinstall requirements
D:\agroenv\Scripts\Activate.ps1
pip install --upgrade pip setuptools wheel
pip install -r requirements.txt --force-reinstall
```

### Model Loading Warnings
The scikit-learn version warnings are safe to ignore. Models will still work.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 👥 Authors

- **Rajnish Kumar** - *Initial work*

## 🙏 Acknowledgments

- Google Gemini AI for LLM capabilities
- HuggingFace for transformers
- Open-Meteo for weather data API

## 📞 Support

For issues or questions, please:
1. Check the [Troubleshooting](#troubleshooting) section
2. Open an issue on GitHub
3. Contact the development team

---

**Made with ❤️ for Farmers** 🌾
```

This README provides a complete overview of your project including setup, configuration, and troubleshooting! 📚