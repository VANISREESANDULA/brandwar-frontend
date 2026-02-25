# Quick Start Guide - Client Management System

## 🚀 Get Running in 5 Minutes

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Database

Create `.env` file in root:
```env
DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"
```

Get your database URL from: https://console.neon.tech

### 3. Initialize Database
```bash
npm run prisma:generate
npm run prisma:push
```

### 4. Start Application
```bash
npm run dev
```

Open http://localhost:3000

### 5. Login

**Demo Credentials:**
- Email: `superadmin@brandwar.com`
- Password: `admin123`

---

## 📁 Project Structure

```
client-management-system/
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/         # Page components
│   ├── contexts/      # React contexts (Auth)
│   ├── utils/         # Helper functions & mock data
│   └── App.jsx        # Main app with routing
├── prisma/
│   └── schema.prisma  # Database schema
├── README.md          # Full documentation
├── SETUP_GUIDE.md     # Detailed setup instructions
└── package.json
```

---

## ✨ Key Features

- ✅ Multi-role authentication (Super Admin, Admin, Client)
- ✅ Complete client management (CRUD operations)
- ✅ Dynamic brand theming based on client colors
- ✅ Module management (Blog, News, Videos, Images)
- ✅ Advanced search and filtering
- ✅ Pagination (10/20/50/100 per page)
- ✅ 2-step delete verification
- ✅ Responsive design
- ✅ Beautiful, modern UI with animations

---

## 🎨 Design Features

### Super Admin Theme
- Blue/Purple gradient UI
- Full access to all features
- Enhanced visual hierarchy

### Admin Theme
- Slate gray professional UI
- Standard administrative features

### Dynamic Client Theming
- UI adapts to each client's brand colors
- Primary and secondary color support
- Module-specific color coding

---

## 🛠️ Tech Stack

- **Frontend:** React 18 + React Router
- **Styling:** Tailwind CSS with custom design system
- **Database:** Neon PostgreSQL + Prisma ORM
- **Build:** Vite (fast HMR)
- **Fonts:** Outfit (display) + Inter (body)

---

## 📝 Common Tasks

### Add New Client
1. Navigate to "Add Client"
2. Fill in company details
3. Set brand colors
4. Select modules and their colors
5. Save

### View Client
1. Go to "Clients" page
2. Click eye icon on any client
3. View details and modules
4. Click module cards to see content

### Delete Client
1. Click trash icon
2. Confirm deletion (Step 1)
3. Type company name to verify (Step 2)
4. Client deleted with all data

---

## 🚨 Troubleshooting

**Can't connect to database?**
- Check `.env` file exists
- Verify DATABASE_URL is correct
- Run `npm run prisma:generate`

**Styles not loading?**
- Restart dev server
- Clear browser cache

**Port already in use?**
- Run: `npx kill-port 3000`
- Or use different port: `npm run dev -- --port 3001`

---

## 📚 Next Steps

1. Read full `README.md` for complete documentation
2. Check `SETUP_GUIDE.md` for detailed setup
3. Explore the code and customize
4. Add your own features!

---

## 🎯 Production Ready

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

### Deploy
- Vercel (recommended)
- Netlify
- Your preferred hosting

---

**Need Help?** Check SETUP_GUIDE.md or contact: support@brandwar.com

**Developed and Designed by Brandwar** 🚀
