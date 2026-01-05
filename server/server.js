import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Initialize default admin user
const initAdminUser = () => {
  const stmt = db.prepare('SELECT * FROM admin_users WHERE username = ?');
  const existingAdmin = stmt.get(process.env.ADMIN_USERNAME);

  if (!existingAdmin) {
    const hashedPassword = bcrypt.hashSync(process.env.ADMIN_PASSWORD, 10);
    const insertStmt = db.prepare('INSERT INTO admin_users (username, password_hash) VALUES (?, ?)');
    insertStmt.run(process.env.ADMIN_USERNAME, hashedPassword);
    console.log('Default admin user created');
  }
};

initAdminUser();

// Auth Routes
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;

  const stmt = db.prepare('SELECT * FROM admin_users WHERE username = ?');
  const user = stmt.get(username);

  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, {
    expiresIn: '24h'
  });

  res.json({ token, username: user.username });
});

app.post('/api/auth/verify', authenticateToken, (req, res) => {
  res.json({ valid: true, username: req.user.username });
});

// Employee Routes
app.get('/api/employees', authenticateToken, (req, res) => {
  const stmt = db.prepare('SELECT * FROM employees ORDER BY id');
  const employees = stmt.all();
  res.json(employees);
});

app.post('/api/employees', authenticateToken, (req, res) => {
  const { name } = req.body;
  const stmt = db.prepare(`
    INSERT INTO employees (name, breakfast_turn_count, orders_turn_count, is_active)
    VALUES (?, 0, 0, 1)
  `);
  const result = stmt.run(name);
  res.json({ id: result.lastInsertRowid, name });
});

app.put('/api/employees/:id', authenticateToken, (req, res) => {
  const { name } = req.body;
  const stmt = db.prepare('UPDATE employees SET name = ? WHERE id = ?');
  stmt.run(name, req.params.id);
  res.json({ success: true });
});

app.delete('/api/employees/:id', authenticateToken, (req, res) => {
  const stmt = db.prepare('DELETE FROM employees WHERE id = ?');
  stmt.run(req.params.id);
  res.json({ success: true });
});

app.patch('/api/employees/:id/status', authenticateToken, (req, res) => {
  const { isActive } = req.body;
  const stmt = db.prepare('UPDATE employees SET is_active = ? WHERE id = ?');
  stmt.run(isActive ? 1 : 0, req.params.id);
  res.json({ success: true });
});

app.post('/api/employees/:id/complete/:type', authenticateToken, (req, res) => {
  const { id, type } = req.params;
  const now = Date.now();

  const employeeStmt = db.prepare('SELECT name FROM employees WHERE id = ?');
  const employee = employeeStmt.get(id);

  if (!employee) {
    return res.status(404).json({ error: 'Employee not found' });
  }

  if (type === 'breakfast') {
    const updateStmt = db.prepare(`
      UPDATE employees
      SET breakfast_last_turn_date = ?, breakfast_turn_count = breakfast_turn_count + 1
      WHERE id = ?
    `);
    updateStmt.run(now, id);

    const historyStmt = db.prepare(`
      INSERT INTO breakfast_history (employee_id, employee_name, date)
      VALUES (?, ?, ?)
    `);
    historyStmt.run(id, employee.name, now);
  } else if (type === 'orders') {
    const updateStmt = db.prepare(`
      UPDATE employees
      SET orders_last_turn_date = ?, orders_turn_count = orders_turn_count + 1
      WHERE id = ?
    `);
    updateStmt.run(now, id);

    const historyStmt = db.prepare(`
      INSERT INTO orders_history (employee_id, employee_name, date)
      VALUES (?, ?, ?)
    `);
    historyStmt.run(id, employee.name, now);
  }

  res.json({ success: true });
});

// History Routes
app.get('/api/history/:type', authenticateToken, (req, res) => {
  const { type } = req.params;
  const table = type === 'breakfast' ? 'breakfast_history' : 'orders_history';

  const stmt = db.prepare(`SELECT * FROM ${table} ORDER BY date DESC`);
  const history = stmt.all();
  res.json(history);
});

// Export to CSV
app.get('/api/export/csv/:type', authenticateToken, (req, res) => {
  const { type } = req.params;
  const table = type === 'breakfast' ? 'breakfast_history' : 'orders_history';

  const stmt = db.prepare(`SELECT * FROM ${table} ORDER BY date DESC`);
  const history = stmt.all();

  let csv = 'ID,Employee ID,Employee Name,Date\n';
  history.forEach(item => {
    const date = new Date(item.date).toISOString();
    csv += `${item.id},${item.employee_id},"${item.employee_name}",${date}\n`;
  });

  res.header('Content-Type', 'text/csv');
  res.header('Content-Disposition', `attachment; filename="${type}-history.csv"`);
  res.send(csv);
});

// Flattened routes for Vercel compatibility (also work locally)
app.post('/api/complete', authenticateToken, (req, res) => {
  const { id, type } = req.query;
  const now = Date.now();

  const employeeStmt = db.prepare('SELECT name FROM employees WHERE id = ?');
  const employee = employeeStmt.get(id);

  if (!employee) {
    return res.status(404).json({ error: 'Employee not found' });
  }

  if (type === 'breakfast') {
    const updateStmt = db.prepare(`
      UPDATE employees
      SET breakfast_last_turn_date = ?, breakfast_turn_count = breakfast_turn_count + 1
      WHERE id = ?
    `);
    updateStmt.run(now, id);

    const historyStmt = db.prepare(`
      INSERT INTO breakfast_history (employee_id, employee_name, date)
      VALUES (?, ?, ?)
    `);
    historyStmt.run(id, employee.name, now);
  } else if (type === 'orders') {
    const updateStmt = db.prepare(`
      UPDATE employees
      SET orders_last_turn_date = ?, orders_turn_count = orders_turn_count + 1
      WHERE id = ?
    `);
    updateStmt.run(now, id);

    const historyStmt = db.prepare(`
      INSERT INTO orders_history (employee_id, employee_name, date)
      VALUES (?, ?, ?)
    `);
    historyStmt.run(id, employee.name, now);
  }

  res.json({ success: true });
});

app.patch('/api/status', authenticateToken, (req, res) => {
  const { id } = req.query;
  const { isActive } = req.body;
  const stmt = db.prepare('UPDATE employees SET is_active = ? WHERE id = ?');
  stmt.run(isActive ? 1 : 0, id);
  res.json({ success: true });
});

app.get('/api/history', authenticateToken, (req, res) => {
  const { type } = req.query;
  const table = type === 'breakfast' ? 'breakfast_history' : 'orders_history';

  const stmt = db.prepare(`SELECT * FROM ${table} ORDER BY date DESC`);
  const history = stmt.all();
  res.json(history);
});

app.get('/api/export', authenticateToken, (req, res) => {
  const { type } = req.query;
  const table = type === 'breakfast' ? 'breakfast_history' : 'orders_history';

  const stmt = db.prepare(`SELECT * FROM ${table} ORDER BY date DESC`);
  const history = stmt.all();

  let csv = 'ID,Employee ID,Employee Name,Date\n';
  history.forEach(item => {
    const date = new Date(item.date).toISOString();
    csv += `${item.id},${item.employee_id},"${item.employee_name}",${date}\n`;
  });

  res.header('Content-Type', 'text/csv');
  res.header('Content-Disposition', `attachment; filename="${type}-history.csv"`);
  res.send(csv);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
