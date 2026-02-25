import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { format } from 'date-fns';
import Toast from '../components/Toast';

const RestoreModal = ({ client, isOpen, onClose, onConfirm }) => {
  const [step, setStep] = useState(1);
  const [companyName, setCompanyName] = useState('');
  const [error, setError] = useState('');

  const handleRestore = () => {
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
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-slate-900">Restore Client</h3>
              <p className="text-sm text-slate-600">{client?.companyName}</p>
            </div>
          </div>

          {step === 1 ? (
            <>
              <p className="text-slate-700 mb-6">
                Are you sure you want to restore this client? They will be moved back to the active directory.
              </p>
              <div className="flex gap-3">
                <button onClick={handleClose} className="flex-1 btn-secondary">
                  No, Cancel
                </button>
                <button onClick={handleRestore} className="flex-1 btn-primary">
                  Yes, Continue
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="text-slate-700 mb-4">
                To confirm restoration, please type the company name exactly as shown:
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
                <button onClick={handleRestore} className="flex-1 btn-primary">
                  Restore Client
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const PreviousClients = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ message: '', type: '' });
  const [search, setSearch] = useState('');
  const [restoreModalOpen, setRestoreModalOpen] = useState(false);
  const [clientToRestore, setClientToRestore] = useState(null);

  const loadClients = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/admins');
      // Filter for inactive clients and map properties
      const inactiveClients = response.data
        .filter(client => client.status === 'INACTIVE' || client.isActive === false)
        .map(client => ({
          ...client,
          companyName: client.company_name,
          contactName: client.name,
          phoneNumber: client.contact_number,
        }));
      setClients(inactiveClients);
    } catch (error) {
      console.error("Failed to load previous clients:", error);
      setToast({ message: 'Failed to load clients', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  const handleRestore = async (clientId) => {
    try {
      await api.put(`/admins/${clientId}/restoreAdmin`, {
        status: 'ACTIVE',
        isActive: true
      });
      setToast({ message: 'Client restored successfully', type: 'success' });
      // Clear data immediately to show update
      setClients(prev => prev.filter(c => c.id !== clientId));
      loadClients();
    } catch (error) {
      console.error("Failed to restore client:", error);
      setToast({ message: 'Failed to restore client', type: 'error' });
    }
  };

  const openRestoreModal = (client) => {
    setClientToRestore(client);
    setRestoreModalOpen(true);
  };

  const filteredClients = clients.filter(client =>
    client.companyName.toLowerCase().includes(search.toLowerCase()) ||
    client.contactName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: '' })}
      />

      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
        <Link to="/dashboard" className="hover:text-blue-600 transition-colors">Home</Link>
        <span>/</span>
        <span className="text-slate-900 font-medium">Previous Clients</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Previous Clients</h1>
          <p className="text-slate-600 mt-1">View and restore deactivated clients</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 max-w-md">
        <div className="relative">
          <input
            type="search"
            placeholder="Search previous clients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10"
          />
          <svg className="absolute left-3 top-3 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
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
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Deactivated Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <svg className="animate-spin h-8 w-8 text-blue-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </td>
                </tr>
              ) : filteredClients.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                    No previous clients found
                  </td>
                </tr>
              ) : (
                filteredClients.map((client) => (
                  <tr key={client.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-slate-900">{client.companyName}</p>
                        <p className="text-xs text-slate-500 opacity-60">ID: {client.id.substring(0, 8)}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <p className="text-slate-900">{client.contactName}</p>
                        <p className="text-slate-500">{client.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-600">
                        <p>{client.startDate ? format(new Date(client.startDate), 'MMM dd, yyyy') : 'N/A'}</p>
                        <p className="text-slate-500">to {client.endDate ? format(new Date(client.endDate), 'MMM dd, yyyy') : 'N/A'}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="badge badge-inactive">
                        Inactive
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => openRestoreModal(client)}
                        className="btn-primary py-1 px-3 text-sm"
                      >
                        Restore
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <RestoreModal
        client={clientToRestore}
        isOpen={restoreModalOpen}
        onClose={() => setRestoreModalOpen(false)}
        onConfirm={handleRestore}
      />
    </div>
  );
};

export default PreviousClients;
