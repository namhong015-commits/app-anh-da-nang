// AI Image Studio – Backend Web API (Node/Express) – Windows-ready (CommonJS)
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const fetch = require('node-fetch');

dotenv.config();

const PORT = process.env.PORT || 8787;
const PROVIDER = (process.env.PROVIDER || 'local').toLowerCase();
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN || '';

const app = express();
app.use(cors());
app.use(express.json({ limit: '25mb' }));

function svgDataUrl(lines = []) {
  const body = [
    "<svg xmlns='http://www.w3.org/2000/svg' width='1024' height='1024'>",
    "<rect width='1024' height='1024' fill='white'/>",
    "<g font-family='Arial' fill='black'>",
    "<text x='50' y='80' font-size='34' font-weight='bold'>AI Image Studio Local Preview</text>",
    ...lines.map((t, i) => `<text x='50' y='${140 + i * 30}' font-size='20'>${t}</text>`),
    "</g>",
    "</svg>"
  ].join('');
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(body)}`;
}

async function callOpenAIImages(prompt) {
  if (!OPENAI_API_KEY) throw new Error('Thiếu OPENAI_API_KEY trong .env');
  const resp = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({ model: 'gpt-image-1', prompt, size: '1024x1024', n: 1 })
  });
  if (!resp.ok) throw new Error(await resp.text());
  const data = await resp.json();
  const first = data && data.data && data.data[0];
  if (first && first.b64_json) return [`data:image/png;base64,${first.b64_json}`];
  if (first && first.url) return [first.url];
  return [svgDataUrl(['(OpenAI trả về trống)'])];
}

async function callReplicate(model, input) {
  if (!REPLICATE_API_TOKEN) throw new Error('Thiếu REPLICATE_API_TOKEN trong .env');
  const create = await fetch('https://api.replicate.com/v1/predictions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Token ${REPLICATE_API_TOKEN}`
    },
    body: JSON.stringify({ version: model, input })
  });
  if (!create.ok) throw new Error(await create.text());
  const job = await create.json();
  let url = job.urls.get;
  for (let i = 0; i < 60; i++) {
    const r = await fetch(url, { headers: { Authorization: `Token ${REPLICATE_API_TOKEN}` } });
    const j = await r.json();
    if (j.status === 'succeeded') {
      const out = Array.isArray(j.output) ? j.output : [j.output];
      return out.map(x => (typeof x === 'string' ? x : svgDataUrl(['Output không hỗ trợ'])));
    }
    if (['failed', 'canceled'].includes(j.status)) throw new Error(`Replicate ${j.status}`);
    await new Promise(r => setTimeout(r, 1500));
  }
  throw new Error('Replicate timeout');
}

app.get('/', (_, res) => res.json({ ok: true, provider: PROVIDER }));

app.post('/generate/creative', async (req, res) => {
  try {
    const { prompt = 'Ảnh sáng tạo', n = 1, provider = PROVIDER } = req.body || {};
    if (provider === 'openai') return res.json({ images: await callOpenAIImages(prompt) });
    if (provider === 'replicate') return res.json({ images: await callReplicate('sdxl-version', { prompt }) });
    const count = Math.max(1, Number(n) || 1);
    const images = Array.from({ length: count }, (_, i) => svgDataUrl([`Ảnh sáng tạo (demo) #${i + 1}`, prompt]));
    res.json({ images });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/generate/tryon', async (req, res) => {
  try {
    const { gender, category, idea, prompt = '', provider = PROVIDER } = req.body || {};
    const desc = `Try-on: ${gender} – ${category} – ${idea}. ${prompt}`;
    if (provider === 'openai') return res.json({ images: await callOpenAIImages(desc) });
    if (provider === 'replicate') return res.json({ images: await callReplicate('sdxl-version', { prompt: desc }) });
    res.json({ images: [svgDataUrl(['Ảnh thử đồ (demo)', desc])] });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/generate/product', async (req, res) => {
  try {
    const { background = 'studio trắng', caption = '', provider = PROVIDER } = req.body || {};
    const desc = `Sản phẩm nền ${background}. ${caption}`;
    if (provider === 'openai') return res.json({ images: await callOpenAIImages(desc) });
    if (provider === 'replicate') return res.json({ images: await callReplicate('sdxl-version', { prompt: desc }) });
    res.json({ images: [svgDataUrl(['Ảnh sản phẩm (demo)', desc])] });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.listen(PORT, () => console.log(`✅ Server chạy tại http://localhost:${PORT} (provider=${PROVIDER})`));
