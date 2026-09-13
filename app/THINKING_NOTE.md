# Thinking Note — ResearchPilot

## 1. Interpretation
The phrase “sharp fall” is ambiguous. A meaningful test needs a measurable threshold and lookback window, plus a precise entry, exit, holding period and test window.

## 2. Assumptions vs questions
**User said:** the natural-language question exactly as entered.

**System interpretation:** convert the idea into a falsifiable event-based experiment.

**System should ask / expose:** fall threshold, lookback window, holding period, test period and cost assumptions. These are editable in the prototype instead of being silently fixed.

## 3. Minimum clarification
1. How large must the fall be and over what window?
2. When exactly is the entry executed?
3. How long is the position held / what is the exit rule?
4. Which historical period is tested?
5. What costs should be assumed?

## 4. Experiment
The prototype represents market, condition, entry, exit, holding period, test period, filters, costs and hypothesis as structured fields. This makes the research question inspectable before testing.

## 5. Risks
Ambiguous definitions, incorrect assumptions, data quality, look-ahead bias, transaction costs, slippage, overfitting and insufficient evidence can all create misleading conclusions.

## Product decision
The prototype prioritizes reasoning visibility over a production-grade backtester. Simulated data is used only to demonstrate the workflow, with a prominent data boundary so a positive result cannot be mistaken for real-market evidence.
