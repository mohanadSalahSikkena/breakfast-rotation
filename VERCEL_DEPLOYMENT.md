# Vercel Deployment Guide

This guide will help you deploy the Office Duty Tracker application to Vercel.

## Prerequisites

- A GitHub account
- A Vercel account (sign up at https://vercel.com)
- Git installed on your local machine

## Step 1: Push Your Code to GitHub

1. Initialize a git repository (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. Create a new repository on GitHub

3. Push your code:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git branch -M main
   git push -u origin main
   ```

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard

1. Go to https://vercel.com and sign in
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset**: Vite
   - **Root Directory**: ./
   - **Build Command**: `npm run build` (should be auto-detected)
   - **Output Directory**: `dist` (should be auto-detected)

5. Add Environment Variables (click "Environment Variables"):
   ```
   JWT_SECRET=your-secure-random-string-here
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=your-secure-password-here
   ```

6. Click "Deploy"

### Option B: Deploy via Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy:
   ```bash
   vercel
   ```

4. Follow the prompts and set environment variables when asked

## Step 3: Configure Environment Variables

After deployment, you need to set the following environment variables in your Vercel project settings:

| Variable | Description | Example |
|----------|-------------|---------|
| `JWT_SECRET` | Secret key for JWT tokens | `your-random-secret-key-here` |
| `ADMIN_USERNAME` | Admin username | `admin` |
| `ADMIN_PASSWORD` | Admin password | `your-secure-password` |

**Important Security Notes:**
- Never commit `.env` files to git
- Use strong, unique values for `JWT_SECRET` in production
- Change the default admin password immediately
- You can generate a secure JWT secret using: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

## Step 4: Access Your Application

Once deployed, Vercel will provide you with a URL like:
```
https://your-project-name.vercel.app
```

You can now access your application and log in with the credentials you set in the environment variables.

## Important Notes

### Database Storage

The current implementation uses JSON file storage with the following behavior:
- **Development**: Data is stored in `server/database.json`
- **Production (Vercel)**: Data is stored in `/tmp/database.json` (ephemeral storage)

**⚠️ Warning**: On Vercel's serverless platform, the `/tmp` directory is ephemeral and will be cleared periodically. This means:
- Data will persist across multiple requests during the same serverless function execution
- Data may be lost when the function is cold-started or redeployed
- For production use, you should migrate to a persistent database solution

### Recommended Database Upgrades for Production

For a production deployment, consider using one of these persistent storage solutions:

1. **Vercel Postgres** (Recommended for Vercel)
   - Native Vercel integration
   - Fully managed PostgreSQL database
   - https://vercel.com/docs/storage/vercel-postgres

2. **Vercel KV** (Redis-based)
   - Key-value storage
   - Good for simple data structures
   - https://vercel.com/docs/storage/vercel-kv

3. **External Database Services**
   - MongoDB Atlas
   - PlanetScale
   - Supabase
   - Firebase

## Updating Your Deployment

To update your deployment after making changes:

1. Commit and push your changes to GitHub:
   ```bash
   git add .
   git commit -m "Your commit message"
   git push
   ```

2. Vercel will automatically redeploy your application

Or use the CLI:
```bash
vercel --prod
```

## Troubleshooting

### API Routes Not Working

- Ensure all API files are in the `/api` directory
- Check that environment variables are set correctly in Vercel dashboard
- Review the function logs in Vercel dashboard under "Deployments" > "Functions"

### CORS Errors

- CORS headers are already configured in the API routes
- If issues persist, check browser console for specific error messages

### Authentication Issues

- Verify `JWT_SECRET` environment variable is set
- Ensure admin user credentials match the environment variables
- Check that tokens are being stored correctly in localStorage

### Data Loss

- If data is being lost frequently, this is expected behavior with `/tmp` storage
- Implement a persistent database solution as described above

## Support

For issues specific to Vercel deployment, refer to:
- Vercel Documentation: https://vercel.com/docs
- Vercel Community: https://github.com/vercel/vercel/discussions
