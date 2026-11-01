// ========================================================
// VECTRA Serverless — GET /api/supabase/status
// ========================================================
import 'dotenv/config';
import { supabaseService } from '../_lib/services/supabaseService.js';

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const status = supabaseService.getStatus();
  return res.status(200).json(status);
}
