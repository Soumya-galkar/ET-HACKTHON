# Industrial Knowledge Intelligence Platform (IKIP) — Backend

This is the backend service for the Industrial Knowledge Intelligence Platform, built using **FastAPI**, **MongoDB**, and **Gemini LLM**. It handles document processing, text chunking, semantic RAG search, graph entity extraction, and maintenance report generation.

---

## Prerequisites

Before starting, ensure you have the following installed on your machine:
1. **Python 3.10+**
2. **MongoDB** (Either running locally on port `27017` or a MongoDB Atlas cloud URI)
3. **Tesseract OCR** (System-level installation required for extracting text from images/scans)
   - *Windows:* Download and run the installer from [Tesseract at UB Mannheim](https://github.com/UB-Mannheim/tesseract/wiki). Add the installation path (e.g., `C:\Program Files\Tesseract-OCR`) to your system environment variables (`PATH`).
   - *macOS:* Install via Homebrew: `brew install tesseract`
   - *Linux:* Install via apt: `sudo apt install tesseract-ocr`

---

## Installation & Setup

Follow these steps to set up the backend on your local environment:

### 1. Create a Virtual Environment
Navigate to the backend directory and create a Python virtual environment to isolate dependencies:
```bash
# Navigate to the backend directory
cd app/backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# On Windows (CMD):
.\venv\Scripts\activate.bat
# On macOS/Linux:
source venv/bin/activate
```

### 2. Install Python Dependencies
Install all required libraries listed in `requirements.txt`:
```bash
pip install -r requirements.txt
```

### 3. Configure Environment Variables
Create a file named `.env` in the root of the `app/backend` directory. Populate it with the following configuration details:

```env
# MongoDB Connection URI (use "mongodb://localhost:27017" for local MongoDB)
MONGO_URL="mongodb+srv://<username>:<password>@<cluster>.mongodb.net/?appName=Cluster0"
DB_NAME="test_database"

# CORS configuration (use "*" for local development to allow all origins)
CORS_ORIGINS="*"

# LLM integration credentials (use your Gemini API Key)
EMERGENT_LLM_KEY="your-gemini-or-emergent-api-key"

# JWT configuration for user login sessions
JWT_SECRET="generate-a-long-random-string-for-security"
JWT_ALGO="HS256"

# Directory where uploaded files are stored locally (relative path)
UPLOAD_DIR="uploads"
```

---

## Running the Application

### 1. Ensure MongoDB is Running
Make sure your MongoDB server (local or Atlas cluster) is active and running.

### 2. Start the FastAPI Server
Run the development server using Uvicorn:
```bash
python -m uvicorn server:app --reload
```

The server will start at:
* **Base URL:** [http://127.0.0.1:8000](http://127.0.0.1:8000)
* **API Documentation (Swagger UI):** [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) (You can test endpoints interactively here).
