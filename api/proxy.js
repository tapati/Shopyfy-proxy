export default async function handler(req, res) {
  // Add CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const { api_key } = req.body || {};

  // ✅ Validate API key before forwarding
  if (api_key !== "]|]umF,7/P37YNGqA@") {
    return res.status(401).json({ error: "Unauthorized - invalid API key" });
  }

  try {
    // Forward to GAS
    const response = await fetch(
      "https://script.google.com/macros/s/AKfycbyrD7WGb3ecmqaCBm9wi_55E5qWLDsr7j0g30WeZrG0ykQYE3eAhuESzybthhmdgnm6cA/exec",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req.body),
      }
    );

    const text = await response.text();
    res.status(response.status).send(text);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
