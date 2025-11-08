// server.js
const express = require("express");
const path = require("path");
const OpenAI = require("openai");

const app = express();
app.use(express.json({ limit: "5mb" }));

// PORT Railway cấp, fallback 8080 khi chạy local
const PORT = process.env.PORT || 8080;

// Trang giao diện
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// API tạo ảnh
app.post("/api/generate", async (req, res) => {
  const { prompt, size = "512x512" } = req.body || {};
  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: "Thiếu OPENAI_API_KEY trên Railway." });
  }
  if (!prompt || !prompt.trim()) {
    return res.status(400).json({ error: "Vui lòng nhập prompt." });
  }

  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const result = await openai.images.generate({
      model: "gpt-image-1",
      prompt: prompt,
      size: size,
      response_format: "b64_json",
    });

    const b64 = result.data[0].b64_json;
    res.json({ image: `data:image/png;base64,${b64}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || "Lỗi tạo ảnh" });
  }
});

// Lưu ý listen trên 0.0.0.0 để Railway truy cập được
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`);
});



 
