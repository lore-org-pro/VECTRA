// ========================================================
// VECTRA Serverless — GET /api/providers
// ========================================================
import 'dotenv/config';
import { llmRouter } from './_lib/router/llmRouter.js';
import { circuitBreaker } from './_lib/router/circuitBreaker.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
    const telemetry = circuitBreaker.getAllTelemetry ? circuitBreaker.getAllTelemetry() : [];
    return res.status(200).json({ providers: telemetry });
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
