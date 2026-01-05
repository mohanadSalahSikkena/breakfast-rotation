import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DB_FILE = join(__dirname, 'database.json');

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

// Load or create database
const loadDatabase = () => {
  if (!existsSync(DB_FILE)) {
    writeFileSync(DB_FILE, JSON.stringify(emptyDB, null, 2));
    return emptyDB;
  }
  const data = readFileSync(DB_FILE, 'utf8');
  return JSON.parse(data);
};

// Save database
const saveDatabase = (data) => {
  writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
};

// Database object that mimics SQLite interface
const db = {
  data: loadDatabase(),

  prepare: (sql) => {
    const normalizedSQL = sql.trim().toLowerCase();

    return {
      get: (...params) => {
        // SELECT single row
        if (normalizedSQL.includes('select * from admin_users where username')) {
          const username = params[0];
          return db.data.admin_users.find(u => u.username === username);
        }
        if (normalizedSQL.includes('select name from employees where id')) {
          const id = parseInt(params[0]);
          const emp = db.data.employees.find(e => e.id === id);
          return emp ? { name: emp.name } : null;
        }
        return null;
      },

      all: (...params) => {
        // SELECT all rows
        if (normalizedSQL.includes('select * from employees')) {
          return [...db.data.employees];
        }
        if (normalizedSQL.includes('from breakfast_history')) {
          return [...db.data.breakfast_history];
        }
        if (normalizedSQL.includes('from orders_history')) {
          return [...db.data.orders_history];
        }
        return [];
      },

      run: (...params) => {
        // INSERT admin user
        if (normalizedSQL.includes('insert into admin_users')) {
          const [username, password_hash] = params;
          db.data._counters.admin_users++;
          const newUser = {
            id: db.data._counters.admin_users,
            username,
            password_hash,
            created_at: Date.now()
          };
          db.data.admin_users.push(newUser);
          saveDatabase(db.data);
          return { lastInsertRowid: newUser.id };
        }

        // INSERT employee
        if (normalizedSQL.includes('insert into employees')) {
          const name = params[0];
          db.data._counters.employees++;
          const newEmployee = {
            id: db.data._counters.employees,
            name,
            breakfast_last_turn_date: null,
            breakfast_turn_count: 0,
            orders_last_turn_date: null,
            orders_turn_count: 0,
            is_active: 1,
            created_at: Date.now()
          };
          db.data.employees.push(newEmployee);
          saveDatabase(db.data);
          return { lastInsertRowid: newEmployee.id };
        }

        // UPDATE employee name
        if (normalizedSQL.includes('update employees set name')) {
          const [name, id] = params;
          const emp = db.data.employees.find(e => e.id === parseInt(id));
          if (emp) {
            emp.name = name;
            saveDatabase(db.data);
          }
          return {};
        }

        // DELETE employee
        if (normalizedSQL.includes('delete from employees')) {
          const id = parseInt(params[0]);
          db.data.employees = db.data.employees.filter(e => e.id !== id);
          // Also delete related history
          db.data.breakfast_history = db.data.breakfast_history.filter(h => h.employee_id !== id);
          db.data.orders_history = db.data.orders_history.filter(h => h.employee_id !== id);
          saveDatabase(db.data);
          return {};
        }

        // UPDATE employee status
        if (normalizedSQL.includes('update employees set is_active')) {
          const [isActive, id] = params;
          const emp = db.data.employees.find(e => e.id === parseInt(id));
          if (emp) {
            emp.is_active = isActive;
            saveDatabase(db.data);
          }
          return {};
        }

        // UPDATE breakfast turn
        if (normalizedSQL.includes('set breakfast_last_turn_date')) {
          const [now, id] = params;
          const emp = db.data.employees.find(e => e.id === parseInt(id));
          if (emp) {
            emp.breakfast_last_turn_date = now;
            emp.breakfast_turn_count++;
            saveDatabase(db.data);
          }
          return {};
        }

        // UPDATE orders turn
        if (normalizedSQL.includes('set orders_last_turn_date')) {
          const [now, id] = params;
          const emp = db.data.employees.find(e => e.id === parseInt(id));
          if (emp) {
            emp.orders_last_turn_date = now;
            emp.orders_turn_count++;
            saveDatabase(db.data);
          }
          return {};
        }

        // INSERT breakfast history
        if (normalizedSQL.includes('insert into breakfast_history')) {
          const [employee_id, employee_name, date] = params;
          db.data._counters.breakfast_history++;
          db.data.breakfast_history.push({
            id: db.data._counters.breakfast_history,
            employee_id: parseInt(employee_id),
            employee_name,
            date
          });
          saveDatabase(db.data);
          return {};
        }

        // INSERT orders history
        if (normalizedSQL.includes('insert into orders_history')) {
          const [employee_id, employee_name, date] = params;
          db.data._counters.orders_history++;
          db.data.orders_history.push({
            id: db.data._counters.orders_history,
            employee_id: parseInt(employee_id),
            employee_name,
            date
          });
          saveDatabase(db.data);
          return {};
        }

        return {};
      }
    };
  }
};

console.log('Database initialized with JSON file storage');

export default db;
