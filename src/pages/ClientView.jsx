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
import EditFolderModal from '../components/EditFolderModal';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import BlogListing from '../components/content/BlogListing';
import NewsListing from '../components/content/NewsListing';
import VideoListing from '../components/content/VideoListing';
import ImageListing from '../components/content/ImageListing';

import { slugify } from '../utils/slugify';

const ClientView = ({ forceModule }) => {
  const { id } = useParams();
  // console.log("ID:", id);
  const { companySlug, type } = useParams();
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
  const [isTwoStepDelete, setIsTwoStepDelete] = useState(false);
  const [isEditFolderOpen, setIsEditFolderOpen] = useState(false);
  const [folderToEdit, setFolderToEdit] = useState(null);
  // console.log("CLIENT DATA:", client);
  useEffect(() => {
    if (forceModule) {
      setActiveModule(forceModule === 'gallery' ? type || 'images' : forceModule);
    }
  }, [forceModule, type]);

  useEffect(() => {
    const fetchClientBySlug = async () => {
      try {
        // Since /admins/:id does not exist on backend, fetch all and find the client locally
        const response = await api.get('/admins');
        const clientData = response.data.find(c => slugify(c.company_name) === companySlug);

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

    fetchClientBySlug();
  }, [companySlug]);

  // Fetch module data when activeModule changes or client is resolved
  useEffect(() => {
    if (activeModule && client) {
      handleModuleSelect(activeModule, false);
    }
  }, [activeModule, client]);

  // Auto-select first available module if none active
  useEffect(() => {
    if (client && !activeModule && !forceModule) {
      let firstModule = null;
      if (client.moduleBlog) firstModule = 'blogs';
      else if (client.moduleNews) firstModule = 'news';
      else if (client.moduleVideos) firstModule = 'videos';
      else if (client.moduleImages) firstModule = 'images';

      if (firstModule) {
        handleModuleSelect(firstModule);
      }
    }
  }, [client, activeModule, forceModule]);

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

    // Handle production URL issues in local dev
    if (url.includes("brandwar.com")) {
      const parts = url.split("/");
      const fileName = parts[parts.length - 1];
      // Try to load it from local uploads if it's supposed to be a logo
      return `http://localhost:4000/uploads/${fileName}`;
    }

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

  const getYouTubeThumbnail = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      return `https://img.youtube.com/vi/${match[2]}/maxresdefault.jpg`;
    }
    return null;
  };

  const handleModuleSelect = async (module, shouldNavigate = true) => {
    if (shouldNavigate) {
      if (module === 'blogs') navigate(`/${companySlug}/blogs`);
      else if (module === 'news') navigate(`/${companySlug}/news`);
      else if (module === 'videos') navigate(`/${companySlug}/gallery/videos`);
      else if (module === 'images') navigate(`/${companySlug}/gallery/images`);
      else navigate(`/${companySlug}`);
      return;
    }
    setActiveModule(module);
    setModuleLoading(true);
    setModuleData([]); // Clear old data to force UI refresh
    // console.log("ID:", client?.id);
    try {
      // Scoped fetching (if backend supports userId filtering, otherwise we filter locally)
      const endpoint = module === 'blogs' ? '/blogs' : module === 'news' ? '/news' : module === 'videos' ? '/videofolders' : '/imagefolders';
      const response = await api.get(endpoint, {
        params: {
          adminId: client?.id,
          _t: Date.now()
        }
      });
      // console.log("RESPONSE DATA:", response.data);

      // Filter data for this specific client

      let data = response.data;
      // console.log("RAW DATA FROM API:", data);
      // console.log("VIEWING ID (from URL):", id);

      if (module === 'blogs' || module === 'news') {
        // Backend nests userId in user.id due to selectivity config
        data = data.filter(item => {
          const match = item.user?.id === client.id || item.userId === client.id;
          return match;
        });
      } else {
        // Videos and Images are folder-based
        data = data.filter(folder => {
          const match = folder.userId === client.id;
          return match;
        });
      }

      // console.log("FINAL FILTERED DATA:", data);
      // console.log("DATA SET:", data);
      setModuleData(data);
    } catch (error) {
      setToast({ message: `Failed to load ${module}`, type: 'error' });
    } finally {
      setModuleLoading(false);
    }
  };

  const handleDelete = (item, isFolder = false) => {
    setItemToDelete({ ...item, isFolder });
    setIsTwoStepDelete(isFolder);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    const { id: itemId, isFolder } = itemToDelete;
    const type = activeModule;

    try {
      let endpoint = '';
      if (isFolder) {
        endpoint = type === 'videos' ? `/videofolders/${itemId}` : `/imagefolders/${itemId}`;
      } else {
        endpoint = type === 'blogs' ? `/blogs/${itemId}` : `/news/${itemId}`;
      }

      await api.delete(endpoint);
      setToast({ message: `${isFolder ? 'Folder' : type.slice(0, -1).charAt(0).toUpperCase() + type.slice(1, -1)} deleted successfully`, type: 'success' });
      handleModuleSelect(activeModule, false);
    } catch (error) {
      console.error("Delete failed:", error);
      setToast({ message: 'Failed to delete', type: 'error' });
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setIsCreateOpen(true);
  };

  const handleDeleteClick = (e, item, isFolder = false) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    handleDelete(item, isFolder);
  };

  const handleEditClick = (e, item, isFolder = false) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (isFolder) {
      setFolderToEdit(item);
      setIsEditFolderOpen(true);
    } else {
      handleEdit(item);
    }
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
          <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-3 mb-6 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
              Enabled Modules
            </span>
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
                  <span className="w-2 h-2 rounded-full bg-green-500 shadow-sm shadow-green-200"></span>
                ) : (
                  <span className="w-2 h-2 rounded-full bg-slate-300"></span>
                )}
              </div>
              {client.moduleBlog && (
                <div className="flex items-center gap-2 mt-2 pt-2 border-blue-100/50">
                  {/* <span className="text-xs text-slate-500">Theme Color:</span> */}
                  <div className="w-2 h-2 rounded shadow-sm" style={{ backgroundColor: client.blogColor }}></div>
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
                <div className="flex items-center gap-2 mt-2 pt-2 border-red-100/50">
                  {/* <span className="text-xs text-slate-500">Theme Color:</span> */}
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
                <div className="flex items-center gap-2 mt-2 pt-2  border-purple-100/50">
                  {/* <span className="text-xs text-slate-500">Theme Color:</span> */}
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
                <div className="flex items-center gap-2 mt-2 pt-2  border-teal-100/50">
                  {/* <span className="text-xs text-slate-500">Theme Color:</span> */}
                  <div className="w-4 h-4 rounded shadow-sm" style={{ backgroundColor: client.imagesColor }}></div>
                </div>
              )}
            </button>
          </div>
        </section>


        {/* Module Content Area */}

        {activeModule && (
          <div className="mt-6 animate-slide-up bg-slate-50/30 rounded-3xl p-6 border border-slate-100">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-200/50">
              <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter flex items-center gap-2">
                <span>{activeModule === 'blogs' ? '📝' : activeModule === 'news' ? '📰' : activeModule === 'videos' ? '🎥' : '🖼️'}</span>
                {activeModule} Management
              </h3>
              <button
                onClick={() => {
                  setEditingItem(null);
                  setIsCreateOpen(true);
                }}
                className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-2xl text-xs font-black hover:bg-slate-800 hover:scale-105 transition-all shadow-xl shadow-slate-200"
              >
                <span>➕</span>
                <span className="uppercase tracking-widest">Add {activeModule.slice(0, -1)}</span>
              </button>
            </div>

            {moduleLoading ? (

              <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
                <p className="text-slate-500 font-medium">Fetching {activeModule}...</p>
              </div>

            ) : moduleData.length > 0 ? (

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                {(activeModule === 'blogs' || activeModule === 'news') &&
                  moduleData.map((item) => (
                    activeModule === 'blogs' ? (
                      <BlogListing
                        key={item.id}
                        item={item}
                        onDetails={(i) => { setSelectedItem(i); setIsDetailOpen(true); }}
                        onEdit={handleEdit}
                        onDelete={() => handleDelete(item, false)}
                        getValidImageUrl={getValidImageUrl}
                      />
                    ) : (
                      <NewsListing
                        key={`${item.id}-${item.contents?.find(c => c.type === 'image')?.content || 'noimg'}`}
                        item={item}
                        onDetails={(i) => { setSelectedItem(i); setIsDetailOpen(true); }}
                        onEdit={handleEdit}
                        onDelete={() => handleDelete(item, false)}
                        getValidImageUrl={getValidImageUrl}
                      />
                    )
                  ))
                }

                {activeModule === 'videos' &&
                  moduleData.map(folder => {
                    const latestVideo = folder.videos?.[0];
                    const thumbnail = latestVideo ? getYouTubeThumbnail(latestVideo.url) : null;

                    return (
                      <Link
                        key={folder.id}
                        to={`/${companySlug}/gallery/videos/${folder.id}/${encodeURIComponent(folder.title)}`}
                        className="group relative bg-slate-900 rounded-3xl shadow-xl border border-slate-200 overflow-hidden hover:shadow-2xl hover:scale-[1.02] transition-all aspect-video flex flex-col"
                      >
                        <div className="absolute inset-0 z-0">
                          {thumbnail ? (
                            <img
                              src={thumbnail}
                              alt=""
                              className="w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-110 transition-all duration-700"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center opacity-40">
                              <span className="text-4xl text-white/20">🎥</span>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent z-1" />
                        </div>

                        <div className="relative z-10 flex-1 flex flex-col justify-end p-6">
                          <div className="flex items-end justify-between">
                            <div className="space-y-1">
                              <h4 className="font-black text-white text-xl uppercase tracking-tighter drop-shadow-lg group-hover:translate-x-1 transition-transform">{folder.title}</h4>
                              <p className="text-[10px] text-white/70 font-bold uppercase tracking-[0.2em] drop-shadow-md">
                                {folder.videos?.length || 0} Videos <span className="mx-1">•</span> View Folder
                              </p>
                            </div>

                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                              <button
                                onClick={(e) => handleEditClick(e, folder, true)}
                                className="w-10 h-10 bg-white/10 hover:bg-blue-600 backdrop-blur-md text-white rounded-xl flex items-center justify-center transition-all border border-white/20 shadow-lg"
                                title="Edit Folder"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                              </button>
                              <button
                                onClick={(e) => handleDeleteClick(e, folder, true)}
                                className="w-10 h-10 bg-white/10 hover:bg-red-600 backdrop-blur-md text-white rounded-xl flex items-center justify-center transition-all border border-white/20 shadow-lg"
                                title="Delete Folder"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })
                }

                {activeModule === 'images' &&
                  moduleData.map(folder => (
                    <Link
                      key={folder.id}
                      to={`/${companySlug}/gallery/images/${folder.id}/${encodeURIComponent(folder.title)}`}
                      className="group relative bg-slate-100 rounded-3xl shadow-xl border border-slate-200 overflow-hidden hover:shadow-2xl hover:scale-[1.02] transition-all aspect-video flex flex-col"
                    >
                      {/* Background Image */}
                      <div className="absolute inset-0 z-0">
                        {folder.images?.[0] ? (
                          <img
                            src={getValidImageUrl(folder.images[0].url)}
                            alt=""
                            className="w-full h-full object-cover opacity-70 group-hover:opacity-90 group-hover:scale-110 transition-all duration-700"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center opacity-40">
                            <span className="text-4xl text-slate-300">🖼️</span>
                          </div>
                        )}
                        {/* Gradient Overlay (Darker for light images) */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent z-1" />
                      </div>

                      {/* Card Info Overlay */}
                      <div className="relative z-10 flex-1 flex flex-col justify-end p-6">
                        <div className="flex items-end justify-between">
                          <div className="space-y-1">
                            <h4 className="font-black text-white text-xl uppercase tracking-tighter drop-shadow-lg group-hover:translate-x-1 transition-transform">{folder.title}</h4>
                            <p className="text-[10px] text-white/70 font-bold uppercase tracking-[0.2em] drop-shadow-md">
                              {folder.images?.length || 0} Images <span className="mx-1">•</span> View Gallery
                            </p>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                            <button
                              onClick={(e) => handleEditClick(e, folder, true)}
                              className="w-10 h-10 bg-white/10 hover:bg-teal-600 backdrop-blur-md text-white rounded-xl flex items-center justify-center transition-all border border-white/20 shadow-lg"
                              title="Edit Folder"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                            </button>
                            <button
                              onClick={(e) => handleDeleteClick(e, folder, true)}
                              className="w-10 h-10 bg-white/10 hover:bg-red-600 backdrop-blur-md text-white rounded-xl flex items-center justify-center transition-all border border-white/20 shadow-lg"
                              title="Delete Folder"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                          </div>
                        </div>
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
          clientId={client?.id}
          initialData={editingItem}
          onSuccess={() => {
            handleModuleSelect('blogs', false);
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
          clientId={client?.id}
          initialData={editingItem}
          onSuccess={() => {
            const isEditing = !!editingItem;
            setEditingItem(null);
            setIsCreateOpen(false);
            setTimeout(() => {
              handleModuleSelect('news', false);
              setToast({ message: isEditing ? 'News updated successfully' : 'News published successfully', type: 'success' });
            }, 500);
          }}
        />
        <CreateVideoModal
          isOpen={isCreateOpen && activeModule === 'videos'}
          onClose={() => setIsCreateOpen(false)}
          clientId={client?.id}
          onSuccess={() => {
            handleModuleSelect('videos', false);
            setToast({ message: 'Video added successfully', type: 'success' });
          }}
        />
        <CreateImageModal
          isOpen={isCreateOpen && activeModule === 'images'}
          onClose={() => setIsCreateOpen(false)}
          clientId={client?.id}
          onSuccess={() => {
            handleModuleSelect('images', false);
            setToast({ message: 'Image uploaded successfully', type: 'success' });
          }}
        />
        <EditFolderModal
          isOpen={isEditFolderOpen}
          onClose={() => setIsEditFolderOpen(false)}
          onSuccess={() => {
            handleModuleSelect(activeModule, false);
            setToast({ message: 'Folder updated successfully', type: 'success' });
          }}
          folder={folderToEdit}
          type={activeModule}
        />
        <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setItemToDelete(null);
          }}
          onConfirm={confirmDelete}
          title={itemToDelete?.isFolder ? 'Delete Folder?' : 'Delete Item?'}
          message={itemToDelete?.isFolder
            ? `Are you sure you want to delete "${itemToDelete?.title}"? This will remove all items inside.`
            : 'Are you sure you want to delete this item?'}
          twoStep={isTwoStepDelete}
        />
      </div>
    </div>
  );
};

export default ClientView;
