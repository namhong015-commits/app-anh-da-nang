app.use(express.json({ limit: '1mb' }));

app.post('/generate', async (req, res) => {
  try {
    const { prompt, size = '1024x1024', n = 1 } = req.body || {};
    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ error: 'Missing prompt' });
    }

    const count = Math.max(1, Math.min(parseInt(n, 10) || 1, 4)); // tạo tối đa 4 ảnh/lần
    console.log('[POST /generate]', { prompt: prompt.slice(0, 80), size, n: count });

    const urls = [];
    for (let i = 0; i < count; i++) {
      const img = await openai.images.generate({
        model: 'gpt-image-1',
        prompt,
        size
      });
      const url = img.data?.[0]?.url;
      if (!url) throw new Error('OpenAI không trả URL ảnh');
      urls.push(url);
    }

    return res.json({ urls });
  } catch (err) {
    console.error('API /generate error:', err);
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
});
