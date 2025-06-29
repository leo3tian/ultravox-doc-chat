const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 4000;

const API_KEY = process.env.ULTRAVOX_API_KEY;
const AGENT = process.env.ULTRAVOX_AGENT;

app.use(cors());
app.use(express.json());

app.post("/create-call", async (req, res) => {
  try {
    const fetch = (await import("node-fetch")).default;

    const response = await fetch(`https://api.ultravox.ai/api/calls`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": API_KEY,
      },
      body: JSON.stringify({systemPrompt: req.body.systemPrompt, model: req.body.model, voice: req.body.voice}),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Ultravox API error:", data);
      return res.status(response.status).json(data);
    }
    console.log(data);
    res.status(200).json(data);
  } catch (err) {
    console.error("Proxy server error:", err);
    res.status(500).json({ error: "Proxy error", details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server running at http://localhost:${PORT}`);
});
