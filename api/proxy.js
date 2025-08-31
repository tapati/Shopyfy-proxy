// /api/proxy.js on Vercel
var accountId = "0c625e6c89f6/452ca24e-39f1-442b-80b0-b75a6ec43455";
var apiKey = "61662175-2ffe-40ab-8c0f-01e1f1672d56";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { kyc_type, payload } = req.body;

    // Map KYC type to IDfy endpoint
    const endpoints = {
      pan: "https://eve.idfy.com/v3/tasks/async/verify_with_source/ind_pan",
      aadhaar: "https://eve.idfy.com/v3/tasks/async/verify_with_source/ind_aadhaar",
      voter: "https://eve.idfy.com/v3/tasks/async/verify_with_source/ind_voter",
      passport: "https://eve.idfy.com/v3/tasks/async/verify_with_source/ind_passport",
      driving_license: "https://eve.idfy.com/v3/tasks/async/verify_with_source/ind_dl",
    };

    const endpoint = endpoints[kyc_type];
    if (!endpoint) {
      return res.status(400).json({ error: "Invalid KYC type" });
    }

    // Authorization header
    const auth = Buffer.from(
      process.env.apiKey + ":" + process.env.accountId
    ).toString("base64");

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${auth}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    res.status(response.status).json(data);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong", details: error.message });
  }
}
