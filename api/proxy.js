const API_KEY = "]|]umF,7/P37YNGqA@";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    const body = req.body;

    // ✅ API key check
    if (!body.api_key || body.api_key !== API_KEY) {
      return res.status(401).json({ error: "Unauthorized: Invalid API key" });
    }

    // Forward request to GAS
    const response = await fetch("https://script.google.com/macros/s/AKfycbyrD7WGb3ecmqaCBm9wi_55E5qWLDsr7j0g30WeZrG0ykQYE3eAhuESzybthhmdgnm6cA/exec", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const text = await response.text();
    res.status(response.status).send(text);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
