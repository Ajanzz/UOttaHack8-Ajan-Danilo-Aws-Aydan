# MirrorLoop 🪞🔁

**The "Invisible" Customer Feedback Agent.**

MirrorLoop is an Agentic Customer Feedback Platform that turns raw, unstructured venting into structured, actionable engineering tickets in real-time. It decouples the interface from the intelligence, measuring **Words Per Minute (WPM)** and sentiment to dynamically route critical issues.

---

## 🌟 Features

- **Multi-Modal Analysis**: Analyzes text content + typing cadence (WPM) to detect urgency and anger.
- **Dynamic "Pulse Checks"**: AI-generated micro-surveys that adapt based on the specific complaint context (e.g., "Rate the Driver" vs "Rate App Stability").
- **Autonomous Triage**: Auto-generates Jira-ready tickets with assigned roles (PM vs. SWE) and calculated priorities (P0-P3).
- **Glassmorphism UI**: A custom, "invisible" dark-mode interface designed to reduce survey fatigue.


## 🛠️ Tech Stack

- **Frontend**: React, TypeScript, Vite, Custom CSS (Glassmorphism).
- **Backend**: Python, FastAPI.
- **AI & Logic**: OpenAI (GPT-4o), LangChain.
- **Integrations**: SurveyMonkey API, Sentry.

---

## 🚀 Getting Started

Follow these instructions to run the project locally on your machine.

### Prerequisites
- [Node.js & npm](https://nodejs.org/)
- [Python 3.9+](https://www.python.org/downloads/)
- An **OpenAI API Key**

### 1. Backend Setup (Python)

Open a terminal and navigate to the backend directory:

```bash
cd mirrorloop-backend
```

#### Step A: Create & Activate Virtual Environment

*For Windows*

```bash
python -m venv venv
.\venv\Scripts\activate
```

*For Mac/Linux*

```bash
python -m venv venv
source venv/bin/activate
```

#### Step B: Install Dependencies

```bash
pip install fastapi uvicorn pydantic pydantic-settings langchain langchain-openai httpx 
```

#### Step C: Configure Environment Variables 

Create a file named `.env` inside the `mirrorloop-backend` folder and put your keys in

```python
APP_ENV=dev
OPENAI_API_KEY=sk-your-openai-key-here
# Optional Integrations:
# SURVEYMONKEY_ACCESS_TOKEN=your-token
# SENTRY_DSN=your-sentry-dsn
```

#### Step D: Run the Server

```bash
uvicorn main:app --reload
```

The backend API will start at `https://127.0.0.1:8000`

### 2. Frontend Setup (React)

Open a new terminal window and navigate to the frontend directory

```bash
cd mirrorloop-frontend
```

#### Step A: Install Dependencies

```bash
npm install
```

#### Step B: Start the application 

```bash
npm run dev
```

The application will lauch at https://localhost:5173

## 🧠 How It Works

When the user submits, the backend executes three AI chains sequentially:

### Step 1

- Sends complaint text + WPM + metadata to GPT-4o
- Returns structured data: issue type, emotion, severity (1-5), summary, evidence quotes

### Step 2

- Takes the structured feedback
- Generates 3 context-specific "Pulse Check" questions (all scale 1-5 type)
- Example: For a delivery complaint → "Rate the driver", "Rate food temperature", "Rate app speed"

### Step 3

- Creates a sprint backlog with up to 3 Jira tickets
Each ticket includes: ID, role (PM/SWE/Labor), summary, description, acceptance criteria, priority
- Intelligently assigns roles based on issue type (e.g., app bugs → SWE, logistics → Field Operations)

### Step 4 - SurveyMonkey Integration

- If configured, the backend creates a live SurveyMonkey survey with the generated questions
- Returns a weblink URL for customers to complete the survey
- Can submit votes and retrieve survey answers via API

### Step 5 - Results Display (Frontend)


- Shows the structured analysis in a beautiful glassmorphic card
- Displays the generated Pulse Check questions
- Shows the action plan with color-coded priority tickets
- Provides SurveyMonkey link if enabled

## 👥 Team

Built for **UOttaHack 8** by:
- **Ajan Balaganesh**
- **Danilo Bukvic**
- **Aws Ali**
- **Aydan Eng**