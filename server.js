// server.js (ESM)
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import OpenAI from "openai";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: "5mb" }));
app.use(express.static(path.join(__dirname))); // nếu index.html nằm cùng thư mục

// OpenAI client
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// API tạo ảnh
app.post("/generate", async (req, res) => {
  try {
    const { prompt, size = "1024x1024", n = 1 } = req.body || {};
    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ error: "Vui lòng nhập mô tả (prompt)!" });
    }

    const resp = await openai.images.generate({
      model: "gpt-image-1",
      prompt,
      size, // "1024x1024" | "1024x1536" | "1536x1024"
      n
    });

    const images = (resp.data || []).map(d => `data:image/png;base64,${d.b64_json}`);
    res.json({ images });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: String(e.message || e) });
  }
});

// Trang chính (nếu dùng index.html)
app.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
