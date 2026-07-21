# 🚀 Industrial Knowledge Intelligence Platform (IKIP)

An AI-powered full-stack platform that transforms industrial documents into actionable knowledge. The platform enables intelligent document management, semantic search, AI-powered question answering, knowledge graph visualization, and maintenance intelligence to help engineers and organizations quickly access critical information.

---

## ✨ Features

- 📄 Upload and manage industrial documents
- 🧠 AI-powered semantic search using Retrieval-Augmented Generation (RAG)
- 💬 Intelligent AI Assistant for document-based Q&A
- 🕸️ Interactive Knowledge Graph visualization
- 📊 Maintenance Intelligence dashboard
- 🔍 OCR support for scanned documents and images
- 🔐 User Authentication and Authorization
- ⚡ Fast and responsive React interface
- 📈 RESTful FastAPI backend

---

# 🏗️ System Architecture

```
┌───────────────────────────────────────────┐
│               React Frontend              │
│      (Vite + Tailwind + React Flow)       │
└────────────────────┬──────────────────────┘
                     │ REST API
                     ▼
┌───────────────────────────────────────────┐
│             FastAPI Backend               │
│ Authentication │ RAG │ Search │ AI Chat   │
│ Document Processing │ OCR │ Graph Engine  │
└────────────────────┬──────────────────────┘
                     │
                     ▼
          MongoDB + Gemini AI + OCR
```

---

# 🛠 Tech Stack

## Frontend

- React 19
- Vite
- React Router
- Tailwind CSS
- Axios
- React Flow
- Dagre
- Recharts
- Sonner

## Backend

- FastAPI
- Python
- MongoDB
- Gemini AI
- JWT Authentication
- Tesseract OCR

---

# 📂 Project Structure

```
ET-HACKTHON/
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── README.md
│
├── app/
│   └── backend/
│       ├── server.py
│       ├── requirements.txt
│       ├── README.md
│       └── ...
│
├── README.md
└── .gitignore
```

---

# 🚀 Getting Started

## 1. Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/ET-HACKTHON.git
cd ET-HACKTHON
```

---

## 2. Backend Setup

```bash
cd app/backend

python -m venv venv

# Windows
venv\Scripts\activate

pip install -r requirements.txt

python -m uvicorn server:app --reload
```

Backend runs on

```
http://127.0.0.1:8000
```

API Documentation

```
http://127.0.0.1:8000/docs
```

---

## 3. Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

Frontend runs on

```
http://localhost:5173
```

---

# 🔑 Environment Variables

## Backend (.env)

```
MONGO_URL=
DB_NAME=
JWT_SECRET=
JWT_ALGO=
GEMINI_API_KEY=
UPLOAD_DIR=
CORS_ORIGINS=
```

## Frontend (.env)

```
VITE_BACKEND_URL=http://localhost:8000
```

---



- Login Page
- Dashboard
- Document Upload
- Semantic Search
- AI Assistant
- Knowledge Graph
- Maintenance Dashboard

---

# 📖 Documentation

Detailed setup guides are available in:

- 📄 `frontend/README.md`
- 📄 `app/backend/README.md`

---

# 🎯 Future Improvements

- Role-based Access Control
- Multi-language Document Support
- Cloud Storage Integration
- Real-time Collaboration
- Vector Database Integration
- Advanced Analytics Dashboard
- Docker Deployment
- Kubernetes Support

---

# 👨‍💻 Author

**Soumya Galkar**

B.Tech Artificial Intelligence & Machine Learning  
Medicaps University

- GitHub: https://github.com/Soumya-galkar
- LinkedIn: https://www.linkedin.com/in/soumyagalkar

---

# ⭐ Support

If you found this project helpful, consider giving it a ⭐ on GitHub.
