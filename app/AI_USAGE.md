# AI Usage Note

## Tools
- ChatGPT: architecture, implementation planning, UI/UX critique, code generation and debugging.
- Optional LLM endpoint: natural-language question interpretation when configured.

## How AI was used
AI was used as a development partner, but the prototype intentionally exposes and lets the user edit important experiment parameters instead of allowing the model to silently invent them.

## Independent decisions
- Use ASK → CLARIFY → DEFINE → TEST → LEARN as the core product journey.
- Keep the test engine local and lightweight rather than building a production trading platform.
- Use simulated data with a clear evidence boundary.
- Separate “what the data shows” from “what we can reasonably conclude”.
- Make assumptions editable and visible.

## Modified/rejected ideas
The initial implementation was simplified to avoid hardcoded experiment results. The final version generates the test series from the experiment configuration and calculates metrics from the generated events.

## Proudest part
The strongest part is the reasoning UX: the prototype makes ambiguity explicit before allowing the experiment to run.
