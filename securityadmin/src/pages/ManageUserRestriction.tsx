/* STREAMING_CHUNK: Importing dependencies and defining interfaces... */
import React, { useState } from 'react';
import { X, Check, Plus, ChevronDown, User } from 'lucide-react';

interface UserRestriction {
    id: number;
    userName: string;
    caseName: string;
    status: 'ON' | 'OFF';
}

const CASE_LIST = [
    "Case#11_kona -2026-03-R0011",
    "Case#12_kona -2026-03-R0013",
    "Case#15_demo -2026-04-R0099",
    "Case#20_test -2026-05-R0123"
];

const USER_LIST = ["koly test", "admin user", "staff member", "manager"];

export const ManageUserRestriction: React.FC = () => {
    /* STREAMING_CHUNK: Initializing state for list and modals... */
    const [restrictions, setRestrictions] = useState<UserRestriction[]>([
        { id: 1, userName: 'koly test', caseName: 'Case#11_kona -2026-03-R0011', status: 'ON' }
    ]);

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // Custom Dropdown visibility states
    const [isAddUserDropdownOpen, setIsAddUserDropdownOpen] = useState(false);
    const [isEditUserDropdownOpen, setIsEditUserDropdownOpen] = useState(false);

    const [selectedUser, setSelectedUser] = useState<UserRestriction | null>(null);
    const [newRestriction, setNewRestriction] = useState<Omit<UserRestriction, 'id'>>({
        userName: '',
        caseName: '',
        status: 'OFF'
    });

    /* STREAMING_CHUNK: Defining modal handlers... */
    const openAddModal = () => {
        setNewRestriction({ userName: '', caseName: '', status: 'OFF' });
        setIsAddUserDropdownOpen(false);
        setIsAddModalOpen(true);
    };

    const handleAddNew = () => {
        if (newRestriction.userName && newRestriction.caseName) {
            setRestrictions([...restrictions, { id: Date.now(), ...newRestriction }]);
            setIsAddModalOpen(false);
        }
    };

    const openEditModal = (user: UserRestriction) => {
        setSelectedUser({ ...user });
        setIsEditUserDropdownOpen(false);
        setIsEditModalOpen(true);
    };

    const handleUpdate = () => {
        if (selectedUser) {
            setRestrictions(restrictions.map(r => r.id === selectedUser.id ? selectedUser : r));
            setIsEditModalOpen(false);
        }
    };

    return (
        <div className="p-8 bg-gray-50 min-h-screen font-sans">
            {/* STREAMING_CHUNK: Rendering Main Title and Table... */}
            <h1 className="text-4xl text-gray-500 font-light mb-6">Users Restrictions</h1>

            <div className="border border-gray-200 rounded shadow-sm overflow-hidden bg-white">
                <div className="p-4 border-b border-gray-100">
                    <button
                        onClick={openAddModal}
                        className="bg-[#5cb85c] text-white px-4 py-1.5 rounded text-sm hover:bg-green-600 flex items-center gap-2 transition-colors"
                    >
                        <Plus size={16} /> Add New
                    </button>
                </div>

                <div className="bg-[url('https://www.transparenttextures.com/patterns/graphy.png')] bg-gray-50/10">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-[#f2f8fc]">
                            <tr>
                                <th className="p-4 font-bold text-gray-800 border-r border-gray-200">User Name</th>
                                <th className="p-4 font-bold text-gray-800 border-r border-gray-200">Case Name - Case #</th>
                                <th className="p-4 font-bold text-gray-800 border-r border-gray-200">Status</th>
                                <th className="p-4"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {restrictions.map((item) => (
                                <tr key={item.id} className="border-b border-gray-200 bg-white/60 hover:bg-white transition-colors">
                                    <td className="p-4 text-gray-700">{item.userName}</td>
                                    <td className="p-4 text-gray-700">{item.caseName}</td>
                                    <td className={`p-4 font-bold text-sm ${item.status === 'ON' ? 'text-green-700' : 'text-red-600'}`}>
                                        {item.status}
                                    </td>
                                    <td className="p-4 text-center">
                                        <button
                                            onClick={() => openEditModal(item)}
                                            className="bg-[#a2d9a2] text-gray-700 px-6 py-1 rounded text-sm border border-gray-300/50 hover:bg-[#8ec98e]"
                                        >
                                            Edit
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* STREAMING_CHUNK: Rendering Add New Modal with Custom Dropdown... */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 ">
                    <div className="bg-white w-full max-w-lg rounded-lg shadow-2xl overflow-visible animate-in zoom-in duration-200">
                        <div className="bg-[#5cb85c] text-white p-4 flex justify-between items-center font-semibold">
                            <span>Add New Restriction</span>
                            <button onClick={() => setIsAddModalOpen(false)}><X size={20} /></button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* CUSTOM USER DROPDOWN */}
                            <div className="relative">
                                <label className="block text-sm font-bold text-gray-700 mb-1.5 italic underline">Select User Name</label>
                                <button
                                    onClick={() => setIsAddUserDropdownOpen(!isAddUserDropdownOpen)}
                                    className="w-full flex items-center justify-between p-2.5 border border-gray-300 rounded-md bg-white hover:border-green-500 transition-all text-sm"
                                >
                                    <span className="flex items-center gap-2">
                                        <User size={16} className="text-gray-400" />
                                        {newRestriction.userName || "Please select user name..."}
                                    </span>
                                    <ChevronDown size={18} className={`transition-transform ${isAddUserDropdownOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {isAddUserDropdownOpen && (
                                    <div className="absolute top-full left-0 w-full bg-white border border-gray-200 mt-1 rounded-md shadow-xl z-[60] max-h-48 overflow-y-auto py-1">
                                        {USER_LIST.map((user) => (
                                            <div
                                                key={user}
                                                onClick={() => { setNewRestriction({ ...newRestriction, userName: user }); setIsAddUserDropdownOpen(false); }}
                                                className="flex items-center gap-3 px-4 py-2.5 hover:bg-green-50 cursor-pointer group transition-colors"
                                            >
                                                <div className={`w-5 h-5 border-2 rounded flex items-center justify-center transition-all ${newRestriction.userName === user ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}>
                                                    {newRestriction.userName === user && <Check size={14} className="text-white" strokeWidth={4} />}
                                                </div>
                                                <span className={`text-sm ${newRestriction.userName === user ? 'text-green-700 font-bold' : 'text-gray-600'}`}>{user}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5 italic">Case Name - Case #</label>
                                <select
                                    className="w-full p-2.5 border border-gray-300 rounded-md outline-none text-sm focus:ring-2 focus:ring-green-400"
                                    value={newRestriction.caseName}
                                    onChange={(e) => setNewRestriction({ ...newRestriction, caseName: e.target.value })}
                                >
                                    <option value="">-- Select a Case --</option>
                                    {CASE_LIST.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>

                            <div className="flex items-center justify-between bg-green-50 p-3 rounded border border-green-100">
                                <span className="text-sm font-bold text-gray-700">Status Restriction:</span>
                                <button
                                    onClick={() => setNewRestriction({ ...newRestriction, status: newRestriction.status === 'ON' ? 'OFF' : 'ON' })}
                                    className={`px-6 py-1 rounded text-xs font-black shadow-sm ${newRestriction.status === 'ON' ? 'bg-[#5cb85c] text-white' : 'bg-red-500 text-white'}`}
                                >
                                    {newRestriction.status}
                                </button>
                            </div>
                        </div>

                        <div className="p-4 bg-gray-100 flex justify-end gap-3 border-t">
                            <button onClick={() => setIsAddModalOpen(false)} className="px-5 py-2 text-sm text-gray-600 hover:underline">Cancel</button>
                            <button onClick={handleAddNew} className="px-8 py-2 text-sm bg-[#5cb85c] text-white rounded font-bold shadow-md">Save</button>
                        </div>
                    </div>
                </div>
            )}

            {/* STREAMING_CHUNK: Rendering Edit Modal with Custom Dropdown... */}
            {isEditModalOpen && selectedUser && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 ">
                    <div className="bg-white w-full max-w-lg rounded-lg shadow-2xl overflow-visible animate-in zoom-in duration-200">
                        <div className="bg-[#3b89b8] text-white p-4 flex justify-between items-center font-semibold">
                            <span>Edit Restriction Details</span>
                            <button onClick={() => setIsEditModalOpen(false)}><X size={20} /></button>
                        </div>

                        <div className="p-6 space-y-6">
                            <div className="relative">
                                <label className="block text-sm font-bold text-gray-700 mb-1.5 italic underline">Select User Name</label>
                                <button
                                    onClick={() => setIsEditUserDropdownOpen(!isEditUserDropdownOpen)}
                                    className="w-full flex items-center justify-between p-2.5 border border-gray-300 rounded-md bg-white hover:border-blue-500 transition-all text-sm"
                                >
                                    <span className="flex items-center gap-2">
                                        <User size={16} className="text-gray-400" />
                                        {selectedUser.userName || "Please select user name..."}
                                    </span>
                                    <ChevronDown size={18} className={`transition-transform ${isEditUserDropdownOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {isEditUserDropdownOpen && (
                                    <div className="absolute top-full left-0 w-full bg-white border border-gray-200 mt-1 rounded-md shadow-xl z-[60] max-h-48 overflow-y-auto py-1">
                                        {USER_LIST.map((user) => (
                                            <div
                                                key={user}
                                                onClick={() => { setSelectedUser({ ...selectedUser, userName: user }); setIsEditUserDropdownOpen(false); }}
                                                className="flex items-center gap-3 px-4 py-2.5 hover:bg-blue-50 cursor-pointer group transition-colors"
                                            >
                                                <div className={`w-5 h-5 border-2 rounded flex items-center justify-center transition-all ${selectedUser.userName === user ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}`}>
                                                    {selectedUser.userName === user && <Check size={14} className="text-white" strokeWidth={4} />}
                                                </div>
                                                <span className={`text-sm ${selectedUser.userName === user ? 'text-blue-700 font-bold' : 'text-gray-600'}`}>{user}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5 italic">Case Name - Case #</label>
                                <select
                                    className="w-full p-2.5 border border-gray-300 rounded-md outline-none text-sm focus:ring-2 focus:ring-blue-400"
                                    value={selectedUser.caseName}
                                    onChange={(e) => setSelectedUser({ ...selectedUser, caseName: e.target.value })}
                                >
                                    {CASE_LIST.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>

                            <div className="flex items-center justify-between bg-blue-50 p-3 rounded border border-blue-100">
                                <span className="text-sm font-bold text-gray-700">Status Restriction:</span>
                                <button
                                    onClick={() => setSelectedUser({ ...selectedUser, status: selectedUser.status === 'ON' ? 'OFF' : 'ON' })}
                                    className={`px-6 py-1 rounded text-xs font-black shadow-sm ${selectedUser.status === 'ON' ? 'bg-[#5cb85c] text-white' : 'bg-red-500 text-white'}`}
                                >
                                    {selectedUser.status}
                                </button>
                            </div>
                        </div>

                        <div className="p-4 bg-gray-100 flex justify-end gap-3 border-t">
                            <button onClick={() => setIsEditModalOpen(false)} className="px-5 py-2 text-sm text-gray-600 hover:underline">Close</button>
                            <button onClick={handleUpdate} className="px-8 py-2 text-sm bg-[#3b89b8] text-white rounded font-bold shadow-md hover:bg-blue-700">Update</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );


};

export default ManageUserRestriction;