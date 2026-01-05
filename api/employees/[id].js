import { authenticateToken } from '../_auth.js';
import { db } from '../_db.js';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  return authenticateToken(req, res, (req, res) => {
    const { id } = req.query;

    if (req.method === 'PUT') {
      const { name } = req.body;
      db.updateEmployee(id, name);
      return res.json({ success: true });
    }

    if (req.method === 'DELETE') {
      db.deleteEmployee(id);
      return res.json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  });
}
