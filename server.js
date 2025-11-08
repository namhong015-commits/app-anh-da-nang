// server.js
// App tạo ảnh từ mô tả: Node.js + Express + OpenAI Images (gpt-image-1)

import express from "express";
import path from "path";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json({ limit: "5mb" }));
app.use(express.static("public"));

// Trang chủ
app.get("/", (req, res) => {
  res.sendFile(path.resolve("index.html"));
});

// API tạo ảnh
app.post("/generate", async (req, res) => {
  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const { prompt, size = "1024x1024" } = req.body || {};

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ error: "Vui lòng nhập mô tả (prompt)!" });
    }

    const result = await openai.images.generate({
      model: "gpt-image-1",
      prompt,
      size,
    });

    res.json({ imageUrl: result.data[0].url });
  } catch (error) {
    console.error("❌ Lỗi tạo ảnh:", error);
    res.status(500).json({ error: error.message });
  }
});

// Chạy server
app.listen(PORT, () => console.log(`🚀 Server đang chạy tại cổng ${PORT}`));
