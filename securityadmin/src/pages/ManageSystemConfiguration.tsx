import React, { useState } from 'react';
import { PencilIcon, ChevronLeft, ChevronRight, Play, Save, X } from 'lucide-react';

interface ConfigItem {
    id: number;
    configuration: string;
    status: boolean; // boolean korlam jate checkbox manage kora shohoj hoy
    value: string | number;
}

const initialData: ConfigItem[] = [
    { id: 1, configuration: 'Lock Time For Case Note', status: false, value: 36 },
    { id: 2, configuration: 'Max Intake Decision', status: false, value: 36 },
    { id: 3, configuration: 'Max Case Decision', status: false, value: 0 },
    { id: 4, configuration: 'Open Access to Case', status: false, value: 0 },
    { id: 5, configuration: 'Days Until License Expires', status: false, value: 60 },
    { id: 6, configuration: 'Multi-Factor Authentication', status: false, value: 1 },
    { id: 7, configuration: 'Email Notification', status: false, value: 1 },
    { id: 8, configuration: 'Text Notification', status: false, value: 1 },
    { id: 9, configuration: 'Audit Logging', status: false, value: 1 },
];

export const ManageSystemConfiguration: React.FC = () => {
    const [data, setData] = useState<ConfigItem[]>(initialData);
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
    const handleSave = () => {
        if (editForm) {
            setData(data.map(item => (item.id === editForm.id ? editForm : item)));
            setEditingId(null);
            setEditForm(null);
        }
    };

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
                                <tr key={item.id} className="border-b border-gray-200 bg-white/40 hover:bg-white/60">
                                    <td className="p-4 text-gray-700 text-sm">{item.configuration}</td>

                                    {/* Status Column */}
                                    <td className="p-4 text-gray-700 text-sm">
                                        {editingId === item.id ? (
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 cursor-pointer"
                                                checked={editForm?.status}
                                                onChange={(e) => setEditForm(prev => prev ? { ...prev, status: e.target.checked } : null)}
                                            />
                                        ) : (
                                            item.status.toString()
                                        )}
                                    </td>

                                    {/* Config Value Column */}
                                    <td className="p-4 text-gray-700 text-sm">
                                        {editingId === item.id ? (
                                            <input
                                                type="text"
                                                className="border border-blue-400 px-2 py-1 rounded w-20 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                value={editForm?.value}
                                                onChange={(e) => setEditForm(prev => prev ? { ...prev, value: e.target.value } : null)}
                                            />
                                        ) : (
                                            item.value
                                        )}
                                    </td>

                                    {/* Actions Column */}
                                    <td className="p-2">
                                        {editingId === item.id ? (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={handleSave}
                                                    className="flex items-center gap-1 bg-[#5cb85c] text-white px-3 py-1 rounded text-sm hover:bg-green-600 transition-colors"
                                                >
                                                    <Save size={14} /> Save
                                                </button>
                                                <button
                                                    onClick={handleCancel}
                                                    className="flex items-center gap-1 bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition-colors"
                                                >
                                                    <X size={14} /> Cancel
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => handleEdit(item)}
                                                className="flex items-center gap-2 bg-[#5cb85c] text-white px-4 py-1 rounded text-sm hover:bg-green-600 transition-colors"
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

                {/* Pagination Bar */}
                <div className="bg-[#f5f5f5] p-2 flex items-center justify-between text-xs text-gray-600 border-t border-gray-300">
                    <div className="flex items-center gap-2">
                        <div className="flex gap-1 items-center">
                            <button className="p-1 text-gray-400"><Play className="rotate-180 fill-current" size={10} /></button>
                            <button className="p-1"><ChevronLeft size={16} /></button>
                            <span className="bg-[#2b78c5] text-white px-2.5 py-1 rounded">1</span>
                            <button className="p-1"><ChevronRight size={16} /></button>
                            <button className="p-1 text-gray-400"><Play className="fill-current" size={10} /></button>
                        </div>
                    </div>
                    <div className="pr-4 italic">1 - {data.length} of {data.length} items</div>
                </div>
            </div>
        </div>
    );
};

export default ManageSystemConfiguration;