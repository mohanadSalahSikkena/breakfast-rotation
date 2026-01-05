import { authenticateToken } from './_auth.js';
import { db } from './_db.js';

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

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  return authenticateToken(req, res, (req, res) => {
    // URL format: /api/export?type=breakfast
    const { type } = req.query;

    if (!type) {
      return res.status(400).json({ error: 'Missing type parameter' });
    }

    const history = db.getHistory(type);

    let csv = 'ID,Employee ID,Employee Name,Date\n';
    history.forEach(item => {
      const date = new Date(item.date).toISOString();
      csv += `${item.id},${item.employee_id},"${item.employee_name}",${date}\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${type}-history.csv"`);
    res.send(csv);
  });
}
