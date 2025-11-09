// server.js
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import OpenAI from "openai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: "5mb" }));

// Serve static files từ thư mục public
app.use(express.static(path.join(__dirname, "public")));

// --- API GENERATE ---
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.post("/generate", async (req, res) => {
  try {
    const { prompt, size = "1024x1024", n = 1 } = req.body || {};

    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return res.status(400).json({ error: "Thiếu prompt hợp lệ" });
    }

    // size hợp lệ: 1024x1024 | 1024x1536 | 1536x1024 | auto
    const sz = ["1024x1024", "1024x1536", "1536x1024", "auto"].includes(size)
      ? size
      : "1024x1024";

    // Gọi OpenAI Images
    const out = await client.images.generate({
      model: "gpt-image-1",
      prompt,
      size: sz === "auto" ? "1024x1024" : sz,
      n: Math.min(Math.max(parseInt(n) || 1, 1), 4), // 1..4
      response_format: "b64_json",
    });

    const images =
      out?.data?.map((d) => `data:image/png;base64,${d.b64_json}`) || [];

    return res.json({ images });
  } catch (err) {
    console.error("Error /generate:", err?.response?.data || err);
    return res.status(500).json({
      error: "Lỗi khi tạo ảnh",
      detail: err?.message || String(err),
    });
  }
});

// Fallback (mở SPA / public/index.html) – Để cuối cùng
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
