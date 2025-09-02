const API_KEY = "umF,7/P37YNGqA@";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    console.log("Incoming body:", body);  // 👈 logs the request body in Vercel logs

    // ✅ API key check
    if (!body.api_key || body.api_key !== API_KEY) {
      return res.status(401).json({ error: "Unauthorized: Invalid API key" });
    }

    // Forward to GAS (strip API key if you don’t want to pass it)
    const forwardBody = { ...body };
    delete forwardBody.api_key;

    // Forward request to GAS
    const response = await fetch("https://script.google.com/macros/s/AKfycbxQB9bkb6FGkmP_e6lkMlU0R9fNTJMIOCV3Jd9A4YJhmMqbJzjQvq66IPkLq2OGeCh1Pg/exec", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(forwardBody),
    });

    const text = await response.text();
    res.status(response.status).send(text);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
