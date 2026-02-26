import React from 'react';
import { useAuth } from './contexts/AuthContext';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import ClientView from './pages/ClientView';
import AddClient from './pages/AddClient';
import Requests from './pages/Requests';
import PreviousClients from './pages/PreviousClients';
import Profile from './pages/Profile';
import BlogDetailPage from './pages/BlogDetailPage';
import NewsDetailPage from './pages/NewsDetailPage';
import GalleryFolderPage from './pages/GalleryFolderPage';

// Theme Controller Component
const ThemeController = ({ children }) => {
  const { user } = useAuth(); // Access user from context

  React.useEffect(() => {
    const root = document.documentElement;
    if (user) {
      if (user.role === 'SUPERADMIN') {
        // Red and Black for Superadmin
        root.style.setProperty('--primary-color', '#EF4444'); // Red-500
        root.style.setProperty('--secondary-color', '#000000'); // Black
      } else {
        // User's custom colors
        root.style.setProperty('--primary-color', user.primaryColor || '#3B82F6');
        root.style.setProperty('--secondary-color', user.secondaryColor || '#1E293B');
      }
    } else {
      // Default fallback
      root.style.setProperty('--primary-color', '#3B82F6');
      root.style.setProperty('--secondary-color', '#1E293B');
    }
  }, [user]);

  return children;
};

function App() {
  return (
    <AuthProvider>
      <ThemeController>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route
              path="/"
              element={
                <ProtectedRoute requiredRole={['SUPERADMIN', 'ADMIN']}>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="clients" element={<Clients />} />
              <Route path="add-client" element={<AddClient />} />
              <Route path="clients/:id/edit" element={<AddClient />} />
              <Route path="requests" element={<Requests />} />
              <Route path="previous-clients" element={<PreviousClients />} />
              <Route path="profile" element={<Profile />} />

              {/* Company Slug Routing - Root-level within Layout */}
              <Route path=":companySlug" element={<ClientView />} />
              <Route path=":companySlug/blogs" element={<ClientView forceModule="blogs" />} />
              <Route path=":companySlug/blogs/:slug" element={<BlogDetailPage />} />

              <Route path=":companySlug/news" element={<ClientView forceModule="news" />} />
              <Route path=":companySlug/news/:slug" element={<NewsDetailPage />} />

              <Route path=":companySlug/gallery/:type" element={<ClientView forceModule="gallery" />} />
              <Route path=":companySlug/gallery/:type/:folderId/:folderTitle" element={<GalleryFolderPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </ThemeController>
    </AuthProvider>
  );
}

export default App;
