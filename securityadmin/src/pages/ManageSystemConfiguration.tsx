// src/pages/ManageSystemConfiguration.tsx
import React, { useState } from 'react';
import { PencilIcon, ChevronLeft, ChevronRight, Play, Save, X } from 'lucide-react';
import { useSystemConfiguration, type ConfigItem } from '../api-hooks/manage-system-configuration-hooks/useSystemConfiguration';

export const ManageSystemConfiguration: React.FC = () => {
    const { data, loading, error, updateConfiguration } = useSystemConfiguration();
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editForm, setEditForm] = useState<ConfigItem | null>(null);

    // Edit mode start
    const handleEdit = (item: ConfigItem) => {
        setEditingId(item.id);
        // এডিট ফর্ম ইনিশিয়ালাইজ করার সময় কারেন্ট ডেটার অবজেক্ট কপি করে নেওয়া হচ্ছে
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
            // হুকের আপডেট ফাংশনে সরাসরি এডিট ফর্মের কারেন্ট স্টেট পাঠানো হচ্ছে
            const success = await updateConfiguration(editForm);
            if (success) {
                setEditingId(null);
                setEditForm(null);
            }
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64 bg-white min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-2"></div>
                <div className="text-gray-600 font-medium text-sm">Loading system configurations...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 max-w-7xl mx-auto mt-4 bg-red-50 text-red-700 rounded border border-red-200 shadow-sm">
                <strong>Configuration Error:</strong> {error}
            </div>
        );
    }

    return (
        <div className="p-8 bg-white min-h-screen">
            <h1 className="text-3xl text-gray-600 font-light mb-6">System Configuration</h1>

            <div className="border border-gray-300 rounded shadow-sm overflow-hidden">
                <div className="bg-[url('https://www.transparenttextures.com/patterns/graphy.png')] bg-gray-50/20">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/90 border-b border-gray-300">
                                <th className="p-4 font-bold text-gray-800 text-sm">Configuration</th>
                                <th className="p-4 font-bold text-gray-800 text-sm">Status</th>
                                <th className="p-4 font-bold text-gray-800 text-sm">Config Value</th>
                                <th className="p-4 w-48"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((item) => (
                                <tr key={item.id} className="border-b border-gray-200 bg-white/40 hover:bg-white/60 transition-colors">
                                    {/* Configuration Name */}
                                    <td className="p-4 text-gray-700 text-sm font-medium">{item.configuration}</td>

                                    {/* Status Column - এখন সরাসরি true/false দেখাবে */}
                                    <td className="p-4 text-gray-700 text-sm font-mono">
                                        {editingId === item.id ? (
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 cursor-pointer accent-blue-600"
                                                // ফর্মের কারেন্ট স্ট্যাটাস চেকড বা আনচেকড অবস্থায় থাকবে
                                                checked={editForm?.status ?? false}
                                                onChange={(e) => setEditForm(prev => prev ? { ...prev, status: e.target.checked } : null)}
                                            />
                                        ) : (
                                            // আপনার চাওয়া অনুযায়ী সরাসরি true অথবা false টেক্সট রেন্ডার হচ্ছে
                                            <span className={item.status ? "text-green-600 font-semibold" : "text-red-500 font-semibold"}>
                                                {item.status.toString()}
                                            </span>
                                        )}
                                    </td>

                                    {/* Config Value Column - টাইপ টেক্সট দিয়ে কনভার্ট করা হয়েছে যাতে টাইপ করতে প্রবলেম না হয় */}
                                    <td className="p-4 text-gray-700 text-sm">
                                        {editingId === item.id ? (
                                            <input
                                                type="text"
                                                className="border border-blue-400 px-2 py-1 rounded w-24 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                                                value={editForm?.value ?? ''}
                                                // ইনপুট ভ্যালু চেঞ্জ হওয়ার সাথে সাথে স্টেট আপডেট হচ্ছে
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    setEditForm(prev => prev ? { ...prev, value: val === '' ? 0 : Number(val) } : null);
                                                }}
                                            />
                                        ) : (
                                            <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-800">{item.value}</span>
                                        )}
                                    </td>

                                    {/* Actions Column */}
                                    <td className="p-2">
                                        {editingId === item.id ? (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={handleSave}
                                                    className="flex items-center gap-1 bg-[#5cb85c] text-white px-3 py-1 rounded text-sm hover:bg-green-600 transition-colors shadow-sm"
                                                >
                                                    <Save size={14} /> Save
                                                </button>
                                                <button
                                                    onClick={handleCancel}
                                                    className="flex items-center gap-1 bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition-colors shadow-sm"
                                                    type="button"
                                                >
                                                    <X size={14} /> Cancel
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => handleEdit(item)}
                                                className="flex items-center gap-2 bg-[#5cb85c] text-white px-4 py-1 rounded text-sm hover:bg-green-600 transition-colors shadow-sm"
                                                type="button"
                                            >
                                                <PencilIcon size={14} /> Edit
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="bg-[#f5f5f5] p-2 flex items-center justify-between text-xs text-gray-600 border-t border-gray-300 select-none">
                    <div className="flex items-center gap-2">
                        <div className="flex gap-1 items-center">
                            <button className="p-1 text-gray-400 cursor-not-allowed" disabled><Play className="rotate-180 fill-current" size={10} /></button>
                            <button className="p-1 text-gray-400 cursor-not-allowed" disabled><ChevronLeft size={16} /></button>
                            <span className="bg-[#2b78c5] text-white px-2.5 py-1 rounded font-bold">1</span>
                            <button className="p-1 text-gray-400 cursor-not-allowed" disabled><ChevronRight size={16} /></button>
                            <button className="p-1 text-gray-400 cursor-not-allowed" disabled><Play className="fill-current" size={10} /></button>
                        </div>
                    </div>
                    <div className="pr-4 italic">1 - {data.length} of {data.length} items</div>
                </div>
            </div>
        </div>
    );
};

export default ManageSystemConfiguration;