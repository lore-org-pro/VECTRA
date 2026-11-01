// ========================================================
// VECTRA Serverless — GET /api/demo/questions
// ========================================================
import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const isVercel = process.env.VERCEL === '1';
  const questionsPath = isVercel
    ? '/var/task/demo-data/demoQuestions.json'
    : path.resolve(process.cwd(), 'demo-data/demoQuestions.json');

  try {
    if (fs.existsSync(questionsPath)) {
      const data = JSON.parse(fs.readFileSync(questionsPath, 'utf-8'));
      return res.status(200).json(data);
    } else {
      return res.status(200).json([
        '¿Suma los vectores (2, 3, -1) y (1, -4, 2)?',
        '¿Cuál es el producto punto de (1, 2, 3) y (4, 5, 6)?',
        '¿Cuál es el último modelo de Google Gemini?'
      ]);
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
