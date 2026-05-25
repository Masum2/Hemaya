import React, { useState, useEffect } from 'react';
import { X, Check, Plus, ChevronDown, User, Loader2 } from 'lucide-react';
import { useUserGetRestrictionListHooks } from '../api-hooks/user-restriction/useUserGetRestrictionListHooks';
import { useAppUserListHooks } from '../api-hooks/user-restriction/useAppUserListHooks';
import { useCaseListHooks } from '../api-hooks/user-restriction/useCaseListHooks';
import { useAddNewUserRestrictionHook } from '../api-hooks/user-restriction/useAddNewUserRestrictionHook';
import { useEditUserRestrictionHook } from '../api-hooks/user-restriction/useEditUserRestrictionHook';
import { useGetEditUserRestrictionHook } from '../api-hooks/user-restriction/useGetEditUserRestrictionHook';
import type { UserRestrictionData } from '../types/user-restriction/userRestrictionTypes';


export const ManageUserRestriction: React.FC = () => {
    const { data: apiResponse, isLoading: isTableLoading, isError: isTableError } = useUserGetRestrictionListHooks();
    const { data: appUsers, isLoading: isUsersLoading } = useAppUserListHooks();
    const { data: caseList, isLoading: isCasesLoading } = useCaseListHooks();
    
    const { mutate: addNewRestrictionApi, isPending: isSaving } = useAddNewUserRestrictionHook();
    const { mutate: editRestrictionApi, isPending: isUpdating } = useEditUserRestrictionHook();
    
    // নির্দিষ্ট আইডির ডেটা লোড করার হুক
    const { mutate: fetchEditDetails, isPending: isFetchDetailsLoading } = useGetEditUserRestrictionHook();

    const [restrictions, setRestrictions] = useState<UserRestrictionData[]>([]);
    const [activeLoadingId, setActiveLoadingId] = useState<number | null>(null); // কোন রো-তে ক্লিক করা হয়েছে তা ট্র্যাকিং

    useEffect(() => {
        if (apiResponse && apiResponse.Data) {
            setRestrictions(apiResponse.Data);
        }
    }, [apiResponse]);

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isAddUserDropdownOpen, setIsAddUserDropdownOpen] = useState(false);
    const [isEditUserDropdownOpen, setIsEditUserDropdownOpen] = useState(false);

    // Add New State
    const [newRestriction, setNewRestriction] = useState({
        userId: 0,
        userName: '',
        caseId: 0,
        caseDesc: '',
        statusDesc: 'OFF' as 'ON' | 'OFF'
    });

    // Edit State
    const [editRestriction, setEditRestriction] = useState({
        id: 0,
        userId: 0,
        userName: '',
        caseId: 0,
        caseDesc: '',
        statusDesc: 'OFF' as 'ON' | 'OFF',
        createdBy: '',
        createdOn: ''
    });

    const openAddModal = () => {
        setNewRestriction({ userId: 0, userName: '', caseId: 0, caseDesc: '', statusDesc: 'OFF' });
        setIsAddUserDropdownOpen(false);
        setIsAddModalOpen(true);
    };

    const handleAddNew = () => {
        if (newRestriction.userId && newRestriction.caseId) {
            const payload = {
                id: 0,
                caseId: newRestriction.caseId,
                restrictStatus: newRestriction.statusDesc === 'ON',
                createdBy: "System User",
                createdOn: new Date().toISOString(),
                recordedBy: "System User",
                recordedOn: new Date().toISOString(),
                selectedUserIds: [newRestriction.userId]
            };

            addNewRestrictionApi(payload, {
                onSuccess: () => setIsAddModalOpen(false),
                onError: (error) => alert(`Failed to save: ${error.message}`)
            });
        } else {
            alert("Please select both a User and a Case!");
        }
    };

    // এডিট বাটনে ক্লিক করলে প্রথমে API দিয়ে ডেটা আনা হবে
    const openEditModal = (item: UserRestrictionData) => {
        setActiveLoadingId(item.Id); // স্পিনার দেখানোর জন্য আইডি সেট করা হলো

        fetchEditDetails(item.Id, {
            onSuccess: (apiDetails) => {
                // এপিআই থেকে পাওয়া আইডি দিয়ে টেক্সট ম্যাচ করানো হচ্ছে ড্রপডাউনে দেখানোর জন্য
                const matchedUser = appUsers?.find(u => Number(u.value) === apiDetails.appUserId);
                const matchedCase = caseList?.find(c => c.caseId === apiDetails.caseId);

                setEditRestriction({
                    id: apiDetails.id,
                    userId: apiDetails.appUserId,
                    userName: matchedUser ? matchedUser.text : item.UserName, // নাম না পেলে টেবিলের নাম ব্যাকআপ
                    caseId: apiDetails.caseId,
                    caseDesc: matchedCase ? matchedCase.text : item.CaseDesc,
                    statusDesc: apiDetails.restrictStatus ? 'ON' : 'OFF',
                    createdBy: apiDetails.createdBy,
                    createdOn: apiDetails.createdOn
                });

                setIsEditUserDropdownOpen(false);
                setIsEditModalOpen(true);
                setActiveLoadingId(null);
            },
            onError: (error) => {
                alert(`Failed to fetch details from server: ${error.message}`);
                setActiveLoadingId(null);
            }
        });
    };

    const handleUpdate = () => {
        if (editRestriction.userId && editRestriction.caseId) {
            const payload = {
                id: editRestriction.id, // অরিজিনাল আইডি পাস হচ্ছে, তাই নতুন রো তৈরি হবে না
                caseId: editRestriction.caseId,
                restrictStatus: editRestriction.statusDesc === 'ON',
                createdBy: editRestriction.createdBy || "Admin",
                createdOn: editRestriction.createdOn || new Date().toISOString(),
                recordedBy: "System User",
                recordedOn: new Date().toISOString(),
                selectedUserIds: [editRestriction.userId]
            };

            editRestrictionApi(payload, {
                onSuccess: () => {
                    setIsEditModalOpen(false);
                },
                onError: (error) => {
                    alert(`Failed to update: ${error.message}`);
                }
            });
        } else {
            alert("Please ensure both User and Case are properly selected!");
        }
    };

    return (
        <div className="p-8 bg-gray-50 min-h-screen font-sans">
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
                            {isTableLoading ? (
                                <tr>
                                    <td colSpan={4} className="p-8 text-center text-gray-500">
                                        <div className="flex items-center justify-center gap-2">
                                            <Loader2 className="animate-spin text-green-600" size={20} />
                                            <span>Loading data from server...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : isTableError ? (
                                <tr>
                                    <td colSpan={4} className="p-8 text-center text-red-500">Failed to load table data.</td>
                                </tr>
                            ) : (
                                restrictions.map((item) => (
                                    <tr key={item.Id} className="border-b border-gray-200 bg-white/60 hover:bg-white transition-colors">
                                        <td className="p-4 text-gray-700">{item.UserName}</td>
                                        <td className="p-4 text-gray-700">{item.CaseDesc}</td>
                                        <td className={`p-4 font-bold text-sm ${item.StatusDesc === 'ON' ? 'text-green-700' : 'text-red-600'}`}>
                                            {item.StatusDesc}
                                        </td>
                                        <td className="p-4 text-center">
                                            <button
                                                onClick={() => openEditModal(item)}
                                                disabled={isFetchDetailsLoading}
                                                className="bg-[#a2d9a2] text-gray-700 px-6 py-1 rounded text-sm border border-gray-300/50 hover:bg-[#8ec98e] flex items-center justify-center gap-1 min-w-[75px] mx-auto disabled:bg-gray-200"
                                            >
                                                {isFetchDetailsLoading && activeLoadingId === item.Id ? (
                                                    <Loader2 className="animate-spin text-gray-500" size={14} />
                                                ) : "Edit"}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ADD MODAL */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 ">
                    <div className="bg-white w-full max-w-lg rounded-lg shadow-2xl overflow-visible animate-in zoom-in duration-200">
                        <div className="bg-[#5cb85c] text-white p-4 flex justify-between items-center font-semibold">
                            <span>Add New Restriction</span>
                            <button onClick={() => setIsAddModalOpen(false)}><X size={20} /></button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* USER DROPDOWN */}
                            <div className="relative">
                                <label className="block text-sm font-bold text-gray-700 mb-1.5 italic underline">Select User Name</label>
                                <button
                                    onClick={() => setIsAddUserDropdownOpen(!isAddUserDropdownOpen)}
                                    className="w-full flex items-center justify-between p-2.5 border border-gray-300 rounded-md bg-white hover:border-green-500 transition-all text-sm"
                                    disabled={isUsersLoading}
                                >
                                    <span className="flex items-center gap-2">
                                        <User size={16} className="text-gray-400" />
                                        {isUsersLoading ? "Loading users..." : (newRestriction.userName || "Please select user name...")}
                                    </span>
                                    <ChevronDown size={18} className={`transition-transform ${isAddUserDropdownOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {isAddUserDropdownOpen && (
                                    <div className="absolute top-full left-0 w-full bg-white border border-gray-200 mt-1 rounded-md shadow-xl z-[60] max-h-48 overflow-y-auto py-1">
                                        {Array.isArray(appUsers) && appUsers.map((user) => (
                                            <div
                                                key={user.value}
                                                onClick={() => { 
                                                    setNewRestriction({ ...newRestriction, userId: Number(user.value), userName: user.text }); 
                                                    setIsAddUserDropdownOpen(false); 
                                                }}
                                                className="flex items-center gap-3 px-4 py-2.5 hover:bg-green-50 cursor-pointer group transition-colors"
                                            >
                                                <div className={`w-5 h-5 border-2 rounded flex items-center justify-center transition-all ${newRestriction.userName === user.text ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}>
                                                    {newRestriction.userName === user.text && <Check size={14} className="text-white" strokeWidth={4} />}
                                                </div>
                                                <span className={`text-sm ${newRestriction.userName === user.text ? 'text-green-700 font-bold' : 'text-gray-600'}`}>{user.text}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* CASE DROPDOWN */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5 italic">Case Name - Case #</label>
                                <select
                                    className="w-full p-2.5 border border-gray-300 rounded-md outline-none text-sm focus:ring-2 focus:ring-green-400"
                                    value={newRestriction.caseId || ""}
                                    onChange={(e) => {
                                        const selectedId = Number(e.target.value);
                                        const selectedCase = caseList?.find(c => c.caseId === selectedId);
                                        setNewRestriction({ ...newRestriction, caseId: selectedId, caseDesc: selectedCase ? selectedCase.text : '' });
                                    }}
                                    disabled={isCasesLoading}
                                >
                                    <option value="">{isCasesLoading ? "Loading cases..." : "-- Select a Case --"}</option>
                                    {caseList && caseList.map(c => (
                                        <option key={c.caseId} value={c.caseId}>{c.text}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex items-center justify-between bg-green-50 p-3 rounded border border-green-100">
                                <span className="text-sm font-bold text-gray-700">Status Restriction:</span>
                                <button
                                    onClick={() => setNewRestriction({ ...newRestriction, statusDesc: newRestriction.statusDesc === 'ON' ? 'OFF' : 'ON' })}
                                    className={`px-6 py-1 rounded text-xs font-black shadow-sm ${newRestriction.statusDesc === 'ON' ? 'bg-[#5cb85c] text-white' : 'bg-red-500 text-white'}`}
                                >
                                    {newRestriction.statusDesc}
                                </button>
                            </div>
                        </div>

                        <div className="p-4 bg-gray-100 flex justify-end gap-3 border-t">
                            <button onClick={() => setIsAddModalOpen(false)} className="px-5 py-2 text-sm text-gray-600 hover:underline" disabled={isSaving}>Cancel</button>
                            <button onClick={handleAddNew} className="px-8 py-2 text-sm bg-[#5cb85c] text-white rounded font-bold shadow-md flex items-center gap-1 disabled:bg-gray-400" disabled={isSaving}>
                                {isSaving && <Loader2 className="animate-spin" size={14} />}
                                {isSaving ? "Saving..." : "Save"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* EDIT MODAL */}
            {isEditModalOpen && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 ">
                    <div className="bg-white w-full max-w-lg rounded-lg shadow-2xl overflow-visible animate-in zoom-in duration-200">
                        <div className="bg-[#3b89b8] text-white p-4 flex justify-between items-center font-semibold">
                            <span>Edit Restriction Details</span>
                            <button onClick={() => setIsEditModalOpen(false)}><X size={20} /></button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* USER DROPDOWN EDIT */}
                            <div className="relative">
                                <label className="block text-sm font-bold text-gray-700 mb-1.5 italic underline">Select User Name</label>
                                <button
                                    onClick={() => setIsEditUserDropdownOpen(!isEditUserDropdownOpen)}
                                    className="w-full flex items-center justify-between p-2.5 border border-gray-300 rounded-md bg-white hover:border-blue-500 transition-all text-sm"
                                    disabled={isUsersLoading}
                                >
                                    <span className="flex items-center gap-2">
                                        <User size={16} className="text-gray-400" />
                                        {isUsersLoading ? "Loading users..." : (editRestriction.userName || "Please select user name...")}
                                    </span>
                                    <ChevronDown size={18} className={`transition-transform ${isEditUserDropdownOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {isEditUserDropdownOpen && (
                                    <div className="absolute top-full left-0 w-full bg-white border border-gray-200 mt-1 rounded-md shadow-xl z-[60] max-h-48 overflow-y-auto py-1">
                                        {Array.isArray(appUsers) && appUsers.map((user) => (
                                            <div
                                                key={user.value}
                                                onClick={() => { 
                                                    setEditRestriction({ ...editRestriction, userId: Number(user.value), userName: user.text }); 
                                                    setIsEditUserDropdownOpen(false); 
                                                }}
                                                className="flex items-center gap-3 px-4 py-2.5 hover:bg-blue-50 cursor-pointer group transition-colors"
                                            >
                                                <div className={`w-5 h-5 border-2 rounded flex items-center justify-center transition-all ${editRestriction.userId === Number(user.value) ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}`}>
                                                    {editRestriction.userId === Number(user.value) && <Check size={14} className="text-white" strokeWidth={4} />}
                                                </div>
                                                <span className={`text-sm ${editRestriction.userId === Number(user.value) ? 'text-blue-700 font-bold' : 'text-gray-600'}`}>{user.text}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* CASE DROPDOWN EDIT */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5 italic">Case Name - Case #</label>
                                <select
                                    className="w-full p-2.5 border border-gray-300 rounded-md outline-none text-sm focus:ring-2 focus:ring-blue-400"
                                    value={editRestriction.caseId || ""}
                                    onChange={(e) => {
                                        const selectedId = Number(e.target.value);
                                        const selectedCase = caseList?.find(c => c.caseId === selectedId);
                                        setEditRestriction({ ...editRestriction, caseId: selectedId, caseDesc: selectedCase ? selectedCase.text : '' });
                                    }}
                                    disabled={isCasesLoading}
                                >
                                    <option value="">{isCasesLoading ? "Loading cases..." : "-- Select a Case --"}</option>
                                    {caseList && caseList.map(c => (
                                        <option key={c.caseId} value={c.caseId}>{c.text}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex items-center justify-between bg-blue-50 p-3 rounded border border-blue-100">
                                <span className="text-sm font-bold text-gray-700">Status Restriction:</span>
                                <button
                                    onClick={() => setEditRestriction({ ...editRestriction, statusDesc: editRestriction.statusDesc === 'ON' ? 'OFF' : 'ON' })}
                                    className={`px-6 py-1 rounded text-xs font-black shadow-sm ${editRestriction.statusDesc === 'ON' ? 'bg-[#5cb85c] text-white' : 'bg-red-500 text-white'}`}
                                >
                                    {editRestriction.statusDesc}
                                </button>
                            </div>
                        </div>

                        <div className="p-4 bg-gray-100 flex justify-end gap-3 border-t">
                            <button onClick={() => setIsEditModalOpen(false)} className="px-5 py-2 text-sm text-gray-600 hover:underline" disabled={isUpdating}>Close</button>
                            <button onClick={handleUpdate} className="px-8 py-2 text-sm bg-[#3b89b8] text-white rounded font-bold shadow-md flex items-center gap-1 hover:bg-blue-700 disabled:bg-gray-400" disabled={isUpdating}>
                                {isUpdating && <Loader2 className="animate-spin" size={14} />}
                                {isUpdating ? "Updating..." : "Update"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageUserRestriction;