# Framework Swap Guide

How to replace NIST AI RMF with any other compliance framework (ISO 27001, SOC 2, GDPR, EU AI Act, CMMC, HIPAA, PCI-DSS, etc.)

---

## Architecture Overview

The app is **data-driven**. The scoring engine, radar chart, progress tracking, and UI layout work with **any** framework. You only need to change the data and a few labels.

```
WHAT TO CHANGE                          WHERE
─────────────────────────────────────── ─────────────────────────────────────
1. Functions (top-level groups)         backend/data/questions.py → FUNCTIONS
2. Questions                            backend/data/questions.py → QUESTIONS
3. Maturity levels (optional)           backend/data/questions.py → MATURITY_LEVELS
4. Industry recommendations             backend/data/recommendations.py
5. Priority action templates            backend/data/actions.py
6. Frontend labels & branding           frontend/src/pages/*.js (text only)
```

**You do NOT need to touch**: `server.py`, `api.js`, scoring logic, radar chart, progress bars, or any UI components.

---

## Step 1: Define Your Framework Structure

Before writing code, map your new framework to this format:

```
Framework Name (e.g., "ISO 27001")
│
├── Function 1 (e.g., "Organizational Controls")
│   ├── Category 1.1 (e.g., "Information Security Policies")
│   │   ├── Question 1
│   │   ├── Question 2
│   │   └── Question 3
│   └── Category 1.2 (e.g., "Roles & Responsibilities")
│       ├── Question 1
│       └── Question 2
│
├── Function 2 (e.g., "People Controls")
│   └── ...
│
├── Function 3 (e.g., "Physical Controls")
│   └── ...
│
└── Function 4 (e.g., "Technological Controls")
    └── ...
```

**Key constraint**: The radar chart works best with **3-6 functions**. If your framework has more top-level groups, combine related ones.

---

## Step 2: Update `backend/data/questions.py`

This is the main file. It has 3 sections:

### 2A. MATURITY_LEVELS (optional change)

If your framework uses a different scoring scale, update this. The current 1-5 scale works for most frameworks. If you want to keep it as-is, skip this.

```python
# Current (works for most frameworks)
MATURITY_LEVELS = {
    1: {"label": "Initial", "description": "Ad hoc, undocumented processes"},
    2: {"label": "Developing", "description": "Processes being defined but inconsistently applied"},
    3: {"label": "Defined", "description": "Standardized, documented processes in place"},
    4: {"label": "Managed", "description": "Processes measured and controlled"},
    5: {"label": "Optimizing", "description": "Continuous improvement and adaptation"},
}

# Example: If using CMMC levels
MATURITY_LEVELS = {
    1: {"label": "Performed", "description": "Practices are performed but may be ad hoc"},
    2: {"label": "Documented", "description": "Practices are documented and followed"},
    3: {"label": "Managed", "description": "Practices are planned, tracked, and reviewed"},
    4: {"label": "Reviewed", "description": "Practices are reviewed for effectiveness"},
    5: {"label": "Optimizing", "description": "Practices are standardized and optimized"},
}
```

### 2B. FUNCTIONS (required change)

Replace the 4 NIST AI RMF functions with your framework's top-level groups.

**Current (NIST AI RMF):**
```python
FUNCTIONS = [
    {"id": "govern",  "name": "GOVERN",  "code": "GV", "description": "...", "color": "#002FA7"},
    {"id": "map",     "name": "MAP",     "code": "MP", "description": "...", "color": "#0F172A"},
    {"id": "measure", "name": "MEASURE", "code": "MS", "description": "...", "color": "#16A34A"},
    {"id": "manage",  "name": "MANAGE",  "code": "MG", "description": "...", "color": "#DC2626"},
]
```

**Example: ISO 27001 replacement:**
```python
FUNCTIONS = [
    {
        "id": "organizational",
        "name": "ORGANIZATIONAL",
        "code": "ORG",
        "description": "Organizational controls including policies, roles, and asset management.",
        "color": "#002FA7",
    },
    {
        "id": "people",
        "name": "PEOPLE",
        "code": "PPL",
        "description": "People controls including screening, awareness, and remote working.",
        "color": "#0F172A",
    },
    {
        "id": "physical",
        "name": "PHYSICAL",
        "code": "PHY",
        "description": "Physical controls including perimeters, equipment, and storage media.",
        "color": "#16A34A",
    },
    {
        "id": "technological",
        "name": "TECHNOLOGICAL",
        "code": "TEC",
        "description": "Technological controls including access, cryptography, and operations security.",
        "color": "#DC2626",
    },
]
```

**Rules:**
- `id` → lowercase, no spaces (used as internal key)
- `name` → displayed in UI (uppercase recommended)
- `code` → short code shown in sidebar and badges (2-3 chars)
- `color` → hex color for charts and labels (pick 3-6 distinct colors)

### 2C. QUESTIONS (required change)

Replace all questions. Each question must follow this exact structure:

```python
QUESTIONS = [
    {
        "id": "org-1-1",           # Unique ID: function_prefix-category_num-question_num
        "function": "organizational",  # Must match a function "id" from FUNCTIONS
        "category": "ORG.1",          # Category code (shown in sidebar)
        "category_name": "Information Security Policies",  # Human-readable name
        "question": "Does the organization have a documented information security policy?",
        "guidance": "Look for a formal policy document approved by management.",
        "weight": 3,               # 2 = standard importance, 3 = critical
    },
    # ... more questions
]
```

**ID naming convention:**
```
{function_prefix}-{category_number}-{question_number}

Examples:
  org-1-1, org-1-2, org-2-1     (for organizational controls)
  ppl-1-1, ppl-1-2              (for people controls)
  phy-1-1, phy-2-1              (for physical controls)
  tec-1-1, tec-1-2, tec-2-1    (for technological controls)
```

**Important rules:**
- `function` value must exactly match one of the `id` values in FUNCTIONS
- `category` codes must be consistent within a function (e.g., all ORG.1 questions share the same category code)
- `category_name` must be identical for all questions in the same category
- `weight` is either 2 (standard) or 3 (critical) — affects scoring

**Recommended question count:** 40-80 total. Too few = not comprehensive. Too many = assessment fatigue.

---

## Step 3: Update `backend/data/actions.py`

Replace ACTION_TEMPLATES. The structure mirrors your functions and categories:

```python
ACTION_TEMPLATES = {
    "organizational": {          # Must match function "id"
        "ORG.1": {               # Must match category code from questions
            "category_name": "Information Security Policies",
            "actions": [
                {
                    "severity": "critical",    # critical, high, medium, or low
                    "threshold": 2,            # Action triggers when avg score < this
                    "title": "Develop Information Security Policy",
                    "description": "Create and formally approve an information security policy...",
                    "timeline": "0-3 months",
                    "resources": "CISO, Legal, Management",
                },
                {
                    "severity": "high",
                    "threshold": 3,
                    "title": "Establish Policy Review Cycle",
                    "description": "Implement annual policy reviews...",
                    "timeline": "1-2 months",
                    "resources": "Security team",
                },
            ],
        },
        "ORG.2": {
            # ... next category
        },
    },
    "people": {
        "PPL.1": {
            # ...
        },
    },
    # ... repeat for all functions
}
```

**How threshold works:**
- If a category's average score is **below** the threshold, the action is triggered
- `threshold: 2` → triggers when score is < 2 (very poor = critical gap)
- `threshold: 3` → triggers when score is < 3 (below average = needs work)
- Recommended: 1-2 actions per category

---

## Step 4: Update `backend/data/recommendations.py`

Replace the industry recommendations. Keep the same industries or add/remove as needed.

```python
INDUSTRY_RECOMMENDATIONS = {
    "healthcare": {
        "name": "Healthcare",
        "code": "HC",
        "regulations": ["HIPAA", "HITECH", "FDA Guidelines"],
        "description": "Healthcare-specific guidance for this framework.",
        "recommendations": [
            {
                "function": "organizational",    # Must match function "id"
                "title": "Your recommendation title",
                "description": "Detailed recommendation...",
                "priority": "critical",          # critical, high, medium, low
                "effort": "high",                # high, medium, low
            },
            # ... 6-10 recommendations per industry
        ],
    },
    # ... repeat for other industries
}
```

**To add a new industry:**
```python
    "manufacturing": {
        "name": "Manufacturing",
        "code": "MF",
        "regulations": ["ISO 9001", "OSHA", "IEC 62443"],
        "description": "Manufacturing sector compliance guidance.",
        "recommendations": [ ... ],
    },
```

**To remove an industry:** Delete its key from the dictionary.

---

## Step 5: Update Frontend Labels

Only text labels need to change. Search and replace in these 3 files:

### `frontend/src/pages/LandingPage.js`

Find and replace these strings:

| Find                                    | Replace with                        |
|-----------------------------------------|--------------------------------------|
| `NIST AI RMF Auditor`                  | `Your Framework Auditor`            |
| `NIST AI Risk Management Framework`    | `Your Framework Name`               |
| `AI Compliance`                        | `Your Framework`                    |
| `NIST AI RMF functions`               | `your framework functions`          |
| `Based on NIST AI 100-1 Framework`    | `Based on Your Framework`           |
| `Govern, Map, Measure, Manage`        | `Your function names`               |

### `frontend/src/pages/AssessmentPage.js`

| Find                          | Replace with                    |
|-------------------------------|----------------------------------|
| `AI RMF Assessment`          | `Your Framework Assessment`     |

### `frontend/src/pages/ResultsPage.js`

| Find                                    | Replace with                        |
|-----------------------------------------|--------------------------------------|
| `NIST AI RMF Auditor`                  | `Your Framework Auditor`            |
| `NIST AI RMF Assessment Report`        | `Your Framework Report`             |

Also update `FUNC_LABELS` in ResultsPage.js to match your new function names:

```javascript
// Current
const FUNC_LABELS = {
  govern: "GOVERN",
  map: "MAP",
  measure: "MEASURE",
  manage: "MANAGE",
};

// Replace with your functions
const FUNC_LABELS = {
  organizational: "ORGANIZATIONAL",
  people: "PEOPLE",
  physical: "PHYSICAL",
  technological: "TECHNOLOGICAL",
};
```

And update `FUNC_COLORS` in AssessmentPage.js:

```javascript
// Current
const FUNC_COLORS = {
  govern: "#002FA7",
  map: "#0F172A",
  measure: "#16A34A",
  manage: "#DC2626",
};

// Replace with your function IDs and colors (must match backend FUNCTIONS)
const FUNC_COLORS = {
  organizational: "#002FA7",
  people: "#0F172A",
  physical: "#16A34A",
  technological: "#DC2626",
};
```

### `frontend/public/index.html`

```html
<title>Your Framework Auditor</title>
<meta name="description" content="Your Framework Compliance Assessment Tool" />
```

---

## Step 6: Clear Old Data & Test

```bash
# If using MongoDB Atlas or local MongoDB, clear old assessments (optional)
mongosh
> use nist_ai_rmf
> db.assessments.deleteMany({})

# Restart backend
cd backend
uvicorn server:app --host 0.0.0.0 --port 8001 --reload

# Restart frontend
cd frontend
yarn start

# Test API
curl http://localhost:8001/api/assessment/questions | python3 -c "
import sys, json
d = json.load(sys.stdin)
print(f'Functions: {len(d[\"functions\"])}')
print(f'Questions: {d[\"total_questions\"]}')
for f in d['functions']:
    count = len([q for q in d['questions'] if q['function'] == f['id']])
    print(f'  {f[\"code\"]}: {f[\"name\"]} ({count} questions)')
"
```

---

## Quick Reference: What NOT to Change

These files are **framework-agnostic** and should NOT be modified:

| File | Why |
|------|-----|
| `backend/server.py` | Scoring engine works with any functions/categories |
| `frontend/src/lib/api.js` | API calls are generic |
| `frontend/src/App.js` | Routing is generic |
| `frontend/src/App.css` | Styling is generic |
| `frontend/src/index.css` | Theme is generic |

---

## Checklist

- [ ] Mapped new framework to Functions → Categories → Questions structure
- [ ] Updated `FUNCTIONS` in `questions.py` (3-6 functions with id, name, code, color)
- [ ] Updated `QUESTIONS` in `questions.py` (40-80 questions with correct function/category links)
- [ ] Updated `MATURITY_LEVELS` if needed (optional — default 1-5 works for most)
- [ ] Updated `ACTION_TEMPLATES` in `actions.py` (1-2 actions per category)
- [ ] Updated `INDUSTRY_RECOMMENDATIONS` in `recommendations.py` (use new function IDs)
- [ ] Updated frontend text labels in `LandingPage.js`, `AssessmentPage.js`, `ResultsPage.js`
- [ ] Updated `FUNC_COLORS` and `FUNC_LABELS` in frontend pages
- [ ] Updated `<title>` and `<meta>` in `index.html`
- [ ] Cleared old assessment data from MongoDB
- [ ] Tested API returns correct function/question counts
- [ ] Ran full assessment and verified radar chart, actions, and recommendations
