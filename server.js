// server.js
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import OpenAI from "openai";

// Đường dẫn thư mục chạy ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// parse JSON body + phục vụ static từ /public
app.use(express.json({ limit: "5mb" }));
app.use(express.static(path.join(__dirname, "public"))); // có public/index.html

// Khởi tạo OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // khai báo trên Railway
});

// API tạo ảnh
app.post("/generate", async (req, res) => {
  try {
    const { prompt, size = "1024x1024", n = 1 } = req.body || {};
    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    // gọi API: trả base64
    const result = await openai.images.generate({
      model: "gpt-image-1",
      prompt,
      size,             // "1024x1024" | "1024x1536" | ...
      n: Number(n) || 1,
      response_format: "b64_json",
    });

    // chuyển về data URL để frontend hiển thị
    const images = (result?.data || []).map((item) => {
      const b64 = item?.b64_json || "";
      return `data:image/png;base64,${b64}`;
    });

    return res.json({ images });
  } catch (err) {
    console.error("Generate error:", err?.response?.data || err?.message || err);
    return res.status(500).json({
      error: err?.response?.data || err?.message || "Unknown error",
    });
  }
});

// cổng Railway cung cấp qua biến PORT
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
