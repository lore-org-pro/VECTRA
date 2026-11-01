// ========================================================
// VECTRA Serverless — GET /api/health
// ========================================================
export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.status(200).json({
    status: 'online',
    system: 'VECTRA Vectorial AI',
    timestamp: new Date().toISOString(),
    environment: 'vercel',
    nodeVersion: process.version
  });
}
