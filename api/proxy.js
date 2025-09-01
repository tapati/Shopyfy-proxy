export default async function handler(req, res) {
  // Allow Shopify App Proxy requests
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-Shopify-Storefront-Access-Token, X-Shopify-Api-Features, X-Shopify-Hmac-Sha256");

  // Handle preflight OPTIONS request
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    // Parse incoming body (Shopify app proxy sometimes sends query params)
    const body = req.body && Object.keys(req.body).length > 0
      ? req.body
      : req.query; // fallback for GET requests

    // Forward request to Google Apps Script
    const response = await fetch(
      "https://script.google.com/macros/s/AKfycbxQB9bkb6FGkmP_e6lkMlU0R9fNTJMIOCV3Jd9A4YJhmMqbJzjQvq66IPkLq2OGeCh1Pg/exec",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );

    const text = await response.text();

    // Pass status + response back to Shopify
    res.status(response.status).send(text);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
