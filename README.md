# Client Management System

A comprehensive full-stack client management system built with React, Tailwind CSS, and Prisma with Neon PostgreSQL database.

## Features

### 🎯 Core Features
- **Multi-Role Authentication**: Super Admin, Admin, and Client roles
- **Client Management**: Add, view, edit, and delete clients with 2-step verification
- **Dynamic Theming**: UI adapts to client's primary and secondary brand colors
- **Module Management**: Blog, News, Videos, and Images modules with custom colors
- **Advanced Search & Filtering**: Search by company name, URL, phone number
- **Pagination**: Configurable page sizes (10/20/50/100 per page)
- **Responsive Design**: Fully responsive across all devices

### 👥 User Roles

#### Super Admin
- Full access to all features
- Unique blue/purple gradient UI theme
- Can manage all clients and admins
- Access to all analytics and reports

#### Admin
- Similar features to Super Admin
- Slate gray UI theme
- Can manage clients
- Limited administrative access

#### Client
- Access to their own portal
- View their content modules
- Manage their company data

## Tech Stack

- **Frontend**: React 18, React Router DOM
- **Styling**: Tailwind CSS
- **Database**: Neon PostgreSQL with Prisma ORM
- **Build Tool**: Vite
- **Date Handling**: date-fns
- **Authentication**: bcryptjs for password hashing

## Project Structure

```
client-management-system/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── components/
│   │   ├── Footer.jsx         # Footer with Brandwar branding
│   │   ├── Header.jsx         # Top navigation bar
│   │   ├── Layout.jsx         # Main layout wrapper
│   │   ├── ProtectedRoute.jsx # Route protection
│   │   └── Sidebar.jsx        # Navigation sidebar
│   ├── contexts/
│   │   └── AuthContext.jsx    # Authentication context
│   ├── pages/
│   │   ├── AddClient.jsx      # Add new client form
│   │   ├── ClientView.jsx     # Detailed client view
│   │   ├── Clients.jsx        # Clients list with filters
│   │   ├── Dashboard.jsx      # Main dashboard
│   │   ├── Login.jsx          # Login page
│   │   ├── PreviousClients.jsx# Archive of past clients
│   │   └── Requests.jsx       # Client requests
│   ├── utils/
│   │   └── mockData.js        # Mock data for development
│   ├── App.jsx                # Main app component
│   ├── index.css              # Global styles
│   └── main.jsx               # App entry point
├── index.html
├── package.json
├── tailwind.config.js
├── vite.config.js
└── README.md
```

## Getting Started

### Prerequisites
- Node.js 16+ and npm/yarn
- Neon PostgreSQL account (https://neon.tech)

### Installation

1. **Clone or download the project**

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up the database**

   a. Create a Neon database:
   - Go to https://console.neon.tech
   - Create a new project
   - Copy the connection string

   b. Create `.env` file in the root directory:
   ```env
   DATABASE_URL="postgresql://user:password@host/database?sslmode=require"
   ```

   c. Generate Prisma client and push schema:
   ```bash
   npm run prisma:generate
   npm run prisma:push
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

   The app will open at http://localhost:3000

## Demo Credentials

### Super Admin
- **Email**: superadmin@brandwar.com
- **Password**: admin123

### Admin
- **Email**: admin@brandwar.com
- **Password**: admin123

## Key Features Explained

### 1. Add Client
Complete form with validation:
- Company name and website URL (format: https://www.example.com or .in)
- Logo upload
- Primary and secondary brand colors
- Contact information (name, phone, email, password, address)
- Service period (start and end dates)
- Module selection with custom colors:
  - Blogs (customizable color)
  - News (customizable color)
  - Videos (customizable color)
  - Images (customizable color)

### 2. Clients Management
- Search functionality (company name, URL, phone)
- Status filter (Active/Inactive/Hold)
- Pagination (10/20/50/100 per page)
- Module indicators with hover tooltips
- Actions: View, Edit, Delete

### 3. Delete Confirmation
Two-step verification:
1. Confirmation dialog (Yes/No)
2. Company name verification (type to confirm)

### 4. Client View
- Company details card with brand colors
- Contact information display
- Active modules showcase
- Content management sections for each module

### 5. Dynamic Theming
- Super Admin: Blue/Purple gradient theme
- Admin: Slate gray theme
- Client views: Adapts to client's primary/secondary colors

## Database Schema

### User Model
- id, email, password, name, role
- Linked to Client if role is CLIENT

### Client Model
- Company information (name, URL, logo, colors)
- Contact details
- Service period
- Module configurations
- Status (Active/Inactive/Hold)
- Relations to Blog, News, Video, Image

### Content Models
- Blog: title, content, author, publishedAt
- News: title, content, publishedAt
- Video: title, url, thumbnail, description
- Image: title, url, description

## Customization

### Colors
Edit `tailwind.config.js` to customize the color palette:
```javascript
colors: {
  brandwar: {
    primary: '#0F172A',
    secondary: '#1E293B',
    accent: '#3B82F6',
    gold: '#F59E0B',
  }
}
```

### Fonts
The app uses:
- **Display**: Outfit (headings)
- **Body**: Inter (content)

Change in `index.html` and `tailwind.config.js`

## Production Deployment

### Build for production
```bash
npm run build
```

### Preview production build
```bash
npm run preview
```

### Deploy to hosting
1. Build the project
2. Upload `dist` folder to your hosting
3. Set environment variables
4. Configure your hosting for SPA routing

## Environment Variables

```env
# Required
DATABASE_URL="postgresql://..."

# Optional (for production)
NODE_ENV="production"
VITE_API_URL="https://your-api.com"
```

## Browser Support
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Future Enhancements
- [ ] Real-time notifications
- [ ] Advanced analytics dashboard
- [ ] Export data to Excel/PDF
- [ ] Email integration
- [ ] File upload functionality
- [ ] Calendar integration
- [ ] Multi-language support
- [ ] Dark mode toggle

## Troubleshooting

### Database Connection Issues
- Verify DATABASE_URL in .env
- Ensure Neon database is running
- Check firewall/network settings

### Build Errors
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Clear Vite cache: `rm -rf .vite`

### Styling Issues
- Rebuild Tailwind: restart dev server
- Clear browser cache

## Credits

**Developed and Designed by Brandwar**

## License

This project is proprietary software developed for client management purposes.

## Support

For support, email: support@brandwar.com
