# Office Duty Tracker

A simple web application to track employee breakfast and orders collection duties with fair rotation based on turn counts.

## Features

- 🔐 Admin authentication with JWT
- 👥 Employee management (add, edit, delete, pause/activate)
- 🔄 Dual rotation system (Breakfast & Orders)
- ⚖️ Fair rotation based on turn counts
- 📅 Calendar and list views for history
- 📊 CSV export functionality
- 📱 Responsive design

## Quick Start - Local Development

### Prerequisites

- Node.js 18+ installed
- npm or yarn

### Setup

1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd <project-folder>
   ```

2. Install dependencies:
   ```bash
   npm install
   cd server && npm install && cd ..
   ```

3. Create environment files:
   ```bash
   cp .env.example .env
   cp server/.env.example server/.env
   ```

4. Start the backend server:
   ```bash
   cd server
   npm start
   ```

5. In a new terminal, start the frontend:
   ```bash
   npm run dev
   ```

6. Open your browser to http://localhost:5173

7. Login with default credentials:
   - **Username**: admin
   - **Password**: admin123

## Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone)

For detailed deployment instructions, see [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)

### Quick Deploy Steps

1. Push your code to GitHub
2. Import the repository in Vercel
3. Set environment variables:
   - `JWT_SECRET` - Your secure JWT secret
   - `ADMIN_USERNAME` - Admin username
   - `ADMIN_PASSWORD` - Admin password
4. Deploy!

## Project Structure

```
.
├── api/                    # Serverless API functions (for Vercel)
│   ├── _auth.js           # Authentication middleware
│   ├── _db.js             # Database operations
│   ├── _init.js           # Admin initialization
│   ├── auth/              # Auth endpoints
│   ├── employees/         # Employee endpoints
│   ├── history/           # History endpoints
│   └── export/            # CSV export endpoints
├── server/                 # Express backend (for local development)
│   ├── db.js              # Database module
│   ├── server.js          # Express server
│   └── .env               # Backend environment variables
├── src/                    # React frontend
│   ├── components/        # React components
│   ├── services/          # API service layer
│   ├── App.jsx            # Main app component
│   └── index.css          # Styles
├── vercel.json            # Vercel configuration
└── package.json           # Project dependencies
```

## Technology Stack

**Frontend:**
- React 18
- Vite
- Vanilla CSS

**Backend:**
- Express.js (local development)
- Vercel Serverless Functions (production)
- JWT for authentication
- bcryptjs for password hashing
- JSON file-based storage

## API Endpoints

### Authentication
- `POST /api/auth/login` - Admin login
- `POST /api/auth/verify` - Verify JWT token

### Employees
- `GET /api/employees` - Get all employees
- `POST /api/employees` - Create employee
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Delete employee
- `PATCH /api/employees/:id/status` - Update employee status
- `POST /api/employees/:id/complete/:type` - Mark duty complete

### History
- `GET /api/history/:type` - Get history (breakfast or orders)
- `GET /api/export/csv/:type` - Export history as CSV

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `JWT_SECRET` | Secret key for JWT tokens | Yes |
| `ADMIN_USERNAME` | Admin username | Yes |
| `ADMIN_PASSWORD` | Admin password | Yes |
| `VITE_API_URL` | API URL override (optional) | No |

## Security Notes

- Never commit `.env` files
- Change default admin credentials immediately
- Use strong, random `JWT_SECRET` in production
- All API endpoints except login are protected with JWT authentication

## Important: Production Database

⚠️ **The current implementation uses JSON file storage which is ephemeral on Vercel.** For production use, migrate to a persistent database solution like:

- Vercel Postgres
- Vercel KV
- MongoDB Atlas
- Supabase
- PlanetScale

See [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) for more details.

## License

MIT

## Support

For deployment issues, see [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)
