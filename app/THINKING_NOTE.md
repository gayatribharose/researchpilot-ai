# Thinking Note — ResearchPilot

## 1. Interpretation

The initial question is:

> “Does buying NIFTY after a sharp fall work?”

The main ambiguity is the phrase **“sharp fall.”** It could mean a percentage decline, a point-based decline, or a fall over a particular number of trading sessions.

A meaningful experiment therefore needs measurable definitions for:
- fall threshold
- lookback window
- entry timing
- exit / holding period
- historical test period
- transaction costs and assumptions

The goal is to convert the natural-language question into a **falsifiable experiment** rather than assuming that “sharp fall” has one universally correct meaning.

## 2. User said vs System interpretation

**User said:**  
The natural-language question exactly as entered.

**System interpretation:**  
The user wants to test whether buying NIFTY after a defined market decline produces a repeatable positive outcome.

**System should ask or expose:**  
The fall threshold, lookback window, entry timing, holding period, test period, costs and filters.

I chose to make these parameters **visible and editable** instead of silently inventing important values. This allows the user to inspect and modify the experiment before testing it.

## 3. Minimum clarification

The minimum information needed is:

1. How large must the fall be and over what lookback window?
2. When exactly should the entry happen?
3. How long should the position be held or what should trigger the exit?
4. Which historical period should be tested?
5. What transaction-cost assumptions should be used?
6. Are there any additional filters that should be applied?

These questions are intentionally limited to information that can materially change the experiment.

## 4. Experiment Definition

The prototype represents the research question using structured fields:

- **Market / Instrument**
- **Fall threshold**
- **Lookback window**
- **Entry rule**
- **Exit rule**
- **Holding period**
- **Test period**
- **Filters**
- **Transaction costs**
- **Hypothesis**

This creates a clear chain:

**Question → Clarification → Experiment Definition → Test → Evidence → Learning**

The hypothesis is kept separate from the measured result so that the system does not treat the expected outcome as evidence.

## 5. Risks and Failure Modes

Several factors could make the result misleading:

- **Ambiguous definitions:** Different definitions of “sharp fall” can produce different results.
- **Incorrect assumptions:** An assumed entry or exit rule may not match the user's actual intent.
- **Look-ahead bias:** Information that would not have been available at the time of the trade must not influence the decision.
- **Data quality:** Missing, incorrect or unrealistic market data can distort results.
- **Transaction costs and slippage:** Ignoring trading costs can make an apparently profitable strategy look better than it really is.
- **Overfitting:** Repeatedly changing parameters to improve historical results can create a strategy that does not generalize.
- **Insufficient evidence:** A small number of qualifying signals is not enough to establish a reliable pattern.
- **Simulated data limitation:** The prototype uses simulated data to demonstrate the workflow. Its output must not be presented as evidence that the strategy works in real markets.

## 6. Product Decision

I prioritized **reasoning visibility over building a production-grade backtesting engine**.

The five-stage workflow — **ASK → CLARIFY → DEFINE → TEST → LEARN** — makes the system's reasoning and assumptions visible before a result is presented.

The prototype uses simulated data so the complete workflow can be demonstrated without building a production market-data pipeline. A clear data boundary is shown in the testing and learning stages so that a simulated result cannot be mistaken for real-market evidence.

The most important design decision was therefore not to make the system appear more certain than the available evidence supports.