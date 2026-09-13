# ResearchPilot — AI Trading Research Assistant

A small research-workflow prototype for the internship challenge. It follows **ASK → CLARIFY → DEFINE → TEST → LEARN** and deliberately keeps assumptions visible and editable.

## What it demonstrates
- Natural-language research question
- Explicit distinction between user input, interpretation, assumptions, and missing information
- Editable experiment definition
- Reproducible simulated OHLC data for a lightweight test
- Evidence separated from system conclusion
- Limitations and next research questions
- Optional LLM integration; the prototype still works without an API key using a local reasoning fallback

## Architecture
React/Vite → Express API → optional LLM analysis + local experiment engine → JSON result → React

## Run
From the project root:

```bash
npm install
cd frontend && npm install
cd ../backend && npm install
```

Terminal 1:
```bash
cd frontend
npm run dev
```

Terminal 2:
```bash
cd backend
npm run dev
```

Open the Vite URL shown in Terminal 1.

## Optional AI
Copy `backend/.env.example` to `backend/.env` and provide an OpenAI-compatible endpoint and key. The app falls back to local parsing if no key is supplied.

## Important data boundary
The TEST stage uses simulated data generated locally. It is not live market data and must not be presented as evidence about actual NIFTY performance.
