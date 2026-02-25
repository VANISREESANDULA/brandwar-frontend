# Complete Setup Guide - Client Management System

This guide will walk you through setting up the Client Management System from scratch.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Project Setup](#project-setup)
3. [Database Configuration](#database-configuration)
4. [Running the Application](#running-the-application)
5. [Creating Your First Admin User](#creating-your-first-admin-user)
6. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software

1. **Node.js** (version 16 or higher)
   - Download from: https://nodejs.org/
   - Verify installation:
     ```bash
     node --version
     npm --version
     ```

2. **Code Editor**
   - Recommended: VS Code (https://code.visualstudio.com/)

3. **Git** (optional, for version control)
   - Download from: https://git-scm.com/

### Required Accounts

1. **Neon Database Account**
   - Sign up at: https://neon.tech
   - Free tier available

---

## Project Setup

### Step 1: Extract/Clone the Project

Navigate to the project directory:
```bash
cd client-management-system
```

### Step 2: Install Dependencies

Run the following command to install all required packages:
```bash
npm install
```

This will install:
- React and React Router
- Tailwind CSS
- Prisma and Prisma Client
- Date-fns
- Vite (build tool)
- And other dependencies

**Wait for installation to complete** (may take 2-5 minutes)

---

## Database Configuration

### Step 1: Create Neon Database

1. Go to https://console.neon.tech
2. Click "Create Project"
3. Choose a name (e.g., "client-management-db")
4. Select a region close to you
5. Click "Create Project"

### Step 2: Get Database Connection String

1. In your Neon dashboard, click on your project
2. Go to "Connection Details"
3. Copy the connection string (it looks like):
   ```
   postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech/dbname?sslmode=require
   ```

### Step 3: Configure Environment Variables

1. In the project root, create a file named `.env`
2. Add your database URL:
   ```env
   DATABASE_URL="postgresql://your-connection-string-here"
   ```
3. Save the file

**Example .env file:**
```env
DATABASE_URL="postgresql://john:abc123@ep-cool-darkness-12345.us-east-2.aws.neon.tech/neondb?sslmode=require"
```

### Step 4: Initialize Database

Run these commands to set up your database:

```bash
# Generate Prisma Client
npm run prisma:generate

# Create database tables
npm run prisma:push
```

You should see output like:
```
✔ Generated Prisma Client
Your database is now in sync with your Prisma schema.
```

---

## Running the Application

### Start Development Server

```bash
npm run dev
```

You should see:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

### Access the Application

1. Open your browser
2. Go to: http://localhost:3000
3. You'll see the login page

---

## Creating Your First Admin User

Since this is a fresh installation, you need to create an admin user manually.

### Option 1: Use Prisma Studio (Recommended for First Setup)

1. Open a new terminal window
2. Run:
   ```bash
   npx prisma studio
   ```
3. A browser window will open with Prisma Studio
4. Click on "User" table
5. Click "Add record"
6. Fill in:
   - **email**: superadmin@brandwar.com
   - **password**: admin123 (will need to be hashed in production)
   - **name**: Super Admin
   - **role**: SUPERADMIN
7. Click "Save"

### Option 2: Direct SQL (Alternative)

1. Go to your Neon console
2. Open SQL Editor
3. Run this query:
   ```sql
   INSERT INTO "User" (id, email, password, name, role, "createdAt", "updatedAt")
   VALUES (
     'admin1',
     'superadmin@brandwar.com',
     'admin123',
     'Super Admin',
     'SUPERADMIN',
     NOW(),
     NOW()
   );
   ```

### Login with Demo Credentials

Now you can log in with:
- **Email**: superadmin@brandwar.com
- **Password**: admin123

---

## Application Features Overview

### After Login

You'll see the dashboard with:
- **Dashboard**: Overview statistics
- **Clients**: Manage all clients
- **Requests**: View client requests
- **Previous Clients**: Archive
- **Add Client**: Create new clients

### Adding a New Client

1. Click "Add Client" in sidebar
2. Fill in the form:
   - **Company Information**
     - Company Name (required)
     - Website URL (format: https://www.example.com)
     - Primary & Secondary Colors
   
   - **Contact Information**
     - Contact Name, Phone, Email (required)
     - Password for client portal
     - Address (optional)
   
   - **Service Period**
     - Start Date and End Date
   
   - **Modules**
     - Check boxes for: Blog, News, Videos, Images
     - Set custom colors for each module

3. Click "Create Client"

### Managing Clients

In the Clients page:
- **Search**: Type company name, URL, or phone
- **Filter**: By status (Active/Inactive/Hold)
- **View**: Click eye icon to see details
- **Edit**: Click pencil icon to modify
- **Delete**: Click trash icon (2-step verification)

---

## Troubleshooting

### Issue: "Cannot find module" errors

**Solution:**
```bash
rm -rf node_modules
npm install
```

### Issue: Database connection fails

**Solution:**
1. Check `.env` file exists in root directory
2. Verify DATABASE_URL is correct
3. Test connection in Neon console
4. Run: `npm run prisma:generate`

### Issue: Port 3000 already in use

**Solution:**
```bash
# Kill process on port 3000
npx kill-port 3000

# Or use different port
npm run dev -- --port 3001
```

### Issue: Tailwind styles not loading

**Solution:**
```bash
# Restart dev server
npm run dev
```

### Issue: Login not working

**Solution:**
1. Check if user exists in database
2. Verify credentials match exactly
3. Check browser console for errors
4. Clear browser cache and cookies

---

## Production Deployment

### Step 1: Build for Production

```bash
npm run build
```

This creates a `dist` folder with optimized files.

### Step 2: Test Production Build Locally

```bash
npm run preview
```

### Step 3: Deploy to Hosting

**Recommended platforms:**
- Vercel (easiest for Vite/React)
- Netlify
- AWS S3 + CloudFront
- DigitalOcean App Platform

**For Vercel:**
1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`
3. Follow prompts
4. Add environment variables in Vercel dashboard

---

## Next Steps

1. ✅ Change default passwords
2. ✅ Add your company logo
3. ✅ Customize colors in `tailwind.config.js`
4. ✅ Add real client data
5. ✅ Set up email notifications (future enhancement)
6. ✅ Configure backups for Neon database

---

## Additional Resources

- **Prisma Docs**: https://www.prisma.io/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
- **React Router**: https://reactrouter.com/
- **Neon Docs**: https://neon.tech/docs

---

## Getting Help

If you encounter issues:

1. Check this guide's Troubleshooting section
2. Review the README.md
3. Check browser console for errors
4. Check terminal for error messages
5. Contact: support@brandwar.com

---

**Developed and Designed by Brandwar**
