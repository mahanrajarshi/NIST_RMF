# NIST AI RMF Compliance Assessment Tool

A comprehensive, web-based compliance assessment platform built on the **NIST Artificial Intelligence Risk Management Framework (AI RMF 1.0)**. Designed for medium-to-large organizations to evaluate their AI risk management maturity, receive prioritized action items, and access industry-specific regulatory guidance.

---

## Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Architecture](#architecture)
4. [Project Structure](#project-structure)
5. [Prerequisites](#prerequisites)
6. [Setup & Installation](#setup--installation)
7. [Running the Application](#running-the-application)
8. [Using the Tool](#using-the-tool)
9. [API Reference](#api-reference)
10. [Assessment Framework](#assessment-framework)
11. [Scoring Methodology](#scoring-methodology)
12. [Industry Coverage](#industry-coverage)
13. [Configuration](#configuration)
14. [Troubleshooting](#troubleshooting)

---

## Overview

The tool provides a structured, questionnaire-based assessment across the four core NIST AI RMF functions:

| Function     | Code | Focus Area                                      |
|------------- |------|--------------------------------------------------|
| **GOVERN**   | GV   | Policies, accountability, workforce, oversight   |
| **MAP**      | MP   | Context, categorization, risk identification     |
| **MEASURE**  | MS   | Metrics, evaluation, transparency, monitoring    |
| **MANAGE**   | MG   | Prioritization, treatment, third-party, deployment |

The assessment produces a maturity rating (1-5 scale), a compliance radar chart, gap-based priority action items, and tailored recommendations for your industry sector.

---

## Features

- **62-Question Assessment** across 19 categories and 4 NIST AI RMF functions
- **1-5 Maturity Scale**: Initial, Developing, Defined, Managed, Optimizing
- **Compliance Radar Chart**: Visual comparison across all four functions
- **Priority Action Items**: Severity-ranked (Critical/High/Medium) with timelines, resource needs, and current vs. target scores
- **Industry-Specific Recommendations**: Tailored guidance for 7 sectors with regulatory context
- **Category Breakdown**: Detailed per-category scores and maturity levels
- **Progress Tracking**: Real-time counter and progress bar during the assessment
- **Print-Ready Reports**: Browser print support for audit documentation
- **No Authentication Required**: Single-use assessment tool, no login needed
- **Persistent Results**: Assessments saved to MongoDB, retrievable via unique ID

---

## Architecture

```
Frontend (React 19)          Backend (FastAPI)           Database (MongoDB)
 ┌──────────────┐           ┌──────────────┐           ┌──────────────┐
 │  React SPA   │  ──API──> │  FastAPI      │  ──────>  │  MongoDB     │
 │  Tailwind CSS│  <──JSON─ │  /api prefix  │  <──────  │  Assessments │
 │  Recharts    │           │  Motor async  │           │              │
 │  Shadcn UI   │           │  Pydantic     │           │              │
 └──────────────┘           └──────────────┘           └──────────────┘
    Port 3000                  Port 8001                Port 27017
```

**Tech Stack:**
- **Frontend**: React 19, Tailwind CSS 3, Shadcn/UI, Recharts, React Router, Axios
- **Backend**: FastAPI, Motor (async MongoDB driver), Pydantic, Python 3.11+
- **Database**: MongoDB
- **Fonts**: Manrope (headings), JetBrains Mono (data/labels)

---

## Project Structure

```
/app
├── backend/
│   ├── server.py                  # FastAPI application & API routes
│   ├── data/
│   │   ├── questions.py           # 62 assessment questions (4 functions, 19 categories)
│   │   ├── recommendations.py     # Industry-specific recommendations (7 sectors)
│   │   └── actions.py             # Priority action item templates (gap-based)
│   ├── requirements.txt           # Python dependencies
│   └── .env                       # Backend environment variables
│
├── frontend/
│   ├── src/
│   │   ├── App.js                 # Root component with routing
│   │   ├── App.css                # Animation & utility styles
│   │   ├── index.css              # Tailwind base, CSS variables, fonts
│   │   ├── lib/
│   │   │   └── api.js             # Axios API client
│   │   ├── pages/
│   │   │   ├── LandingPage.js     # Hero, industry selector, start flow
│   │   │   ├── AssessmentPage.js  # Split-rail questionnaire with sidebar
│   │   │   └── ResultsPage.js     # Dashboard: radar, actions, recommendations
│   │   └── components/ui/         # Shadcn UI components
│   ├── package.json               # Node dependencies
│   └── .env                       # Frontend environment variables
│
├── memory/
│   └── PRD.md                     # Product requirements document
└── README.md                      # This file
```

---

## Prerequisites

- **Node.js** >= 18.x
- **Yarn** >= 1.22 (do NOT use npm)
- **Python** >= 3.11
- **MongoDB** >= 6.0 (running locally or remotely)

---

## Setup & Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd app
```

### 2. Backend Setup

```bash
cd backend

# Create a virtual environment (recommended)
python -m venv venv
source venv/bin/activate   # Linux/Mac
# venv\Scripts\activate    # Windows

# Install Python dependencies
pip install -r requirements.txt
```

### 3. Frontend Setup

```bash
cd frontend

# Install Node dependencies (use yarn, NOT npm)
yarn install
```

### 4. Environment Configuration

**Backend** (`/backend/.env`):

```env
MONGO_URL="mongodb://localhost:27017"
DB_NAME="test_database"
CORS_ORIGINS="*"
```

| Variable       | Description                                | Default                          |
|----------------|--------------------------------------------|----------------------------------|
| `MONGO_URL`    | MongoDB connection string                  | `mongodb://localhost:27017`      |
| `DB_NAME`      | Database name for storing assessments      | `test_database`                  |
| `CORS_ORIGINS` | Allowed CORS origins (comma-separated)     | `*`                              |

**Frontend** (`/frontend/.env`):

```env
REACT_APP_BACKEND_URL=http://localhost:8001
```

| Variable                   | Description                           | Example                      |
|----------------------------|---------------------------------------|------------------------------|
| `REACT_APP_BACKEND_URL`   | URL where the backend API is hosted   | `http://localhost:8001`      |

> **Important**: The frontend calls the backend via `REACT_APP_BACKEND_URL`. All backend routes are prefixed with `/api`.

### 5. Start MongoDB

Make sure MongoDB is running:

```bash
# If using local MongoDB
mongod --dbpath /data/db

# Or with Docker
docker run -d -p 27017:27017 --name mongodb mongo:7
```

---

## Running the Application

### Start the Backend

```bash
cd backend
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

The API will be available at `http://localhost:8001/api/`.

### Start the Frontend

```bash
cd frontend
yarn start
```

The app will open at `http://localhost:3000`.

### Verify Everything Works

```bash
# Test the API root
curl http://localhost:8001/api/

# Expected: {"message":"NIST AI RMF Assessment API"}

# Test questions endpoint
curl http://localhost:8001/api/assessment/questions | python3 -c "import sys,json;d=json.load(sys.stdin);print(f'Functions: {len(d[\"functions\"])}, Questions: {d[\"total_questions\"]}')"

# Expected: Functions: 4, Questions: 62

# Test industries endpoint
curl http://localhost:8001/api/assessment/industries | python3 -c "import sys,json;d=json.load(sys.stdin);print(f'Industries: {len(d[\"industries\"])}')"

# Expected: Industries: 7
```

---

## Using the Tool

### Step 1: Select Your Industry

On the landing page, choose one of the 7 supported industry sectors. Each sector provides tailored regulatory context and recommendations.

### Step 2: Start the Assessment

Optionally enter your organization name (for personalized reports), then click **Start**.

### Step 3: Answer Questions

- The assessment presents questions organized by **function** (Govern, Map, Measure, Manage) and **category** (19 total).
- For each question, select a maturity level from **1** (Initial) to **5** (Optimizing):

| Score | Maturity Level | Description                                      |
|-------|----------------|--------------------------------------------------|
| 1     | Initial        | Ad hoc, undocumented processes                   |
| 2     | Developing     | Processes being defined but inconsistently applied |
| 3     | Defined        | Standardized, documented processes in place      |
| 4     | Managed        | Processes measured and controlled                |
| 5     | Optimizing     | Continuous improvement and adaptation            |

- Use the **sidebar** to navigate between functions and categories.
- The **progress bar** tracks your completion in real time.
- Hover the **info icon** next to each question for assessment guidance.

### Step 4: Submit & Review Results

After answering all questions (or as many as you wish), click **Submit Assessment**. Unanswered questions default to a score of 1.

The results dashboard contains four tabs:

| Tab                    | Content                                                    |
|------------------------|------------------------------------------------------------|
| **Overview**           | Compliance radar chart, function maturity bars, summary stats |
| **Priority Actions**   | Gap-based action items ranked by severity (Critical > High > Medium) |
| **Industry Guidance**  | Sector-specific recommendations with regulatory tags       |
| **Category Details**   | Per-category scores and maturity levels for all 19 categories |

### Step 5: Print or Share

- Click **Print** to generate a browser-printable version of the report.
- Use the assessment URL (contains the unique ID) to revisit results at any time.
- Click **New Assessment** to start a fresh evaluation.

---

## API Reference

All endpoints are prefixed with `/api`.

### Health Check

```
GET /api/
```
Returns: `{"message": "NIST AI RMF Assessment API"}`

### Get Assessment Questions

```
GET /api/assessment/questions
```
Returns all 62 questions grouped by function, plus maturity level definitions.

**Response fields:**
- `functions` - Array of 4 NIST AI RMF function objects
- `questions` - Array of 62 question objects (id, function, category, question text, guidance, weight)
- `maturity_levels` - Definitions for scores 1-5
- `total_questions` - Total count (62)

### Get Supported Industries

```
GET /api/assessment/industries
```
Returns all 7 industry sectors with descriptions and applicable regulations.

### Submit Assessment

```
POST /api/assessment/submit
Content-Type: application/json
```

**Request body:**
```json
{
  "industry": "healthcare",
  "organization_name": "Acme Health Corp",
  "answers": [
    { "question_id": "gv-1-1", "score": 3 },
    { "question_id": "gv-1-2", "score": 4 },
    ...
  ]
}
```

**Response:** Complete results object including overall score, function scores, category scores, radar chart data, and priority action items.

### Get Assessment Results

```
GET /api/assessment/{assessment_id}
```
Retrieves a previously submitted assessment by its unique ID.

### Get Industry Recommendations

```
GET /api/recommendations/{industry}
```
Returns sector-specific recommendations. Valid values: `healthcare`, `finance`, `government`, `defense`, `technology`, `energy`, `education`.

### Get Maturity Levels

```
GET /api/maturity-levels
```
Returns the 5 maturity level definitions.

---

## Assessment Framework

### NIST AI RMF Functions & Categories

**GOVERN (GV)** - 6 categories, 17 questions
| Category | Name                          |
|----------|-------------------------------|
| GV.1     | AI Risk Management Policies   |
| GV.2     | Accountability Structures     |
| GV.3     | Workforce Diversity & AI Literacy |
| GV.4     | Organizational Commitments    |
| GV.5     | Stakeholder Engagement        |
| GV.6     | Oversight & Monitoring        |

**MAP (MP)** - 5 categories, 16 questions
| Category | Name                          |
|----------|-------------------------------|
| MP.1     | Context & Use Case Definition |
| MP.2     | AI System Categorization      |
| MP.3     | Benefits & Costs Analysis     |
| MP.4     | Risk & Impact Identification  |
| MP.5     | Stakeholder Impact Assessment |

**MEASURE (MS)** - 4 categories, 14 questions
| Category | Name                          |
|----------|-------------------------------|
| MS.1     | Metrics & Methodologies       |
| MS.2     | AI System Evaluation          |
| MS.3     | Transparency & Explainability |
| MS.4     | Documentation & Monitoring    |

**MANAGE (MG)** - 4 categories, 15 questions
| Category | Name                          |
|----------|-------------------------------|
| MG.1     | Risk Prioritization           |
| MG.2     | Risk Treatment Strategies     |
| MG.3     | Third-Party Risk Management   |
| MG.4     | Deployment & Post-Deployment  |

---

## Scoring Methodology

### Weighted Scoring
Each question has a weight (2 or 3) reflecting its importance. The weighted average determines category and function scores.

### Score Calculation
```
Category Score (%) = (Sum of weighted scores) / (Max possible weighted score) * 100
Function Score (%) = Aggregate of category scores within that function
Overall Score (%)  = Aggregate across all functions
```

### Maturity Mapping
| Average Score | Maturity Level |
|---------------|----------------|
| 0.0 - 1.5    | Initial        |
| 1.6 - 2.5    | Developing     |
| 2.6 - 3.5    | Defined        |
| 3.6 - 4.5    | Managed        |
| 4.6 - 5.0    | Optimizing     |

### Priority Actions
Actions are generated when a category's average score falls below a defined threshold. They are sorted by:
1. **Severity** (Critical > High > Medium)
2. **Current score** (lowest first)

Each action includes a title, description, timeline, required resources, and current vs. target score.

---

## Industry Coverage

| Industry          | Code | Key Regulations                              |
|-------------------|------|----------------------------------------------|
| Healthcare        | HC   | HIPAA, FDA AI/ML Guidelines, 21st Century Cures Act |
| Finance           | FN   | SOX, PCI-DSS, Basel III/IV, Dodd-Frank, GDPR |
| Government        | GV   | FedRAMP, EO 14110, OMB M-24-10, Privacy Act  |
| Defense           | DF   | CMMC, DoD AI Strategy, DIB Guidelines, ITAR   |
| Technology / SaaS | TC   | SOC 2, ISO 27001, EU AI Act, CCPA/CPRA        |
| Energy            | EN   | NERC CIP, DOE Guidelines, EPA, IEC 62443      |
| Education         | ED   | FERPA, COPPA, Section 508, State AI Laws       |

Each industry includes 8 tailored recommendations spanning all 4 NIST AI RMF functions, with priority and effort ratings.

---

## Configuration

### Adding Custom Questions

Edit `/backend/data/questions.py` to add or modify questions. Each question follows this structure:

```python
{
    "id": "gv-1-5",             # Unique ID (function-category-number)
    "function": "govern",        # Function: govern, map, measure, manage
    "category": "GV.1",          # Category code
    "category_name": "AI Risk Management Policies",
    "question": "Your question text here?",
    "guidance": "Guidance for the assessor.",
    "weight": 2,                 # Weight: 2 (standard) or 3 (critical)
}
```

### Adding Industries

Edit `/backend/data/recommendations.py` to add new industry sectors with their specific recommendations.

### Adding Action Templates

Edit `/backend/data/actions.py` to define new gap-based action items triggered when category scores fall below thresholds.

---

## Troubleshooting

| Problem                          | Solution                                                        |
|----------------------------------|-----------------------------------------------------------------|
| Backend won't start              | Check `MONGO_URL` in `.env`, ensure MongoDB is running          |
| Frontend shows blank page        | Verify `REACT_APP_BACKEND_URL` matches backend address          |
| API returns 404                  | Ensure all routes use `/api` prefix                             |
| Questions not loading            | Check backend logs: `tail -f backend.log`                       |
| Assessment won't submit          | Check browser console for errors, verify MongoDB write access   |
| Radar chart not rendering        | Ensure `recharts` is installed: `yarn add recharts`             |
| CORS errors in browser           | Set `CORS_ORIGINS="*"` in backend `.env` or add your domain     |
| Print layout looks wrong         | Use Chrome or Edge for best print-to-PDF support                |

---

## License

This tool is based on the publicly available NIST AI Risk Management Framework (AI 100-1). The NIST framework is a voluntary, non-regulatory resource. This implementation is provided as-is for organizational self-assessment purposes.

---

*Built with FastAPI, React, MongoDB, and the NIST AI RMF 1.0 framework.*
