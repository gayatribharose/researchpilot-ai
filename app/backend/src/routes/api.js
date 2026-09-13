const express = require("express");

const {
  analyzeQuestion,
} = require("../services/aiService");

const {
  runExperiment,
} = require("../services/experimentService");

const router = express.Router();

router.get("/health", (req, res) => {
  res.json({
    ok: true,
    service: "research-assistant-api",
  });
});

router.post("/analyze", async (req, res) => {
  try {
    const question = String(
      req.body?.question || ""
    ).trim();

    if (!question) {
      return res.status(400).json({
        error: "Question is required.",
      });
    }

    const result =
      await analyzeQuestion(question);

    return res.json(result);
  } catch (error) {
    console.error("ANALYZE ERROR:", error);

    return res.status(500).json({
      error:
        error.message ||
        "Question analysis failed.",
    });
  }
});

router.post("/experiment", (req, res) => {
  try {
    const experiment =
      req.body?.experiment;

    if (!experiment) {
      return res.status(400).json({
        error: "Experiment definition is required.",
      });
    }

    const result =
      runExperiment(experiment);

    return res.json(result);
  } catch (error) {
    console.error("EXPERIMENT ERROR:", error);

    return res.status(400).json({
      error:
        error.message ||
        "Experiment could not be completed.",
    });
  }
});

module.exports = router;