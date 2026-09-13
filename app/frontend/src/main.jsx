import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CircleAlert,
  FlaskConical,
  Lightbulb,
  RotateCcw,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Database,
  Brain,
  ShieldAlert,
} from "lucide-react";
import "./styles.css";

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const initialExperiment = {
  market: "",
  condition: {
    fallPercent: 5,
    lookbackDays: 5,
  },
  entry:
    "Enter at the next available session close after the condition is detected.",
  exit: "Exit at the end of the selected holding period.",
  holdingPeriodDays: 5,
  testPeriod: {
    start: "2024-01-01",
    end: "2025-12-31",
  },
  filters: "No additional filters",
  costPercent: 0.1,
  hypothesis: "",
};

const stageMeta = [
  ["ASK", "Start with a question"],
  ["CLARIFY", "Surface ambiguity"],
  ["DEFINE", "Make it testable"],
  ["TEST", "Run a small experiment"],
  ["LEARN", "Separate evidence from conclusion"],
];

function Field({ label, children, hint }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
      {hint && <small>{hint}</small>}
    </label>
  );
}

function App() {
  const [stage, setStage] = useState(0);

  const [question, setQuestion] = useState(
    "Does buying NIFTY after a sharp fall work?"
  );

  const [analysis, setAnalysis] = useState(null);

  const [experiment, setExperiment] = useState(initialExperiment);

  const [result, setResult] = useState(null);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [confirmed, setConfirmed] = useState(false);

  const update = (path, value) => {
    setExperiment((previous) => {
      const copy = structuredClone(previous);

      const keys = path.split(".");

      let current = copy;

      keys.slice(0, -1).forEach((key) => {
        current = current[key];
      });

      current[keys[keys.length - 1]] = value;

      return copy;
    });
  };

  async function analyzeQuestion() {
    if (!question.trim()) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API}/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: question.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not analyze the question.");
      }

      setAnalysis(data);

      setExperiment((previous) => ({
        ...previous,

        market: data.market || previous.market,

        hypothesis:
          data.hypothesis ||
          data.interpretation ||
          previous.hypothesis,
      }));

      setConfirmed(false);
      setStage(1);
    } catch (error) {
      console.error(error);

      setError(
        "The analysis service could not be reached. Make sure the backend is running on port 5000."
      );
    } finally {
      setLoading(false);
    }
  }

  function confirmClarification() {
    setConfirmed(true);
    setStage(2);
  }

  function validateExperiment() {
    if (!experiment.market.trim()) {
      return "Please specify the market or instrument.";
    }

    if (Number(experiment.condition.fallPercent) <= 0) {
      return "Sharp fall threshold must be greater than 0.";
    }

    if (Number(experiment.condition.lookbackDays) <= 0) {
      return "Lookback period must be greater than 0.";
    }

    if (Number(experiment.holdingPeriodDays) <= 0) {
      return "Holding period must be greater than 0.";
    }

    if (!experiment.testPeriod.start || !experiment.testPeriod.end) {
      return "Please select both test dates.";
    }

    if (experiment.testPeriod.start >= experiment.testPeriod.end) {
      return "Test start date must be before test end date.";
    }

    if (Number(experiment.costPercent) < 0) {
      return "Transaction cost cannot be negative.";
    }

    return "";
  }

  function lockDefinition() {
    const validationError = validateExperiment();

    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");
    setStage(3);
  }

  async function runTest() {
    const validationError = validateExperiment();

    if (validationError) {
      setError(validationError);
      setStage(2);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API}/experiment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          experiment: {
            ...experiment,
            condition: {
              fallPercent: Number(experiment.condition.fallPercent),
              lookbackDays: Number(experiment.condition.lookbackDays),
            },
            holdingPeriodDays: Number(experiment.holdingPeriodDays),
            costPercent: Number(experiment.costPercent),
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Experiment failed.");
      }

      if (!data.metrics) {
        throw new Error(
          "The experiment service returned an incomplete result."
        );
      }

      setResult(data);
      setStage(4);
    } catch (error) {
      console.error("TEST ERROR:", error);

      setError(
        error.message ||
          "The experiment could not be completed. Check the backend terminal."
      );
    } finally {
      setLoading(false);
    }
  }

  const conclusion = useMemo(() => {
    if (!result?.metrics) {
      return "";
    }

    const metrics = result.metrics;

    if (!metrics.signals) {
      return "The selected rule produced no qualifying signals in the simulated test window. There is therefore not enough evidence from this experiment to evaluate the hypothesis.";
    }

    if (Number(metrics.averageNetReturn) > 0) {
      return `The simulated test produced a positive average net return of ${metrics.averageNetReturn}% across ${metrics.signals} qualifying signals. This is a reason to investigate further, not proof that the strategy works in real markets.`;
    }

    return `The simulated test produced a non-positive average net return of ${metrics.averageNetReturn}% across ${metrics.signals} qualifying signals. In this prototype dataset, the hypothesis is not supported, but this does not establish what would happen in real markets.`;
  }, [result]);

  function reset() {
    setStage(0);
    setAnalysis(null);
    setResult(null);
    setExperiment(structuredClone(initialExperiment));
    setConfirmed(false);
    setError("");
  }

  const progress = (stage / 4) * 100;

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <div className="logo">
            <FlaskConical size={20} />
          </div>

          <div>
            <strong>ResearchPilot</strong>
            <span>AI trading research assistant</span>
          </div>
        </div>

        <button className="reset" onClick={reset}>
          <RotateCcw size={15} />
          New research
        </button>
      </header>

      <main>
        <section className="hero">
          <p className="eyebrow">
            QUESTION → HYPOTHESIS → EXPERIMENT → EVIDENCE
          </p>

          <h1>
            Turn a market idea into a <em>testable</em> research experiment.
          </h1>

          <p className="sub">
            ResearchPilot makes ambiguity visible before testing, lets you
            confirm important assumptions, creates a structured experiment,
            and separates evidence from conclusions.
          </p>
        </section>

        <div className="steps">
          {stageMeta.map(([name, description], index) => (
            <button
              key={name}
              className={`step ${
                index === stage
                  ? "active"
                  : index < stage
                  ? "done"
                  : ""
              }`}
              onClick={() => {
                if (index <= stage) {
                  setStage(index);
                }
              }}
            >
              <span>
                {index < stage ? <Check size={15} /> : index + 1}
              </span>

              <div>
                <b>{name}</b>
                <small>{description}</small>
              </div>
            </button>
          ))}
        </div>

        <div className="progress">
          <div style={{ width: `${progress}%` }} />
        </div>

        {error && (
          <div className="error">
            <CircleAlert size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* ASK */}

        {stage === 0 && (
          <section className="card stage-card">
            <div className="card-title">
              <div>
                <span className="tag">01 · ASK</span>

                <h2>What do you want to investigate?</h2>

                <p>
                  Start with a natural-language market question. Precision
                  comes later.
                </p>
              </div>

              <Sparkles />
            </div>

            <Field label="Research question">
              <textarea
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                rows="4"
                placeholder="e.g. Does buying NIFTY after a sharp fall work?"
              />
            </Field>

            <div className="example">
              <Lightbulb size={17} />

              <span>
                Try changing the question. ResearchPilot should expose
                ambiguity rather than silently inventing important parameters.
              </span>
            </div>

            <button
              className="primary"
              onClick={analyzeQuestion}
              disabled={loading || !question.trim()}
            >
              {loading ? "Analyzing…" : "Analyze question"}
              <ArrowRight size={17} />
            </button>
          </section>
        )}

        {/* CLARIFY */}

        {stage === 1 && analysis && (
          <section className="card stage-card">
            <div className="card-title">
              <div>
                <span className="tag">02 · CLARIFY</span>

                <h2>Make the ambiguity visible.</h2>

                <p>
                  Before testing, distinguish what the user said from what the
                  system inferred and what still needs confirmation.
                </p>
              </div>

              <Brain />
            </div>

            <div className="three">
              <div className="info">
                <label>USER SAID</label>

                <p>{analysis.userSaid || question}</p>
              </div>

              <div className="info">
                <label>SYSTEM INTERPRETATION</label>

                <p>
                  {analysis.interpretation ||
                    "The system will translate the idea into a measurable research question."}
                </p>
              </div>

              <div className="info warning">
                <label>ASSUMPTIONS</label>

                {analysis.assumptions?.length ? (
                  analysis.assumptions.map((item, index) => (
                    <p key={index}>• {item}</p>
                  ))
                ) : (
                  <p>• No assumptions were returned.</p>
                )}
              </div>
            </div>

            <div className="questions">
              <h3>Questions before this becomes meaningful</h3>

              {analysis.missingInformation?.length ? (
                analysis.missingInformation.map((item, index) => (
                  <div className="question" key={index}>
                    <span>{index + 1}</span>
                    {item}
                  </div>
                ))
              ) : (
                <div className="question">
                  <span>✓</span>
                  No additional questions were identified.
                </div>
              )}
            </div>

            <div className="risk-box">
              <div className="risk-heading">
                <ShieldAlert size={17} />
                <strong>Potential research risks</strong>
              </div>

              <div className="risk-list">
                {(analysis.risks || []).map((risk, index) => (
                  <span key={index}>{risk}</span>
                ))}
              </div>
            </div>

            <div className="confirmation">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(event) => setConfirmed(event.target.checked)}
              />

              <label>
                I understand that the assumptions above are provisional and
                will be visible/editable before the test.
              </label>
            </div>

            <div className="choice-row">
              <button
                className="secondary"
                onClick={() => setStage(0)}
              >
                <ArrowLeft size={17} />
                Edit question
              </button>

              <button
                className="primary"
                disabled={!confirmed}
                onClick={confirmClarification}
              >
                Confirm & define experiment
                <ArrowRight size={17} />
              </button>
            </div>
          </section>
        )}

        {/* DEFINE */}

        {stage === 2 && (
          <section className="card stage-card">
            <div className="card-title">
              <div>
                <span className="tag">03 · DEFINE</span>

                <h2>Make the hypothesis testable.</h2>

                <p>
                  Every important experiment parameter is visible and
                  editable. Nothing important is hidden.
                </p>
              </div>

              <TrendingDown />
            </div>

            <div className="definition-note">
              <Database size={17} />

              <span>
                These are experiment parameters, not facts. Change them if
                they do not match the research question.
              </span>
            </div>

            <div className="grid2">
              <Field label="Market / instrument">
                <input
                  value={experiment.market}
                  onChange={(event) =>
                    update("market", event.target.value)
                  }
                  placeholder="e.g. NIFTY"
                />
              </Field>

              <Field
                label="Sharp fall threshold (%)"
                hint="Minimum percentage decline required to create a signal."
              >
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={experiment.condition.fallPercent}
                  onChange={(event) =>
                    update(
                      "condition.fallPercent",
                      event.target.value
                    )
                  }
                />
              </Field>

              <Field label="Lookback window (days)">
                <input
                  type="number"
                  min="1"
                  value={experiment.condition.lookbackDays}
                  onChange={(event) =>
                    update(
                      "condition.lookbackDays",
                      event.target.value
                    )
                  }
                />
              </Field>

              <Field label="Holding period (days)">
                <input
                  type="number"
                  min="1"
                  value={experiment.holdingPeriodDays}
                  onChange={(event) =>
                    update(
                      "holdingPeriodDays",
                      event.target.value
                    )
                  }
                />
              </Field>

              <Field label="Test start">
                <input
                  type="date"
                  value={experiment.testPeriod.start}
                  onChange={(event) =>
                    update(
                      "testPeriod.start",
                      event.target.value
                    )
                  }
                />
              </Field>

              <Field label="Test end">
                <input
                  type="date"
                  value={experiment.testPeriod.end}
                  onChange={(event) =>
                    update(
                      "testPeriod.end",
                      event.target.value
                    )
                  }
                />
              </Field>

              <Field
                label="Transaction cost (%)"
                hint="Simplified round-trip research assumption."
              >
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={experiment.costPercent}
                  onChange={(event) =>
                    update(
                      "costPercent",
                      event.target.value
                    )
                  }
                />
              </Field>

              <Field label="Relevant filters">
                <input
                  value={experiment.filters}
                  onChange={(event) =>
                    update("filters", event.target.value)
                  }
                />
              </Field>
            </div>

            <Field label="Entry rule">
              <textarea
                rows="2"
                value={experiment.entry}
                onChange={(event) =>
                  update("entry", event.target.value)
                }
              />
            </Field>

            <Field label="Exit rule">
              <textarea
                rows="2"
                value={experiment.exit}
                onChange={(event) =>
                  update("exit", event.target.value)
                }
              />
            </Field>

            <Field label="Hypothesis">
              <textarea
                rows="3"
                value={experiment.hypothesis}
                onChange={(event) =>
                  update("hypothesis", event.target.value)
                }
              />
            </Field>

            <div className="choice-row">
              <button
                className="secondary"
                onClick={() => setStage(1)}
              >
                <ArrowLeft size={17} />
                Back
              </button>

              <button
                className="primary"
                onClick={lockDefinition}
              >
                Lock definition & continue
                <ArrowRight size={17} />
              </button>
            </div>
          </section>
        )}

        {/* TEST */}

        {stage === 3 && (
          <section className="card stage-card">
            <div className="card-title">
              <div>
                <span className="tag">04 · TEST</span>

                <h2>Run the experiment.</h2>

                <p>
                  The prototype runs the defined rule against reproducible
                  simulated OHLC data.
                </p>
              </div>

              <TrendingUp />
            </div>

            <div className="experiment-summary">
              <div>
                <span>MARKET</span>
                <strong>{experiment.market}</strong>
              </div>

              <div>
                <span>TRIGGER</span>

                <strong>
                  ≥ {experiment.condition.fallPercent}% fall over{" "}
                  {experiment.condition.lookbackDays} day(s)
                </strong>
              </div>

              <div>
                <span>HOLD</span>
                <strong>
                  {experiment.holdingPeriodDays} day(s)
                </strong>
              </div>

              <div>
                <span>TEST WINDOW</span>
                <strong>
                  {experiment.testPeriod.start} →{" "}
                  {experiment.testPeriod.end}
                </strong>
              </div>
            </div>

            <div className="data-note">
              <CircleAlert size={17} />

              <div>
                <b>Data boundary</b>

                <p>
                  This prototype uses simulated data. It demonstrates the
                  research workflow and calculation mechanics; it is not real
                  market evidence and must not be treated as investment advice.
                </p>
              </div>
            </div>

            <div className="locked-definition">
              <h3>Experiment being tested</h3>

              <p>
                <strong>Entry:</strong> {experiment.entry}
              </p>

              <p>
                <strong>Exit:</strong> {experiment.exit}
              </p>

              <p>
                <strong>Filters:</strong> {experiment.filters}
              </p>

              <p>
                <strong>Cost:</strong> {experiment.costPercent}%
              </p>

              <p>
                <strong>Hypothesis:</strong> {experiment.hypothesis}
              </p>
            </div>

            <div className="choice-row">
              <button
                className="secondary"
                onClick={() => setStage(2)}
              >
                <ArrowLeft size={17} />
                Change definition
              </button>

              <button
                className="primary"
                onClick={runTest}
                disabled={loading}
              >
                {loading ? "Running experiment…" : "Run test"}
                <ArrowRight size={17} />
              </button>
            </div>
          </section>
        )}

        {/* LEARN */}

        {stage === 4 && result?.metrics && (
          <section className="card stage-card">
            <div className="card-title">
              <div>
                <span className="tag">05 · LEARN</span>

                <h2>What did we actually learn?</h2>

                <p>
                  The prototype separates observed evidence from the system's
                  interpretation.
                </p>
              </div>

              <TrendingUp />
            </div>

            <div className="metric-grid">
              <div className="metric">
                <span>QUALIFYING SIGNALS</span>
                <strong>{result.metrics.signals}</strong>
              </div>

              <div className="metric">
                <span>WIN RATE</span>
                <strong>{result.metrics.winRate}%</strong>
              </div>

              <div className="metric">
                <span>AVG. NET RETURN</span>
                <strong>
                  {result.metrics.averageNetReturn}%
                </strong>
              </div>

              <div className="metric">
                <span>BENCHMARK</span>
                <strong>
                  {result.metrics.benchmarkReturn}%
                </strong>
              </div>
            </div>

            <div className="learn-grid">
              <div className="learn evidence">
                <h3>What the data shows</h3>

                {result.metrics.signals > 0 ? (
                  <p>
                    The experiment found{" "}
                    <strong>{result.metrics.signals}</strong>{" "}
                    qualifying signals. The average net return was{" "}
                    <strong>
                      {result.metrics.averageNetReturn}%
                    </strong>
                    , with a{" "}
                    <strong>{result.metrics.winRate}%</strong>{" "}
                    win rate. The best trade was{" "}
                    <strong>{result.metrics.bestTrade}%</strong>{" "}
                    and the worst trade was{" "}
                    <strong>{result.metrics.worstTrade}%</strong>.
                  </p>
                ) : (
                  <p>
                    No qualifying signals were found during the selected
                    testing window.
                  </p>
                )}

                <small>{result.source}</small>
              </div>

              <div className="learn conclusion">
                <h3>What we can reasonably conclude</h3>

                <p>{conclusion}</p>
              </div>
            </div>

            <div className="learn-grid">
              <div className="learn">
                <h3>What should we investigate next?</h3>

                <ul>
                  <li>
                    Repeat the experiment using cleaned historical market
                    data.
                  </li>

                  <li>
                    Compare multiple thresholds and holding periods without
                    optimizing only for the best result.
                  </li>

                  <li>
                    Test out-of-sample periods to reduce overfitting risk.
                  </li>

                  <li>
                    Model realistic slippage, taxes, liquidity and execution.
                  </li>
                </ul>
              </div>

              <div className="learn">
                <h3>Known limitations</h3>

                <ul>
                  {(result.limitations || []).map(
                    (item, index) => (
                      <li key={index}>{item}</li>
                    )
                  )}
                </ul>
              </div>
            </div>

            {result.trades?.length > 0 && (
              <div className="trade-table">
                <h3>Sample qualifying events</h3>

                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Entry</th>
                        <th>Exit</th>
                        <th>Fall</th>
                        <th>Gross</th>
                        <th>Net</th>
                      </tr>
                    </thead>

                    <tbody>
                      {result.trades
                        .slice(0, 8)
                        .map((trade, index) => (
                          <tr key={index}>
                            <td>{trade.entryDate}</td>
                            <td>{trade.exitDate}</td>
                            <td>
                              {trade.fallPercent}%
                            </td>
                            <td>
                              {trade.grossReturn}%
                            </td>
                            <td>
                              {trade.netReturn}%
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="choice-row">
              <button
                className="secondary"
                onClick={() => setStage(2)}
              >
                <ArrowLeft size={17} />
                Change & retest
              </button>

              <button className="primary" onClick={reset}>
                Start another question
                <ArrowRight size={17} />
              </button>
            </div>
          </section>
        )}

        <footer>
          <span>
            Prototype research environment · simulated data · not financial
            advice
          </span>

          <span>Build less. Think more.</span>
        </footer>
      </main>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);