import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

// Use /tmp directory for Vercel serverless
const DB_DIR = process.env.VERCEL ? tmpdir() : join(process.cwd(), 'server');
const DB_FILE = join(DB_DIR, 'database.json');

// Initialize empty database structure
const emptyDB = {
  employees: [],
  breakfast_history: [],
  orders_history: [],
  admin_users: [],
  _counters: {
    employees: 0,
    breakfast_history: 0,
    orders_history: 0,
    admin_users: 0
  }
};

// Ensure directory exists
if (!existsSync(DB_DIR)) {
  mkdirSync(DB_DIR, { recursive: true });
}

// Load or create database
export const loadDatabase = () => {
  if (!existsSync(DB_FILE)) {
    writeFileSync(DB_FILE, JSON.stringify(emptyDB, null, 2));
    return emptyDB;
  }
  const data = readFileSync(DB_FILE, 'utf8');
  return JSON.parse(data);
};

// Save database
export const saveDatabase = (data) => {
  writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
};

// Database operations
export const db = {
  getData: () => loadDatabase(),

  saveData: (data) => saveDatabase(data),

  findAdminByUsername: (username) => {
    const data = loadDatabase();
    return data.admin_users.find(u => u.username === username);
  },

  createAdmin: (username, password_hash) => {
    const data = loadDatabase();
    data._counters.admin_users++;
    const newUser = {
      id: data._counters.admin_users,
      username,
      password_hash,
      created_at: Date.now()
    };
    data.admin_users.push(newUser);
    saveDatabase(data);
    return newUser;
  },

  getAllEmployees: () => {
    const data = loadDatabase();
    return [...data.employees];
  },

  getEmployeeById: (id) => {
    const data = loadDatabase();
    return data.employees.find(e => e.id === parseInt(id));
  },

  createEmployee: (name) => {
    const data = loadDatabase();
    data._counters.employees++;
    const newEmployee = {
      id: data._counters.employees,
      name,
      breakfast_last_turn_date: null,
      breakfast_turn_count: 0,
      orders_last_turn_date: null,
      orders_turn_count: 0,
      is_active: 1,
      created_at: Date.now()
    };
    data.employees.push(newEmployee);
    saveDatabase(data);
    return newEmployee;
  },

  updateEmployee: (id, name) => {
    const data = loadDatabase();
    const emp = data.employees.find(e => e.id === parseInt(id));
    if (emp) {
      emp.name = name;
      saveDatabase(data);
      return true;
    }
    return false;
  },

  deleteEmployee: (id) => {
    const data = loadDatabase();
    const numId = parseInt(id);
    data.employees = data.employees.filter(e => e.id !== numId);
    data.breakfast_history = data.breakfast_history.filter(h => h.employee_id !== numId);
    data.orders_history = data.orders_history.filter(h => h.employee_id !== numId);
    saveDatabase(data);
    return true;
  },

  updateEmployeeStatus: (id, isActive) => {
    const data = loadDatabase();
    const emp = data.employees.find(e => e.id === parseInt(id));
    if (emp) {
      emp.is_active = isActive ? 1 : 0;
      saveDatabase(data);
      return true;
    }
    return false;
  },

  markEmployeeComplete: (id, type) => {
    const data = loadDatabase();
    const emp = data.employees.find(e => e.id === parseInt(id));
    if (!emp) return null;

    const now = Date.now();

    if (type === 'breakfast') {
      emp.breakfast_last_turn_date = now;
      emp.breakfast_turn_count++;

      data._counters.breakfast_history++;
      data.breakfast_history.push({
        id: data._counters.breakfast_history,
        employee_id: parseInt(id),
        employee_name: emp.name,
        date: now
      });
    } else if (type === 'orders') {
      emp.orders_last_turn_date = now;
      emp.orders_turn_count++;

      data._counters.orders_history++;
      data.orders_history.push({
        id: data._counters.orders_history,
        employee_id: parseInt(id),
        employee_name: emp.name,
        date: now
      });
    }

    saveDatabase(data);
    return emp;
  },

  getHistory: (type) => {
    const data = loadDatabase();
    const history = type === 'breakfast' ? data.breakfast_history : data.orders_history;
    return [...history].sort((a, b) => b.date - a.date);
  }
};
