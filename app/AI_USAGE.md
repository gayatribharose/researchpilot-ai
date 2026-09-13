# AI Usage Note — ResearchPilot

## 1. Tools Used

- **ChatGPT:** Used as a development partner for architecture discussion, implementation planning, UI/UX critique, code generation, debugging and problem solving.
- **Optional LLM endpoint:** The prototype supports natural-language question interpretation through an optional LLM endpoint when configured.

## 2. How AI Was Used

AI was used to help explore implementation approaches, structure the application and debug issues during development.

However, AI was not treated as the decision-maker for the research experiment. The prototype was designed so that important experiment parameters remain **visible and editable by the user** rather than being silently invented by the model.

The AI-assisted development process was used to accelerate implementation while the final product decisions, workflow and limitations were reviewed and selected for the prototype.

## 3. Independent Decisions

The main decisions I made for the final prototype were:

- Use **ASK → CLARIFY → DEFINE → TEST → LEARN** as the core product journey.
- Make ambiguity visible before allowing the experiment to run.
- Expose important assumptions and allow the user to edit them.
- Keep the test engine local and lightweight instead of attempting to build a production-grade trading platform.
- Use simulated data so the complete workflow can be demonstrated without depending on a production market-data pipeline.
- Clearly communicate that simulated results are not real-market evidence.
- Separate **“What the data shows”** from **“What we can reasonably conclude.”**
- Focus on reasoning and experiment definition rather than adding unnecessary features.

## 4. Modified / Rejected AI Suggestions

During development, the implementation was simplified to avoid creating the appearance of a complete production trading or backtesting platform.

An important change was moving away from hardcoded or predetermined test results. The final prototype generates a deterministic simulated test series from the experiment configuration and calculates the displayed metrics from the generated events.

This keeps the result connected to the experiment parameters instead of presenting a fixed answer.

## 5. Proudest Part

The part I am most proud of is the **reasoning UX**.

Instead of immediately giving the user a trading result, ResearchPilot first makes the ambiguity explicit, shows the system's interpretation and assumptions, and lets the user review the experiment definition before testing.

This reflects the main idea behind the prototype:

> **Build less. Think more.**

The goal was to make the reasoning behind an experiment visible rather than making the system appear more certain than the available evidence supports.