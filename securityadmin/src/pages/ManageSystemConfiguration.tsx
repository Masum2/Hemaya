// src/pages/ManageSystemConfiguration.tsx
import React, { useState } from 'react';
import { PencilIcon, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Save, X, Settings } from 'lucide-react';
import { useSystemConfiguration, type ConfigItem } from '../api-hooks/manage-system-configuration-hooks/useSystemConfiguration';

export const ManageSystemConfiguration: React.FC = () => {
    const { data, loading, error, updateConfiguration } = useSystemConfiguration();
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editForm, setEditForm] = useState<ConfigItem | null>(null);

    // Edit mode start
    const handleEdit = (item: ConfigItem) => {
        setEditingId(item.id);
        setEditForm({ ...item });
    };

    // Cancel edit
    const handleCancel = () => {
        setEditingId(null);
        setEditForm(null);
    };

    // Save changes
    const handleSave = async () => {
        if (editForm) {
            const success = await updateConfiguration(editForm);
            if (success) {
                setEditingId(null);
                setEditForm(null);
            }
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center min-h-screen bg-[#f8fafc]">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent shadow-md"></div>
                <div className="text-indigo-600 font-semibold text-sm mt-4 tracking-wide animate-pulse">Loading configurations...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 max-w-7xl mx-auto mt-6 bg-rose-50 text-rose-700 rounded-xl border border-rose-200 shadow-sm flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
                <p className="text-sm"><strong>Configuration Error:</strong> {error}</p>
            </div>
        );
    }

    return (
        <div className="p-6 md:p-8 bg-[#f1f5f9] min-h-screen">
            {/* Header Area */}
            <div className="max-w-7xl mx-auto mb-8 flex items-center gap-3.5">
                <div className="p-2.5 bg-gradient-to-tr from-indigo-600 to-blue-500 rounded-xl shadow-md shadow-indigo-200 text-white">
                    <Settings size={22} className="animate-spin-[spin_3s_linear_infinite]" />
                </div>
                <div>
                    <h1 className="text-2xl font-extrabold bg-gradient-to-r from-indigo-700 to-blue-600 bg-clip-text text-transparent tracking-tight">
                        System Configuration
                    </h1>
                    <p className="text-xs md:text-sm text-slate-500 font-medium mt-0.5">Manage and update global system variables and live statuses.</p>
                </div>
            </div>

            {/* Table Container */}
            <div className="max-w-7xl mx-auto bg-white border border-slate-200 rounded-2xl shadow-md shadow-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gradient-to-r from-slate-50 to-blue-50/40 border-b border-slate-200">
                                <th className="p-4 font-bold text-slate-700 text-xs uppercase tracking-wider pl-6">Configuration</th>
                                <th className="p-4 font-bold text-slate-700 text-xs uppercase tracking-wider w-40">Status</th>
                                <th className="p-4 font-bold text-slate-700 text-xs uppercase tracking-wider w-48">Config Value</th>
                                <th className="p-4 w-44 text-right pr-6">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {data.map((item) => (
                                <tr key={item.id} className="hover:bg-indigo-50/20 transition-colors group">
                                    {/* Configuration Name */}
                                    <td className="p-4 text-slate-900 text-sm font-semibold pl-6 border-l-4 border-transparent group-hover:border-indigo-500 transition-all">
                                        {item.configuration}
                                    </td>

                                    {/* Status Column */}
                                    <td className="p-4 text-sm">
                                        {editingId === item.id ? (
                                            <label className="relative inline-flex items-center cursor-pointer select-none">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only peer"
                                                    checked={editForm?.status ?? false}
                                                    onChange={(e) => setEditForm(prev => prev ? { ...prev, status: e.target.checked } : null)}
                                                />
                                                <div className="w-10 h-5.5 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-indigo-600"></div>
                                                <span className="ml-2 text-xs font-bold text-indigo-600">
                                                    {(editForm?.status ?? false) ? 'Active' : 'Inactive'}
                                                </span>
                                            </label>
                                        ) : (
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold tracking-wide transition-all ${
                                                item.status 
                                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60 shadow-sm shadow-emerald-50" 
                                                    : "bg-rose-50 text-rose-600 border border-rose-100"
                                            }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${item.status ? 'bg-emerald-500 shadow-sm shadow-emerald-400' : 'bg-rose-400'}`}></span>
                                                {item.status ? 'True' : 'False'}
                                            </span>
                                        )}
                                    </td>

                                    {/* Config Value Column */}
                                    <td className="p-4 text-sm">
                                        {editingId === item.id ? (
                                            <input
                                                type="text"
                                                className="border-2 border-indigo-100 px-3 py-1.5 rounded-xl w-full max-w-[140px] text-sm font-semibold text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 font-mono shadow-inner bg-slate-50 transition-all"
                                                value={editForm?.value ?? ''}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    setEditForm(prev => prev ? { ...prev, value: val === '' ? 0 : Number(val) } : null);
                                                }}
                                            />
                                        ) : (
                                            <span className="font-mono bg-indigo-50/50 border border-indigo-100/70 px-2.5 py-1 rounded-lg text-indigo-700 text-xs font-bold">
                                                {item.value}
                                            </span>
                                        )}
                                    </td>

                                    {/* Actions Column */}
                                    <td className="p-4 text-right pr-6">
                                        {editingId === item.id ? (
                                            <div className="flex gap-2 justify-end">
                                                <button
                                                    onClick={handleSave}
                                                    className="flex items-center gap-1.5 bg-indigo-600 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold hover:bg-indigo-700 active:scale-95 transition-all shadow-md shadow-indigo-200"
                                                >
                                                    <Save size={14} /> Save
                                                </button>
                                                <button
                                                    onClick={handleCancel}
                                                    className="flex items-center gap-1.5 bg-white border border-slate-300 text-slate-700 px-3.5 py-1.5 rounded-xl text-xs font-bold hover:bg-slate-50 hover:text-slate-900 active:scale-95 transition-all shadow-sm"
                                                    type="button"
                                                >
                                                    <X size={14} /> Cancel
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => handleEdit(item)}
                                                className="inline-flex items-center gap-1.5 bg-white border border-slate-200 text-slate-700 px-3.5 py-1.5 rounded-xl text-xs font-bold hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 active:scale-95 transition-all shadow-sm group-hover:shadow-indigo-50"
                                                type="button"
                                            >
                                                <PencilIcon size={13} className="text-slate-400 group-hover:text-indigo-500 transition-colors" /> Edit
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="bg-gradient-to-r from-slate-50 to-blue-50/30 px-6 py-3.5 flex items-center justify-between text-xs text-slate-500 font-medium border-t border-slate-200 select-none">
                    <div className="flex items-center gap-1.5">
                        <button className="p-1.5 text-slate-300 cursor-not-allowed rounded-lg hover:bg-slate-100" disabled>
                            <ChevronsLeft size={14} />
                        </button>
                        <button className="p-1.5 text-slate-300 cursor-not-allowed rounded-lg hover:bg-slate-100" disabled>
                            <ChevronLeft size={14} />
                        </button>
                        
                        <span className="bg-gradient-to-br from-indigo-600 to-blue-600 text-white px-3 py-1 rounded-lg font-bold mx-1 shadow-md shadow-indigo-100">1</span>
                        
                        <button className="p-1.5 text-slate-300 cursor-not-allowed rounded-lg hover:bg-slate-100" disabled>
                            <ChevronRight size={14} />
                        </button>
                        <button className="p-1.5 text-slate-300 cursor-not-allowed rounded-lg hover:bg-slate-100" disabled>
                            <ChevronsRight size={14} />
                        </button>
                    </div>
                    <div className="font-semibold text-slate-500">
                        Showing <span className="text-indigo-600 font-bold">1 - {data.length}</span> of <span className="text-slate-800 font-bold">{data.length}</span> configurations
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManageSystemConfiguration;