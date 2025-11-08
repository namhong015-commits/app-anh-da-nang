// server.js (CommonJS)
const express = require('express');
const path = require('path');
const cors = require('cors');
const OpenAI = require('openai').default;  // <- QUAN TRỌNG: .default

const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '5mb' }));

// Nếu bạn có index.html cùng thư mục:
app.use(express.static(__dirname));

// API tạo ảnh
app.post('/generate', async (req, res) => {
  try {
    const { prompt, size = '1024x1024' } = req.body || {};
    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ error: 'Vui lòng nhập mô tả (prompt)!' });
    }
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: 'Thiếu OPENAI_API_KEY trên server.' });
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const result = await openai.images.generate({
      model: 'gpt-image-1',
      prompt,
      size  // '1024x1024' | '1024x1536' | '1536x1024' | 'auto'
    });

    return res.json({ url: result.data[0].url });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message || 'Server error' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Server running on port ' + PORT));
