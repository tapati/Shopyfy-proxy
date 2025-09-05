import formidable from "formidable";
import fs from "fs";

export const config = {
  api: {
    bodyParser: false, // disable Next.js body parser for file uploads
  },
  runtime: "nodejs",
};

export default async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const form = formidable({ multiples: true });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("❌ Formidable parse error:", err);
      return res.status(500).json({ error: "Form parse error" });
    }

    try {
      // Convert files to Base64
      let aadhaarFrontBase64 = null;
      if (files.aadhaar_front) {
        aadhaarFrontBase64 = fs.readFileSync(files.aadhaar_front[0].filepath, {
          encoding: "base64",
        });
      }

      let aadhaarBackBase64 = null;
      if (files.aadhaar_back) {
        aadhaarBackBase64 = fs.readFileSync(files.aadhaar_back[0].filepath, {
          encoding: "base64",
        });
      }

      // Prepare body for GAS
      const forwardBody = {
        orderId: fields.orderId,
        customerEmail: fields.customerEmail,
        kycRequests: [
          { kycType: "aadhaar_front", base64: aadhaarFrontBase64 },
          { kycType: "aadhaar_back", base64: aadhaarBackBase64 },
        ],
      };

      // Forward to GAS
      const response = await fetch(
        "https://script.google.com/macros/s/AKfycbyJ_KjANEK882iR6tthWicDgqcbpI2molcBSk6-AyuNtbSJd9ahrYh3tXUEiaXCSyd0fQ/exec",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(forwardBody),
        }
      );

      const result = await response.json();

      // ✅ Don’t send Base64 back to frontend
      return res.status(200).json({
        success: true,
        verification: result, // whatever IDfy returns
      });
    } catch (error) {
      console.error("❌ Proxy error:", error);
      return res.status(500).json({ error: error.message });
    }
  });
}
