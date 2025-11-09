// server.js
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import OpenAI from "openai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: "5mb" }));
app.use(express.static(path.join(__dirname, "public")));

app.post("/generate", async (req, res) => {
  try {
    const { prompt, size = "1024x1024", n = 1 } = req.body || {};

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ error: "Vui lòng nhập mô tả bức ảnh." });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "OPENAI_API_KEY không tồn tại trên server." });
    }

    // KHỞI TẠO TRONG HANDLER (chỉ khi có request)
    const openai = new OpenAI({ apiKey });

    const result = await openai.images.generate({
      model: "gpt-image-1",
      prompt,
      size,
      n
    });

    const urls = result?.data?.map((it) => it?.url).filter(Boolean) ?? [];
    return res.json({ images: urls, raw: result?.data });
  } catch (err) {
    console.error("Generate error:", err);
    const msg =
      err?.response?.data?.error?.message ||
      err?.message ||
      "Lỗi không xác định";
    return res.status(500).json({ error: msg });
  }
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server started on http://0.0.0.0:${PORT}`);
});
