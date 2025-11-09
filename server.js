import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import OpenAI from "openai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post("/generate", async (req, res) => {
  try {
    const { prompt, size, n } = req.body;

    const result = await client.images.generate({
      model: "gpt-image-1",
      prompt,
      size,
      n,
    });

    const images = result.data.map(d => d.url || `data:image/png;base64,${d.b64_json}`);
    res.json({ images });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || "Lỗi tạo ảnh" });
  }
});

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
