import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { slugify } from '../utils/slugify';
import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';
import Toast from '../components/Toast';
import ClientForm from '../components/ClientForm';

const DeleteModal = ({ client, isOpen, onClose, onConfirm }) => {
  const [step, setStep] = useState(1);
  const [companyName, setCompanyName] = useState('');
  const [error, setError] = useState('');

  const handleDelete = () => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      if (companyName.trim().toLowerCase() === client.companyName.toLowerCase()) {
        onConfirm(client.id);
        onClose();
        setStep(1);
        setCompanyName('');
        setError('');
      } else {
        setError('Company name does not match. Please try again.');
      }
    }
  };

  const handleClose = () => {
    setStep(1);
    setCompanyName('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-slate-900">Delete Client</h3>
              <p className="text-sm text-slate-600">{client?.companyName}</p>
            </div>
          </div>

          {step === 1 ? (
            <>
              <p className="text-slate-700 mb-6">
                Are you sure you want to delete this client? This action cannot be undone and will remove all associated data.
              </p>
              <div className="flex gap-3">
                <button onClick={handleClose} className="flex-1 btn-secondary">
                  No, Cancel
                </button>
                <button onClick={handleDelete} className="flex-1 btn-danger">
                  Yes, Continue
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="text-slate-700 mb-4">
                To confirm deletion, please type the company name exactly as shown:
              </p>
              <div className="bg-slate-100 rounded-lg p-3 mb-4">
                <p className="font-mono font-semibold text-slate-900">{client?.companyName}</p>
              </div>
              <input
                type="text"
                value={companyName}
                onChange={(e) => {
                  setCompanyName(e.target.value);
                  setError('');
                }}
                placeholder="Enter company name"
                className={`input-field mb-4 ${error ? 'border-red-500' : ''}`}
              />
              {error && (
                <p className="text-red-600 text-sm mb-4">{error}</p>
              )}
              <div className="flex gap-3">
                <button onClick={handleClose} className="flex-1 btn-secondary">
                  Cancel
                </button>
                <button onClick={handleDelete} className="flex-1 btn-danger">
                  Delete Permanently
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const EditModal = ({ client, isOpen, onClose, onUpdate }) => {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (formData) => {
    setLoading(true);
    try {
      await onUpdate(client.id, formData);
      onClose();
    } catch (error) {
      console.error("Update failed", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content max-w-4xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Edit Client</h2>
              <p className="text-sm text-slate-500">Clients &gt; Edit <span className='font-bold text-black'>" {client?.companyName} "</span></p>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <ClientForm
            initialData={client}
            onSubmit={handleSubmit}
            loading={false}
            submitLoading={loading}
            isEditMode={true}
            onCancel={onClose}
          />
        </div>
      </div>
    </div>
  );
};

const Clients = () => {
  const navigate = useNavigate();
  const { isSuperAdmin } = useAuth();
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]); // Store filtered results
  const [paginatedClients, setPaginatedClients] = useState([]); // Store current page

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState(null);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [clientToEdit, setClientToEdit] = useState(null);

  const [toast, setToast] = useState({ message: '', type: '' });

  // Load clients from API
  const loadClients = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/admins');
      // The API returns all admins. We filter/paginate locally for now.
      const allClients = response.data
        .filter(client => client.isActive !== false) // Filter out soft-deleted clients
        .map(client => ({
          ...client,
          companyName: client.company_name,
          websiteUrl: client.website,
          contactName: client.name,
          phoneNumber: client.contact_number,
          primaryColor: client.primary_color,
          secondaryColor: client.secondary_color,
          logo: client.logo,
          status: client.isActive ? 'ACTIVE' : 'INACTIVE', // Map boolean to string status
          // Ensure module flags are handled (backend uses camelCase for these)
          moduleBlog: client.allowBlogs,
          blogColor: client.blogColor || '#3B82F6', // Default blue
          moduleNews: client.allowNews,
          newsColor: client.newsColor || '#EF4444', // Default red
          moduleVideos: client.allowVideos, // Backend uses allowVideos? Checking controller...
          videosColor: client.videosColor || '#8B5CF6', // Default purple
          moduleImages: client.allowImages,
          imagesColor: client.imagesColor || '#10B981', // Default green
        }));

      let result = allClients;

      // Filter by search
      if (search) {
        const searchLower = search.toLowerCase();
        result = result.filter(c =>
          (c.companyName && c.companyName.toLowerCase().includes(searchLower)) ||
          (c.websiteUrl && c.websiteUrl.toLowerCase().includes(searchLower)) ||
          (c.phoneNumber && c.phoneNumber.includes(searchLower))
        );
      }

      // Filter by status
      if (statusFilter) {
        result = result.filter(c => c.status === statusFilter);
      }

      setFilteredClients(result);
      setTotal(result.length);
      setTotalPages(Math.ceil(result.length / limit));

      // Pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      setPaginatedClients(result.slice(startIndex, endIndex));

    } catch (error) {
      console.error("Failed to load clients:", error);
      setToast({ message: 'Failed to load clients', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, page, limit]);

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  const handleDelete = async (clientId) => {
    try {
      await api.delete(`/admins/${clientId}`);
      setToast({ message: 'Client deleted successfully', type: 'success' });

      // Optimistic update
      setPaginatedClients(prev => prev.filter(c => c.id !== clientId));
      setFilteredClients(prev => prev.filter(c => c.id !== clientId));
      setTotal(prev => prev - 1);

      loadClients(); // Reload list to sync with server
    } catch (error) {
      console.error("Failed to delete client:", error);
      setToast({ message: 'Failed to delete client', type: 'error' });
    }
  };

  const handleUpdate = async (clientId, formData) => {
    try {
      const isActive = formData.status === 'ACTIVE';

      const payload = new FormData();
      payload.append('isActive', isActive);
      payload.append('company_name', formData.companyName || '');
      payload.append('website', formData.websiteUrl || '');
      payload.append('name', formData.contactName || '');
      payload.append('contact_number', formData.phoneNumber || '');
      payload.append('primary_color', formData.primaryColor || '');
      payload.append('secondary_color', formData.secondaryColor || '');
      payload.append('email', formData.email || '');
      payload.append('address', formData.address || '');

      if (formData.password) {
        payload.append('password', formData.password);
      }

      if (formData.logoFile) {
        payload.append('logo', formData.logoFile);
      } else if (formData.logo && !formData.logo.startsWith('blob:')) {
        payload.append('logo', formData.logo); // fallback to original string path
      }

      payload.append('allowBlogs', !!formData.moduleBlog);
      payload.append('allowNews', !!formData.moduleNews);
      payload.append('allowVideos', !!formData.moduleVideos);
      payload.append('allowImages', !!formData.moduleImages);

      if (formData.startDate) payload.append('startDate', formData.startDate);
      if (formData.endDate) payload.append('endDate', formData.endDate);

      await api.put(`/admins/${clientId}/update`, payload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setToast({ message: 'Client updated successfully', type: 'success' });

      // Optimistic update for current page
      setPaginatedClients(prev => prev.map(c =>
        c.id === clientId ? { ...c, ...formData, status: formData.status } : c
      ));

      loadClients();
    } catch (error) {
      console.error("Failed to update client:", error);
      throw error; // Re-throw to be caught by modal
    }
  }

  const openDeleteModal = (client) => {
    setClientToDelete(client);
    setDeleteModalOpen(true);
  };

  const openEditModal = (client) => {
    setClientToEdit(client);
    setEditModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: '' })}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Clients</h1>
          <p className="text-slate-600 mt-1">Manage and view all your clients</p>
        </div>
        <button
          onClick={() => navigate('/add-client')}
          className="btn-primary"
        >
          <span className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add New Client
          </span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <input
                type="search"
                placeholder="Search by company name, URL, or phone number..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="input-field pl-10"
              />
              <svg className="absolute left-3 top-3 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="input-field"
          >
            <option value="">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="HOLD">Hold</option>
          </select>
        </div>
      </div>

      {/* Clients Table */}
      <div className="table-container">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Company</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Service Period</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Modules</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <svg className="animate-spin h-8 w-8 text-blue-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </td>
                </tr>
              ) : paginatedClients.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                    No clients found
                  </td>
                </tr>
              ) : (
                paginatedClients.map((client) => (
                  <tr key={client.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-slate-900">{client.companyName}</p>
                        <a href={client.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                          {client.websiteUrl}
                        </a>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <p className="text-slate-900">{client.contactName}</p>
                        <p className="text-slate-500">{client.phoneNumber}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-600">
                        <p>{format(new Date(client.startDate), 'MMM dd, yyyy')}</p>
                        <p className="text-slate-500">to {format(new Date(client.endDate), 'MMM dd, yyyy')}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {client.moduleBlog && (
                          <div
                            onClick={() => navigate(`/${slugify(client.companyName)}/blogs`)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-black text-sm font-semibold cursor-pointer hover:scale-110 transition-transform"
                            style={{ backgroundColor: client.blogColor }}
                            title="Blog"
                          >
                            B
                          </div>
                        )}
                        {client.moduleNews && (
                          <div
                            onClick={() => navigate(`/${slugify(client.companyName)}/news`)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-black text-sm font-semibold cursor-pointer hover:scale-110 transition-transform"
                            style={{ backgroundColor: client.newsColor }}
                            title="News"
                          >
                            N
                          </div>
                        )}
                        {client.moduleVideos && (
                          <div
                            onClick={() => navigate(`/${slugify(client.companyName)}/gallery/videos`)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-black text-sm font-semibold cursor-pointer hover:scale-110 transition-transform"
                            style={{ backgroundColor: client.videosColor }}
                            title="Videos"
                          >
                            V
                          </div>
                        )}
                        {client.moduleImages && (
                          <div
                            onClick={() => navigate(`/${slugify(client.companyName)}/gallery/images`)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-black text-sm font-semibold cursor-pointer hover:scale-110 transition-transform"
                            style={{ backgroundColor: client.imagesColor }}
                            title="Images"
                          >
                            I
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`badge ${client.status === 'ACTIVE' ? 'badge-active' : client.status === 'INACTIVE' ? 'badge-inactive' : 'badge-hold'}`}>
                        {client.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigate(`/${slugify(client.companyName)}`)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => openEditModal(client)}
                          className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => openDeleteModal(client)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-600">Show</span>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span className="text-sm text-slate-600">
              per page (Showing {paginatedClients.length} of {total})
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i + 1}
                onClick={() => setPage(i + 1)}
                className={`px-3 py-1.5 border rounded-lg text-sm font-medium ${page === i + 1
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'border-slate-300 text-slate-700 hover:bg-slate-50'
                  }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      <DeleteModal
        client={clientToDelete}
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
      />

      {/* Edit Modal */}
      <EditModal
        client={clientToEdit}
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onUpdate={handleUpdate}
      />
    </div>
  );
};

export default Clients;
