import Busboy from "busboy";

export const config = {
  api: {
    bodyParser: false, // disable Next.js default parser
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const busboy = Busboy({ headers: req.headers });

  let formData = {}; // collect everything

  busboy.on("field", (name, val) => {
    formData[name] = val;
  });

  busboy.on("file", (name, file, info) => {
    const chunks = [];
    file.on("data", (chunk) => chunks.push(chunk));
    file.on("end", () => {
      const buffer = Buffer.concat(chunks);
      formData[name] = buffer.toString("base64"); // convert to base64
      formData[name + "_type"] = info.mimeType;   // keep file type
    });
  });

  busboy.on("finish", async () => {
    try {
      console.log("✅ Parsed formData:", Object.keys(formData));

      // Forward the request to GAS (or IDfy later)
      const response = await fetch(
        "https://script.google.com/macros/s/AKfycbyJ_KjANEK882iR6tthWicDgqcbpI2molcBSk6-AyuNtbSJd9ahrYh3tXUEiaXCSyd0fQ/exec",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      const result = await response.json();
      res.status(200).json(result);
    } catch (err) {
      console.error("❌ Forwarding error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  req.pipe(busboy);
}
