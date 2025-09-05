import formidable from "formidable";
import fs from "fs";

export const config = {
  api: {
    bodyParser: false, // ❌ disable bodyParser for multipart
  },
};

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  const form = formidable({ multiples: true });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(500).json({ error: "Error parsing form data" });
    }

    try {
      console.log("📩 Fields:", fields);
      console.log("📂 Files:", files);

      // Example: read Aadhaar files as base64 to forward to GAS
      const aadhaarFront = files.aadhaar_front
        ? fs.readFileSync(files.aadhaar_front.filepath, { encoding: "base64" })
        : null;
      const aadhaarBack = files.aadhaar_back
        ? fs.readFileSync(files.aadhaar_back.filepath, { encoding: "base64" })
        : null;

      const forwardBody = {
        orderId: fields.orderId,
        customerEmail: fields.customerEmail,
        kycRequests: [
          { kycType: fields.type1, formData: { ...fields, aadhaar_front: aadhaarFront, aadhaar_back: aadhaarBack } },
          { kycType: fields.type2, formData: { ...fields } }
        ]
      };

      // Forward to GAS
      const response = await fetch("https://script.google.com/macros/s/AKfycbyJ_KjANEK882iR6tthWicDgqcbpI2molcBSk6-AyuNtbSJd9ahrYh3tXUEiaXCSyd0fQ/exec", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(forwardBody)
      });

      const text = await response.text();
      res.status(response.status).send(text);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
}
