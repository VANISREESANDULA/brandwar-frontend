import React from 'react';

const Requests = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Requests</h1>
        <p className="text-slate-600 mt-1">View and manage client requests</p>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
        <div className="text-6xl mb-4">📋</div>
        <h2 className="text-2xl font-semibold text-slate-900 mb-2">No Requests Yet</h2>
        <p className="text-slate-600">Client requests will appear here</p>
      </div>
    </div>
  );
};

export default Requests;
