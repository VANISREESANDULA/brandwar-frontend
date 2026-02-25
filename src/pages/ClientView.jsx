import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import { format } from 'date-fns';
import Toast from '../components/Toast';
import CreateBlogModal from '../components/CreateBlogModal';
import CreateNewsModal from '../components/CreateNewsModal';
import CreateVideoModal from '../components/CreateVideoModal';
import CreateImageModal from '../components/CreateImageModal';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import BlogListing from '../components/content/BlogListing';
import NewsListing from '../components/content/NewsListing';
import VideoListing from '../components/content/VideoListing';
import ImageListing from '../components/content/ImageListing';

const ClientView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isSuperAdmin } = useAuth();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeModule, setActiveModule] = useState(null);
  const [moduleData, setModuleData] = useState([]);
  const [moduleLoading, setModuleLoading] = useState(false);
  const [toast, setToast] = useState({ message: '', type: '' });
  const [isSticky, setIsSticky] = useState(false);

  // Modal States
  const [editingItem, setEditingItem] = useState(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  useEffect(() => {
    const fetchClient = async () => {
      try {
        // Since /admins/:id does not exist on backend, fetch all and find the client locally
        const response = await api.get('/admins');
        const clientData = response.data.find(c => c.id === id);

        if (clientData) {
          // Map snake_case to camelCase
          const mappedData = {
            ...clientData,
            companyName: clientData.company_name,
            websiteUrl: clientData.website,
            contactName: clientData.name,
            phoneNumber: clientData.contact_number,
            primaryColor: clientData.primary_color,
            secondaryColor: clientData.secondary_color,
            logo: clientData.logo || null,
            status: clientData.isActive ? 'ACTIVE' : 'INACTIVE',
            moduleBlog: clientData.allowBlogs,
            moduleNews: clientData.allowNews,
            moduleVideos: clientData.allowVideos,
            moduleImages: clientData.allowImages,
          };
          setClient(mappedData);
        } else {
          setClient(null);
        }
      } catch (error) {
        console.error("Failed to fetch client:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchClient();
  }, [id]);

  // Auto-select first available module
  useEffect(() => {
    if (client && !activeModule) {
      if (client.moduleBlog) handleModuleSelect('blogs');
      else if (client.moduleNews) handleModuleSelect('news');
      else if (client.moduleVideos) handleModuleSelect('videos');
      else if (client.moduleImages) handleModuleSelect('images');
    }
  }, [client]);

  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      setIsSticky(offset > 500);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Helper to fix broken backend URLs (absolute paths)
  const getValidImageUrl = (url) => {

    if (!url) return null;

    // Already full URL
    if (url.startsWith("http")) {
      return url;
    }

    // Old Windows stored path (D:/Brandwar/...uploads/img.jpg)
    if (url.includes("uploads")) {
      const cleanPath = url.split("uploads")[1].replace(/\\/g, "/");
      return `http://localhost:4000/uploads${cleanPath}`;
    }

    return null;
  };
  // const getValidImageUrl = (url) => {
  //   if (!url) return null;
  //   if (typeof url !== 'string') return url;
  //   // Fix absolute path issue from backend
  //   if (url.includes('http://localhost:4000/C:')) {
  //     const parts = url.split('/uploads/');
  //     return parts.length > 1 ? `http://localhost:4000/uploads/${parts[1]}` : url;
  //   }
  //   // Handle relative uploads/ path
  //   if (url.startsWith('uploads/')) {
  //     return `http://localhost:4000/${url}`;
  //   }
  //   return url;
  // };

  const handleModuleSelect = async (module) => {
    setActiveModule(module);
    setModuleLoading(true);
    try {
      // Scoped fetching (if backend supports userId filtering, otherwise we filter locally)
      const endpoint = module === 'blogs' ? '/blogs' : module === 'news' ? '/news' : module === 'videos' ? '/videofolders' : '/imagefolders';
      const response = await api.get(endpoint);

      // Filter data for this specific client

      let data = response.data;
      // console.log("RAW DATA FROM API:", data);
      // console.log("VIEWING ID (from URL):", id);

      if (module === 'blogs' || module === 'news') {
        // Backend nests userId in user.id due to selectivity config
        data = data.filter(item => {
          const match = item.user?.id === id || item.userId === id;
          if (!match) {
            console.log(`Skipping item ${item.title}: user.id(${item.user?.id}) !== current.id(${id})`);
          }
          return match;
        });
      } else {
        // Videos and Images are folder-based
        data = data.filter(folder => {
          const match = folder.userId === id;
          if (!match) {
            console.log(`Skipping folder ${folder.title}: folder.userId(${folder.userId}) !== current.id(${id})`);
          }
          return match;
        });
      }

      // console.log("FINAL FILTERED DATA:", data);
      setModuleData(data);
    } catch (error) {
      setToast({ message: `Failed to load ${module}`, type: 'error' });
    } finally {
      setModuleLoading(false);
    }
  };

  const handleDelete = (itemId, type) => {
    setItemToDelete({ id: itemId, type });
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    const { id: itemId, type } = itemToDelete;

    try {
      const endpoint = type === 'blogs' ? `/blogs/${itemId}` : `/news/${itemId}`;
      await api.delete(endpoint);
      setToast({ message: `${type.slice(0, -1).charAt(0).toUpperCase() + type.slice(1, -1)} deleted successfully`, type: 'success' });
      handleModuleSelect(activeModule);
    } catch (error) {
      setToast({ message: 'Failed to delete item', type: 'error' });
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setIsCreateOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <svg className="animate-spin h-12 w-12 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-500">
        <p className="text-xl mb-4">Client not found</p>
        <Link to="/clients" className="btn-primary">Back to Clients</Link>
      </div>
    );
  }
  // console.log("CLIENT DATA:", client);
  // console.log("CLIENT LOGO:", client?.logo);
  // console.log("module data", moduleData)
  return (
    <div className="animate-fade-in max-w-7xl mx-auto px-4 sm:px-6">
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: '' })}
      />
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
        <Link to="/dashboard" className="hover:text-blue-600 transition-colors">Home</Link>
        <span>/</span>
        <Link to="/clients" className="hover:text-blue-600 transition-colors">Clients</Link>
        <span>/</span>
        <span className="text-slate-900 font-medium">{client.companyName}</span>
      </div>

      {/* Header Banner */}
      <div className="relative h-48 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-t-2xl overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute bottom-6 left-6 flex items-end gap-6 text-white z-10">
          <div className="w-24 h-24 bg-white/30 rounded-xl shadow-lg p-2">
            {client.logo ? (
              <img src={getValidImageUrl(client.logo)} alt="Logo" className="w-full h-full object-contain" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold text-3xl">
                {client.companyName ? client.companyName.charAt(0) : 'C'}
              </div>
            )}

          </div>
          <div className="mb-4">
            <h1 className="text-3xl font-bold">{client.companyName}</h1>
            <a href={client.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-blue-100 hover:text-white underline  decoration-blue-300/50">
              {client.websiteUrl}
            </a>
          </div>
        </div>
        <div className="absolute top-6 right-6">
          <span className={`px-4 py-2 rounded-full text-sm font-semibold backdrop-blur-md ${client.status === 'ACTIVE' ? 'bg-green-500/20 text-green-50 border border-green-400/30' : 'bg-red-500/20 text-red-50 border border-red-400/30'}`}>
            {client.status}
          </span>
        </div>
      </div>

      <div className="bg-white rounded-b-2xl shadow-sm border border-t-0 border-slate-200 p-8">

        {/* Company Details */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-3 mb-6 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
            Company Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Service Start Date</label>
              <p className="text-slate-900 font-medium">{client.startDate ? format(new Date(client.startDate), 'MMM dd, yyyy') : '-'}</p>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Service End Date</label>
              <p className="text-slate-900 font-medium">{client.endDate ? format(new Date(client.endDate), 'MMM dd, yyyy') : '-'}</p>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Primary Color</label>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md border border-slate-200 shadow-sm" style={{ backgroundColor: client.primaryColor }}></div>
                <span className="text-slate-700 font-mono text-sm">{client.primaryColor}</span>
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Secondary Color</label>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md border border-slate-200 shadow-sm" style={{ backgroundColor: client.secondaryColor }}></div>
                <span className="text-slate-700 font-mono text-sm">{client.secondaryColor}</span>
              </div>
            </div>
          </div>
          {client.address && (
            <div className="mt-6">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Address</label>
              <p className="text-slate-700">{client.address}</p>
            </div>
          )}
        </section>

        {/* Personal / Contact Details */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-3 mb-6 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            Contact Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Contact Person</label>
              <p className="text-slate-900 font-medium text-lg">{client.contactName}</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Email Address</label>
              <a href={`mailto:${client.email}`} className="text-blue-600 hover:underline font-medium break-all">{client.email}</a>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Phone Number</label>
              <a href={`tel:${client.phoneNumber}`} className="text-blue-600 hover:underline font-medium">{client.phoneNumber}</a>
            </div>
          </div>
        </section>

        {/* Modules */}
        <section>
          <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-3 mb-6 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
            Enabled Modules
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Blog Module */}
            <button
              onClick={() => client.moduleBlog && handleModuleSelect('blogs')}
              className={`p-4 rounded-xl border-2 transition-all text-left ${activeModule === 'blogs'
                ? 'border-blue-400 bg-blue-100 ring-2 ring-blue-100/50'
                : client.moduleBlog ? 'border-blue-100 bg-blue-50/50 hover:border-blue-200' : 'border-slate-100 bg-slate-50 opacity-50 grayscale cursor-not-allowed'
                }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-slate-700">Blog Module</span>
                {client.moduleBlog ? (
                  <span className="w-3 h-3 rounded-full bg-green-500 shadow-sm shadow-green-200"></span>
                ) : (
                  <span className="w-3 h-3 rounded-full bg-slate-300"></span>
                )}
              </div>
              {client.moduleBlog && (
                <div className="flex items-center gap-2 mt-2 pt-2 border-t border-blue-100/50">
                  <span className="text-xs text-slate-500">Theme Color:</span>
                  <div className="w-4 h-4 rounded shadow-sm" style={{ backgroundColor: client.blogColor }}></div>
                </div>
              )}
            </button>

            {/* News Module */}
            <button
              onClick={() => client.moduleNews && handleModuleSelect('news')}
              className={`p-4 rounded-xl border-2 transition-all text-left ${activeModule === 'news'
                ? 'border-red-400 bg-red-100 ring-2 ring-red-100/50'
                : client.moduleNews ? 'border-red-100 bg-red-50/50 hover:border-red-200' : 'border-slate-100 bg-slate-50 opacity-50 grayscale cursor-not-allowed'
                }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-slate-700">News Module</span>
                {client.moduleNews ? (
                  <span className="w-3 h-3 rounded-full bg-green-500 shadow-sm shadow-green-200"></span>
                ) : (
                  <span className="w-3 h-3 rounded-full bg-slate-300"></span>
                )}
              </div>
              {client.moduleNews && (
                <div className="flex items-center gap-2 mt-2 pt-2 border-t border-red-100/50">
                  <span className="text-xs text-slate-500">Theme Color:</span>
                  <div className="w-4 h-4 rounded shadow-sm" style={{ backgroundColor: client.newsColor }}></div>
                </div>
              )}
            </button>

            {/* Videos Module */}
            <button
              onClick={() => client.moduleVideos && handleModuleSelect('videos')}
              className={`p-4 rounded-xl border-2 transition-all text-left ${activeModule === 'videos'
                ? 'border-purple-400 bg-purple-100 ring-2 ring-purple-100/50'
                : client.moduleVideos ? 'border-purple-100 bg-purple-50/50 hover:border-purple-200' : 'border-slate-100 bg-slate-50 opacity-50 grayscale cursor-not-allowed'
                }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-slate-700">Videos Module</span>
                {client.moduleVideos ? (
                  <span className="w-3 h-3 rounded-full bg-green-500 shadow-sm shadow-green-200"></span>
                ) : (
                  <span className="w-3 h-3 rounded-full bg-slate-300"></span>
                )}
              </div>
              {client.moduleVideos && (
                <div className="flex items-center gap-2 mt-2 pt-2 border-t border-purple-100/50">
                  <span className="text-xs text-slate-500">Theme Color:</span>
                  <div className="w-4 h-4 rounded shadow-sm" style={{ backgroundColor: client.videosColor }}></div>
                </div>
              )}
            </button>

            {/* Images Module */}
            <button
              onClick={() => client.moduleImages && handleModuleSelect('images')}
              className={`p-4 rounded-xl border-2 transition-all text-left ${activeModule === 'images'
                ? 'border-teal-400 bg-teal-100 ring-2 ring-teal-100/50'
                : client.moduleImages ? 'border-teal-100 bg-teal-50/50 hover:border-teal-200' : 'border-slate-100 bg-slate-50 opacity-50 grayscale cursor-not-allowed'
                }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-slate-700">Images Module</span>
                {client.moduleImages ? (
                  <span className="w-3 h-3 rounded-full bg-green-500 shadow-sm shadow-green-200"></span>
                ) : (
                  <span className="w-3 h-3 rounded-full bg-slate-300"></span>
                )}
              </div>
              {client.moduleImages && (
                <div className="flex items-center gap-2 mt-2 pt-2 border-t border-teal-100/50">
                  <span className="text-xs text-slate-500">Theme Color:</span>
                  <div className="w-4 h-4 rounded shadow-sm" style={{ backgroundColor: client.imagesColor }}></div>
                </div>
              )}
            </button>
          </div>
        </section>

        {/* Sticky Module Navigation Wrapper */}
        <div className="relative mt-8 min-h-[64px]">
          {activeModule && (
            <div className={`transition-all duration-300 ${isSticky ? 'fixed top-14 left-0 right-0 z-40 bg-white/80 backdrop-blur-md shadow-sm border-b border-slate-200 px-8 py-2 lg:ml-64' : 'relative py-4 border-t border-slate-100'}`}>
              <div className="max-w-7xl mx-auto flex items-center justify-between overflow-x-auto scrollbar-hide">
                <div className="flex items-center gap-1 sm:gap-4 flex-nowrap min-w-max">
                  <div className="flex items-center gap-1 sm:gap-4 flex-nowrap min-w-max">
                    {[
                      { id: 'blogs', label: 'Blogs', icon: '📝', color: 'blue', enabled: client.moduleBlog },
                      { id: 'news', label: 'News', icon: '📰', color: 'red', enabled: client.moduleNews },
                      { id: 'videos', label: 'Videos', icon: '🎥', color: 'purple', enabled: client.moduleVideos },
                      { id: 'images', label: 'Images', icon: '🖼️', color: 'teal', enabled: client.moduleImages }
                    ].filter(m => m.enabled).map((m) => (
                      <button
                        key={m.id}
                        onClick={() => handleModuleSelect(m.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeModule === m.id
                          ? `bg-${m.color}-100 text-${m.color}-600`
                          : 'text-slate-500 hover:bg-slate-100'
                          }`}
                      >
                        <span>{m.icon}</span>
                        <span className="uppercase tracking-widest text-[10px]">{m.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => {
                    setEditingItem(null);
                    setIsCreateOpen(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all shrink-0 ml-4 shadow-lg shadow-slate-200"
                >
                  <span>➕</span>
                  <span className="uppercase tracking-widest text-[10px]">Add {activeModule.slice(0, -1)}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Module Content Area */}

        {activeModule && (
          <div className="mt-6 animate-slide-up bg-slate-50/30 rounded-3xl p-6 border border-slate-100">

            {moduleLoading ? (

              <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
                <p className="text-slate-500 font-medium">Fetching {activeModule}...</p>
              </div>

            ) : moduleData.length > 0 ? (

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                {(activeModule === 'blogs' || activeModule === 'news') &&
                  moduleData.map(item => (
                    activeModule === 'blogs' ? (
                      <BlogListing
                        key={item.id}
                        item={item}
                        onDetails={(i) => { setSelectedItem(i); setIsDetailOpen(true); }}
                        onEdit={handleEdit}
                        onDelete={(id) => handleDelete(id, 'blogs')}
                        getValidImageUrl={getValidImageUrl}
                      />
                    ) : (
                      <NewsListing
                        key={item.id}
                        item={item}
                        onDetails={(i) => { setSelectedItem(i); setIsDetailOpen(true); }}
                        onEdit={handleEdit}
                        onDelete={(id) => handleDelete(id, 'news')}
                        getValidImageUrl={getValidImageUrl}
                      />
                    )
                  ))
                }

                {activeModule === 'videos' &&
                  moduleData.map(folder => (
                    <Link
                      key={folder.id}
                      to={`/clients/${id}/gallery/videos/${folder.id}/${encodeURIComponent(folder.title)}`}
                      className="group relative bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-xl transition-all aspect-video flex flex-col"
                    >
                      <div className="flex-1 bg-slate-900 flex items-center justify-center relative overflow-hidden">
                        <span className="text-4xl z-10">🎥</span>
                        <div className="absolute inset-0 bg-blue-600/20 group-hover:bg-blue-600/40 transition-colors" />
                      </div>
                      <div className="p-4 bg-white border-t border-slate-50">
                        <h4 className="font-bold text-slate-900 uppercase tracking-widest text-xs truncate">{folder.title}</h4>
                        <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-widest">
                          {folder.videos?.length || 0} Videos • View Folder
                        </p>
                      </div>
                    </Link>
                  ))
                }

                {activeModule === 'images' &&
                  moduleData.map(folder => (
                    <Link
                      key={folder.id}
                      to={`/clients/${id}/gallery/images/${folder.id}/${encodeURIComponent(folder.title)}`}
                      className="group relative bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-xl transition-all aspect-video flex flex-col"
                    >
                      <div className="flex-1 bg-slate-100 flex items-center justify-center relative overflow-hidden">
                        {folder.images?.[0] ? (
                          <img
                            src={getValidImageUrl(folder.images[0].url)}
                            alt=""
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : (
                          <span className="text-4xl z-10">🖼️</span>
                        )}
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
                      </div>
                      <div className="p-4 bg-white border-t border-slate-50">
                        <h4 className="font-bold text-slate-900 uppercase tracking-widest text-xs truncate">{folder.title}</h4>
                        <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-widest">
                          {folder.images?.length || 0} Images • View Gallery
                        </p>
                      </div>
                    </Link>
                  ))
                }

              </div>

            ) : (

              <div className="bg-white rounded-2xl p-20 text-center border-2 border-dashed border-slate-100">
                <div className="text-4xl mb-4 opacity-20">📂</div>
                <h3 className="text-xl font-bold text-slate-400">No {activeModule} found</h3>
                <p className="text-slate-400 text-sm mt-1">
                  Start by adding your first {activeModule.slice(0, -1)}!
                </p>
              </div>

            )}

          </div>
        )}

        {
          isSuperAdmin && (
            <div className="flex justify-start mt-6 mb-12">
              <button onClick={() => navigate('/clients')} className="btn-secondary flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                Back to List
              </button>
            </div>
          )
        }

        {/* Modals */}
        <CreateBlogModal
          isOpen={isCreateOpen && activeModule === 'blogs'}
          onClose={() => {
            setIsCreateOpen(false);
            setEditingItem(null);
          }}
          clientId={id}
          initialData={editingItem}
          onSuccess={() => {
            handleModuleSelect('blogs');
            setToast({ message: editingItem ? 'Blog updated successfully' : 'Blog created successfully', type: 'success' });
            setEditingItem(null);
          }}
        />
        <CreateNewsModal
          isOpen={isCreateOpen && activeModule === 'news'}
          onClose={() => {
            setIsCreateOpen(false);
            setEditingItem(null);
          }}
          clientId={id}
          initialData={editingItem}
          onSuccess={() => {
            handleModuleSelect('news');
            setToast({ message: editingItem ? 'News updated successfully' : 'News published successfully', type: 'success' });
            setEditingItem(null);
          }}
        />
        <CreateVideoModal
          isOpen={isCreateOpen && activeModule === 'videos'}
          onClose={() => setIsCreateOpen(false)}
          clientId={id}
          onSuccess={() => {
            handleModuleSelect('videos');
            setToast({ message: 'Video added successfully', type: 'success' });
          }}
        />
        <CreateImageModal
          isOpen={isCreateOpen && activeModule === 'images'}
          onClose={() => setIsCreateOpen(false)}
          clientId={id}
          onSuccess={() => {
            handleModuleSelect('images');
            setToast({ message: 'Image uploaded successfully', type: 'success' });
          }}
        />
        <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setItemToDelete(null);
          }}
          onConfirm={confirmDelete}
          title={`Delete ${itemToDelete?.type?.slice(0, -1)}?`}
          message={`Are you sure you want to delete this ${itemToDelete?.type?.slice(0, -1)}? This action cannot be undone.`}
        />
      </div>
    </div>
  );
};

export default ClientView;
