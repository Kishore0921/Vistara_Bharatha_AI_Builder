# VISTARA BHARATHA
> "Develop Our Bharatha Together by Interconnected Systems"

An AI-powered cross-sector governance intelligence and scenario simulation platform.

Vistara Bharatha helps decision-makers understand interconnected systems, identify constraints, simulate interventions, and explore system-wide consequences. 

## Features
- **Cross-Sector Analysis**: Analyze 8 different sectors including EV, Agriculture, Energy, Infrastructure, etc.
- **Bottleneck Discovery**: Identifies constraints mathematically based on dependencies and current performance.
- **Dependency Graph**: Interactive network graph showing how components influence each other (built with NetworkX and React Flow).
- **Simulation Engine**: Intervene in a sector and trace the first-order, second-order, and ripple effects across the system.
- **Constraint Evolution**: Discover how constraints shift after a successful intervention.
- **AI Explanation**: Understand simulation outcomes through AI-generated narratives (or rule-based fallback).

## Disclaimer
> This platform is a model-based decision-support system. Simulations depend on data and assumptions; results are scenarios, not guarantees. Model scores are not official government scores. Human decision-makers retain authority.

## Tech Stack
- **Frontend**: React, Vite, Tailwind CSS, @xyflow/react, Recharts
- **Backend**: Python, FastAPI, Pydantic, NetworkX

## Setup Instructions

### Backend
1. `cd backend`
2. `python -m venv venv`
3. `.\venv\Scripts\activate` (Windows) or `source venv/bin/activate` (Mac/Linux)
4. `pip install -r requirements.txt` (or install manually: `pip install fastapi uvicorn pydantic networkx python-dotenv openai reportlab`)
5. Copy `.env.example` to `.env` and add your OpenAI API Key (optional).
6. Run: `uvicorn main:app --reload`

### Frontend
1. `cd frontend`
2. `npm install`
3. Run: `npm run dev`

### Demo Walkthrough
1. Select the **EV Ecosystem**.
2. Notice the overall score and the primary bottleneck (**Skilled Workforce**).
3. Check out the **Dependency Graph** to see how Skilled Workforce limits Manufacturing Capacity.
4. Go to **Propose an Intervention**. Select "Skilled Workforce" and apply a 20% increase.
5. Click **Simulate**. Watch the system calculate 1st-order and ripple effects.
6. Check the **Emerging Bottleneck** (Charging Infrastructure now struggles to keep up with EV adoption).
7. Read the **AI Explanation**.
