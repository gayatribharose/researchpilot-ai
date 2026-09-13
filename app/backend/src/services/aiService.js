function detectMarket(question) {
  const text = question.toUpperCase();

  if (text.includes("BANKNIFTY")) {
    return "BANKNIFTY";
  }

  if (text.includes("NIFTY")) {
    return "NIFTY";
  }

  if (text.includes("SENSEX")) {
    return "SENSEX";
  }

  if (text.includes("NASDAQ")) {
    return "NASDAQ";
  }

  if (text.includes("SP500") || text.includes("S&P 500")) {
    return "S&P 500";
  }

  return "";
}

function containsAny(text, words) {
  return words.some((word) =>
    text.toLowerCase().includes(word)
  );
}

function fallbackAnalyze(question) {
  const market = detectMarket(question);

  const hasFallLanguage = containsAny(
    question,
    [
      "fall",
      "drop",
      "decline",
      "crash",
      "down",
      "fell",
    ]
  );

  const assumptions = [];

  const missingInformation = [];

  if (!market) {
    missingInformation.push(
      "Which market or financial instrument should be tested?"
    );
  }

  if (hasFallLanguage) {
    assumptions.push(
      "The phrase 'sharp fall' needs a measurable percentage threshold and lookback window."
    );

    missingInformation.push(
      "What percentage decline should count as a 'sharp fall', and over what lookback period?"
    );
  } else {
    missingInformation.push(
      "What measurable market condition should trigger the experiment?"
    );
  }

  missingInformation.push(
    "What should the entry rule be after the condition is detected?"
  );

  missingInformation.push(
    "How long should the position be held and what should trigger the exit?"
  );

  missingInformation.push(
    "Which historical period should be used for the test?"
  );

  missingInformation.push(
    "What transaction-cost and execution assumptions should be included?"
  );

  const interpretedMarket =
    market || "the selected market/instrument";

  const interpretation = hasFallLanguage
    ? `Test whether buying ${interpretedMarket} after a measurable price decline is associated with positive subsequent returns.`
    : `Translate the user's market idea into a measurable condition, entry rule, holding period and outcome.`;

  return {
    userSaid: question,

    interpretation,

    market,

    assumptions,

    missingInformation,

    risks: [
      "Ambiguous definitions",
      "Incorrect assumptions",
      "Data quality",
      "Look-ahead bias",
      "Transaction costs",
      "Slippage",
      "Overfitting",
      "Insufficient evidence",
    ],

    confidence:
      "Prototype interpretation — important parameters must be confirmed before testing.",

    hypothesis:
      market
        ? `After the specified market condition occurs, buying ${market} may produce a positive subsequent return over the selected holding period.`
        : "The specified market condition may be associated with positive subsequent returns.",
  };
}

async function analyzeQuestion(question) {
  const apiKey = process.env.LLM_API_KEY;

  const apiUrl = process.env.LLM_API_URL;

  /*
   * If an LLM provider is configured, use it.
   * Otherwise the prototype remains functional
   * using the transparent local reasoning fallback.
   */

  if (!apiKey || !apiUrl) {
    return fallbackAnalyze(question);
  }

  const prompt = `
You are an AI research assistant.

Analyze the following natural-language market research question.

Return ONLY valid JSON.

Required keys:

userSaid
interpretation
market
assumptions
missingInformation
risks
confidence
hypothesis

Rules:

1. Preserve what the user actually said.
2. Do not invent important parameters as facts.
3. Identify ambiguity.
4. Clearly state assumptions.
5. Identify minimum information needed before testing.
6. Mention research risks such as look-ahead bias, transaction costs, slippage, overfitting and insufficient evidence where relevant.
7. The result will be shown to a user before the experiment is defined.

Question:

${question}
`;

  try {
    const response = await fetch(apiUrl, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },

      body: JSON.stringify({
        model:
          process.env.LLM_MODEL ||
          "gpt-4o-mini",

        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],

        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      throw new Error(
        `LLM request failed: ${response.status}`
      );
    }

    const body = await response.json();

    const content =
      body.choices?.[0]?.message?.content || "";

    const cleaned = content
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    const parsed = JSON.parse(cleaned);

    return parsed;
  } catch (error) {
    console.error(
      "LLM unavailable. Using local reasoning:",
      error.message
    );

    return {
      ...fallbackAnalyze(question),

      aiFallbackReason:
        "The configured AI provider was unavailable or returned invalid JSON. The prototype used its transparent local reasoning fallback.",
    };
  }
}

module.exports = {
  analyzeQuestion,
};