// server.js
// App tạo ảnh từ mô tả: Node.js + Express + OpenAI Images (gpt-image-1)

const express = require("express");
const path = require("path");
const OpenAI = require("openai");

const app = express();

// đọc JSON body & tăng limit một chút cho an toàn
app.use(express.json({ limit: "2mb" }));

// Trang giao diện (index.html ở root repo)
app.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// API tạo ảnh
app.post("/generate", async (req, res) => {
  try {
    const { prompt, size = "1024x1024" } = req.body || {};
    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ error: "Vui lòng nhập mô tả (prompt)!" });
    }

    // Khởi tạo OpenAI client với API key đã lưu ở Railway
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    // Gọi Images API (gpt-image-1)
    const img = await client.images.generate({
      model: "gpt-image-1",
      prompt: prompt.trim(),
      size, // "256x256" | "512x512" | "1024x1024"
      // bạn có thể thêm: background: "transparent", quality: "high" ...
    });

    // API trả về base64
    const b64 = img.data[0].b64_json;
    return res.json({ dataUrl: `data:image/png;base64,${b64}` });
  } catch (err) {
    console.error("Generate error:", err);
    // trả lỗi “đẹp” cho UI
    const msg =
      err?.response?.data?.error?.message ||
      err?.message ||
      "Đã có lỗi xảy ra khi tạo ảnh.";
    res.status(500).json({ error: msg });
  }
});

// Cấu hình PORT/host cho Railway
const PORT = process.env.PORT || 8080;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server started on ${PORT}`);
});
