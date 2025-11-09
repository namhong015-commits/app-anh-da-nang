// server.js (đoạn gọi OpenAI)
const result = await openai.images.generate({
  model: "gpt-image-1",
  prompt,
  size, // "1024x1024" | "1024x1536" | "1536x1024" | "auto"
  n     // số lượng ảnh
});

// Chuyển kết quả thành data URL để hiển thị trên web
const images = result.data.map(d => `data:image/png;base64,${d.b64_json}`);
res.json({ images });
