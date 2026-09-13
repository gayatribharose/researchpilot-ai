# ResearchPilot — AI Trading Research Assistant

ResearchPilot is a lightweight AI-assisted research workflow prototype built for the internship challenge.

It helps transform an ambiguous natural-language trading question into a structured, inspectable experiment:

**ASK → CLARIFY → DEFINE → TEST → LEARN**

The main product decision is to make assumptions and reasoning visible before presenting a result.

## Live Demo

**Frontend:**  
https://researchpilot-aishou.onrender.com

**Backend API:**  
https://researchpilot-backend-sdzp.onrender.com

## What Problem Does It Solve?

A question such as:

> "Does buying NIFTY after a sharp fall work?"

sounds simple, but contains important ambiguity.

For example:
- What counts as a "sharp fall"?
- Over how many trading sessions?
- When should the entry happen?
- How long should the position be held?
- Which historical period should be tested?
- What transaction costs should be considered?

ResearchPilot makes these assumptions explicit instead of silently inventing important parameters.

## Product Workflow

### 1. ASK

The user enters a natural-language research question.

Example:

> "Does buying NIFTY after a sharp fall work?"

### 2. CLARIFY

The prototype separates:

- What the user said
- System interpretation
- Assumptions
- Missing information
- Potential research risks

This makes ambiguity visible before testing.

### 3. DEFINE

The research question is converted into a structured experiment.

The user can review and edit parameters such as:

- Market / instrument
- Fall threshold
- Lookback window
- Entry rule
- Exit rule
- Holding period
- Test period
- Filters
- Transaction costs
- Hypothesis

### 4. TEST

The experiment is executed using a lightweight local test engine.

The prototype generates deterministic simulated OHLC data based on the experiment configuration and calculates metrics from the generated events.

### 5. LEARN

The result is presented in three separate layers:

- **What the data shows**
- **What we can reasonably conclude**
- **What should be investigated next**

This separation is intentional so that a generated result is not presented as stronger evidence than it actually is.

## Key Product Decisions

- Use **ASK → CLARIFY → DEFINE → TEST → LEARN** as the core experience.
- Keep important assumptions visible and editable.
- Avoid silently inventing critical experiment parameters.
- Keep the test engine lightweight instead of building a production-grade trading platform.
- Separate measured results from system conclusions.
- Clearly communicate limitations of simulated data.
- Focus on reasoning and experiment design rather than unnecessary features.

## Architecture

```text
User
  ↓
React / Vite Frontend
  ↓ HTTP / JSON
Node.js / Express Backend
  ├── AI Analysis
  │     └── Optional LLM endpoint
  │
  └── Local Experiment Engine
        └── Deterministic simulated OHLC data
  ↓
Research Result
  ↓
React UI