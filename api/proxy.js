  export default async function handler(req, res) {
  // Add CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    // Forward to Google Apps Script endpoint
    const response = await fetch("https://script.google.com/macros/s/AKfycbzMOtryLziqnpuivN9XiRxf4wrU_HVOGxYOXzh6KFEFU40IFWoluXPycoA3Zz7gc0AiMA/exec", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });

    const text = await response.text();
    res.status(response.status).send(text);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

