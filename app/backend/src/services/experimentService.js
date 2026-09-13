function hashString(value) {
  let hash = 2166136261;

  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function createRandom(seed) {
  let state = seed >>> 0;

  return () => {
    state = Math.imul(1664525, state) + 1013904223;

    return (state >>> 0) / 4294967296;
  };
}

function generateSeries(seedText, count = 1000) {
  const random = createRandom(hashString(seedText));

  let price = 18000 + random() * 1500;

  const rows = [];

  for (let i = 0; i < count; i++) {
    const date = new Date(Date.UTC(2023, 0, 2 + i));

    const marketCycle = Math.sin(i / 23) * 0.0015;

    const randomMove = (random() - 0.5) * 0.03;

    const drift = 0.00025;

    const returnValue =
      drift + marketCycle + randomMove;

    const open = price;

    const close = Math.max(
      1000,
      price * (1 + returnValue)
    );

    const high =
      Math.max(open, close) *
      (1 + random() * 0.008);

    const low =
      Math.min(open, close) *
      (1 - random() * 0.008);

    rows.push({
      date: date.toISOString().slice(0, 10),
      open,
      high,
      low,
      close,
    });

    price = close;
  }

  return rows;
}

function percentageChange(start, end) {
  if (!start) return 0;

  return ((end / start) - 1) * 100;
}

function runExperiment(experiment) {
  if (!experiment) {
    throw new Error("Experiment definition is required.");
  }

  const market =
    String(experiment.market || "").trim();

  if (!market) {
    throw new Error("Market / instrument is required.");
  }

  const lookback = Math.max(
    1,
    Number(experiment.condition?.lookbackDays || 1)
  );

  const threshold = Math.abs(
    Number(experiment.condition?.fallPercent || 0)
  );

  const holding = Math.max(
    1,
    Number(experiment.holdingPeriodDays || 1)
  );

  const cost = Math.max(
    0,
    Number(experiment.costPercent || 0)
  );

  if (threshold <= 0) {
    throw new Error(
      "Fall threshold must be greater than zero."
    );
  }

  const start =
    experiment.testPeriod?.start || "2024-01-01";

  const end =
    experiment.testPeriod?.end || "2025-12-31";

  if (start >= end) {
    throw new Error(
      "Test start date must be before test end date."
    );
  }

  /*
   * The seed changes whenever an important experiment
   * parameter changes.
   *
   * This means different definitions produce different
   * reproducible simulated datasets.
   */

  const seed = [
    market,
    lookback,
    threshold,
    holding,
    start,
    end,
  ].join("|");

  const data = generateSeries(seed);

  const testData = data.filter(
    (row) =>
      row.date >= start &&
      row.date <= end
  );

  if (testData.length < lookback + holding + 1) {
    throw new Error(
      "The selected test window is too small for the chosen parameters."
    );
  }

  const trades = [];

  for (
    let i = lookback;
    i < data.length - holding;
    i++
  ) {
    const current = data[i];

    if (
      current.date < start ||
      current.date > end
    ) {
      continue;
    }

    const previous =
      data[i - lookback];

    const fallPercent = percentageChange(
      previous.close,
      current.close
    );

    /*
     * A signal happens when the current close
     * is at least threshold % below the price
     * lookback days earlier.
     */

    if (fallPercent <= -threshold) {
      const exitIndex = i + holding;

      if (!data[exitIndex]) {
        continue;
      }

      const exit = data[exitIndex];

      const grossReturn = percentageChange(
        current.close,
        exit.close
      );

      const netReturn =
        grossReturn - cost;

      trades.push({
        entryDate: current.date,
        exitDate: exit.date,
        fallPercent: Number(
          fallPercent.toFixed(2)
        ),
        grossReturn: Number(
          grossReturn.toFixed(2)
        ),
        netReturn: Number(
          netReturn.toFixed(2)
        ),
      });

      /*
       * Avoid counting many overlapping signals
       * from the same price event.
       */

      i += Math.max(
        0,
        Math.floor(holding / 2)
      );
    }
  }

  const returns = trades.map(
    (trade) => trade.netReturn
  );

  const signals = returns.length;

  const winningTrades = returns.filter(
    (value) => value > 0
  ).length;

  const averageNetReturn = signals
    ? returns.reduce(
        (sum, value) => sum + value,
        0
      ) / signals
    : 0;

  const cumulativeTradeReturn =
    returns.reduce(
      (sum, value) => sum + value,
      0
    );

  const bestTrade = signals
    ? Math.max(...returns)
    : 0;

  const worstTrade = signals
    ? Math.min(...returns)
    : 0;

  const benchmarkReturn =
    testData.length > 1
      ? percentageChange(
          testData[0].close,
          testData[testData.length - 1].close
        )
      : 0;

  return {
    source:
      "Reproducible simulated OHLC data generated locally for prototype demonstration; not live market data.",

    experiment,

    sampleSize: testData.length,

    trades,

    metrics: {
      signals,

      winRate: Number(
        (
          signals
            ? (winningTrades / signals) * 100
            : 0
        ).toFixed(1)
      ),

      averageNetReturn: Number(
        averageNetReturn.toFixed(2)
      ),

      cumulativeTradeReturn: Number(
        cumulativeTradeReturn.toFixed(2)
      ),

      bestTrade: Number(
        bestTrade.toFixed(2)
      ),

      worstTrade: Number(
        worstTrade.toFixed(2)
      ),

      benchmarkReturn: Number(
        benchmarkReturn.toFixed(2)
      ),
    },

    limitations: [
      "The price series is simulated, so the result is not evidence about real market performance.",
      "The prototype uses a simplified event-based test rather than a production-grade backtesting engine.",
      "Execution is represented by closing prices and does not model intraday fills.",
      "Slippage, taxes, liquidity and market impact are not fully modelled.",
      "A small number of qualifying signals can make the observed result unstable.",
      "Trying many parameters can introduce overfitting and multiple-testing risk.",
      "The experiment does not establish causality or guarantee future performance.",
    ],

    dataPreview: testData.slice(-8),
  };
}

module.exports = {
  runExperiment,
};