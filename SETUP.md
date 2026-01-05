# 🏢 Office Duty Tracker - Setup Guide

Complete setup guide for the Office Duty Tracker application with SQLite database and admin authentication.

## 📋 Prerequisites

- Node.js 16+ installed
- npm or yarn package manager

## 🚀 Installation

### 1. Install Dependencies

#### Frontend
```bash
npm install
```

#### Backend
```bash
cd server
npm install
cd ..
```

### 2. Environment Configuration

The backend uses environment variables for configuration. A `.env` file has been created in the `server/` directory with default values:

```env
JWT_SECRET=breakfast-duty-secret-key-2024
PORT=3001
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
```

**IMPORTANT**: Change these values in production!

### 3. Start the Application

You need to run both the backend server and the frontend development server.

#### Terminal 1 - Backend Server
```bash
cd server
npm start
```

The backend will start on `http://localhost:3001`

#### Terminal 2 - Frontend Development Server
```bash
npm run dev
```

The frontend will start on `http://localhost:5173`

## 🔐 Admin Login

Default credentials:
- **Username**: `admin`
- **Password**: `admin123`

**Security Note**: Change the default password in production by updating the `.env` file!

## 📊 Features

### Authentication
- JWT-based admin authentication
- Token expires in 24 hours
- Secure password hashing with bcryptjs

### Database
- **SQLite** database (`breakfast-duty.db`) created automatically
- Persistent storage in the `server/` directory
- All data survives server restarts

### Data Management
- Add, edit, delete employees
- Track breakfast and orders rotations separately
- Pause/activate employees
- View complete history
- **Export history to CSV**

### CSV Export
- Export breakfast history to CSV
- Export orders history to CSV
- Direct download from the browser
- Includes: ID, Employee ID, Employee Name, Date

## 📁 Project Structure

```
/
├── src/                    # Frontend React app
│   ├── components/         # React components
│   ├── services/          # API service layer
│   └── db/                # Old localStorage code (deprecated)
├── server/                # Backend Node.js server
│   ├── server.js          # Express server
│   ├── db.js              # SQLite database setup
│   ├── package.json       # Backend dependencies
│   ├── .env               # Environment variables
│   └── breakfast-duty.db  # SQLite database (auto-created)
└── package.json           # Frontend dependencies
```

## 🔄 API Endpoints

### Authentication
- `POST /api/auth/login` - Admin login
- `POST /api/auth/verify` - Verify token

### Employees
- `GET /api/employees` - Get all employees
- `POST /api/employees` - Create employee
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Delete employee
- `PATCH /api/employees/:id/status` - Update employee status
- `POST /api/employees/:id/complete/:type` - Mark duty complete

### History
- `GET /api/history/:type` - Get history (breakfast/orders)
- `GET /api/export/csv/:type` - Export history to CSV

## 🔧 Development

### Backend Development
```bash
cd server
npm run dev  # Uses nodemon for auto-reload
```

### Frontend Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
```

## 📦 Database Schema

### Employees Table
```sql
- id (PRIMARY KEY)
- name
- breakfast_last_turn_date
- breakfast_turn_count
- orders_last_turn_date
- orders_turn_count
- is_active
- created_at
```

### History Tables (breakfast_history, orders_history)
```sql
- id (PRIMARY KEY)
- employee_id (FOREIGN KEY)
- employee_name
- date
```

### Admin Users Table
```sql
- id (PRIMARY KEY)
- username (UNIQUE)
- password_hash
- created_at
```

## 🔐 Security Features

1. **JWT Authentication**: Secure token-based auth
2. **Password Hashing**: bcrypt with salt rounds
3. **Protected Routes**: All API routes require valid JWT
4. **CORS Enabled**: Cross-origin requests allowed
5. **SQL Injection Protection**: Prepared statements

## 🐛 Troubleshooting

### Backend won't start
- Check if port 3001 is already in use
- Verify Node.js version (16+)
- Check server logs for errors

### Frontend can't connect to backend
- Ensure backend is running on port 3001
- Check CORS settings
- Verify API_URL in `src/services/api.js`

### Login fails
- Verify credentials match `.env` file
- Check backend logs
- Clear browser localStorage

### Database errors
- Delete `breakfast-duty.db` to reset
- Check file permissions in server directory

## 📝 Notes

- Database file is gitignored by default
- CSV exports download directly to your browser
- All timestamps are in milliseconds (Unix epoch)
- Frontend uses token stored in localStorage
- Token auto-expires after 24 hours

## 🔄 Migration from localStorage

The app previously used browser localStorage. The new SQLite backend is completely separate. Old data will not be automatically migrated.

To migrate:
1. Export data from browser console
2. Manually re-enter in new system
3. Or write a migration script

## 📧 Support

For issues or questions, check:
1. Console logs (Frontend: Browser DevTools, Backend: Terminal)
2. Network tab in browser DevTools
3. SQLite database file directly

Happy tracking! 🍳📦
