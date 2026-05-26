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
    const { mutate: fetchEditDetails, isPending: isFetchDetailsLoading } = useGetEditUserRestrictionHook();

    const [restrictions, setRestrictions] = useState<UserRestrictionData[]>([]);
    const [activeLoadingId, setActiveLoadingId] = useState<number | null>(null);

    useEffect(() => {
        if (apiResponse && apiResponse.Data) {
            setRestrictions(apiResponse.Data);
        }
    }, [apiResponse]);

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isAddUserDropdownOpen, setIsAddUserDropdownOpen] = useState(false);
    const [isEditUserDropdownOpen, setIsEditUserDropdownOpen] = useState(false);

    const [newRestriction, setNewRestriction] = useState({
        userId: 0,
        userName: '',
        caseId: 0,
        caseDesc: '',
        statusDesc: 'OFF' as 'ON' | 'OFF'
    });

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

    const openEditModal = (item: UserRestrictionData) => {
        setActiveLoadingId(item.Id);

        fetchEditDetails(item.Id, {
            onSuccess: (apiDetails) => {
                const matchedUser = appUsers?.find(u => Number(u.value) === apiDetails.appUserId);
                const matchedCase = caseList?.find(c => c.caseId === apiDetails.caseId);

                setEditRestriction({
                    id: apiDetails.id,
                    userId: apiDetails.appUserId,
                    userName: matchedUser ? matchedUser.text : item.UserName,
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
                id: editRestriction.id,
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
        <div className="p-8 bg-slate-50 min-h-screen font-sans antialiased text-slate-800">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-semibold text-slate-900 tracking-tight">Users Restrictions</h1>
                        <p className="text-sm text-slate-500 mt-1">Manage and assign user-specific constraints on application cases.</p>
                    </div>
                    <button
                        onClick={openAddModal}
                        className="self-start sm:self-auto bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 active:bg-emerald-800 flex items-center gap-2 transition-all shadow-sm shadow-emerald-600/10"
                    >
                        <Plus size={16} strokeWidth={2.5} /> Add New Restriction
                    </button>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/70 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                    <th className="p-4 pl-6">User Name</th>
                                    <th className="p-4">Case Name - Case #</th>
                                    <th className="p-4 text-center">Status</th>
                                    <th className="p-4 pr-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                                {isTableLoading ? (
                                    <tr>
                                        <td colSpan={4} className="p-12 text-center text-slate-500">
                                            <div className="flex flex-col items-center justify-center gap-3">
                                                <Loader2 className="animate-spin text-emerald-600" size={24} />
                                                <span className="font-medium text-slate-600">Loading restrictions data...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : isTableError ? (
                                    <tr>
                                        <td colSpan={4} className="p-12 text-center text-rose-500 font-medium">
                                            Failed to load table data. Please try refresh.
                                        </td>
                                    </tr>
                                ) : restrictions.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="p-12 text-center text-slate-400 font-medium">
                                            No restrictions found. Click "Add New" to get started.
                                        </td>
                                    </tr>
                                ) : (
                                    restrictions.map((item) => (
                                        <tr key={item.Id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="p-4 pl-6 font-medium text-slate-900">{item.UserName}</td>
                                            <td className="p-4 text-slate-600">{item.CaseDesc}</td>
                                            <td className="p-4 text-center">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide ${
                                                    item.StatusDesc === 'ON' 
                                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                                                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                                                }`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${item.StatusDesc === 'ON' ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                                                    {item.StatusDesc}
                                                </span>
                                            </td>
                                            <td className="p-4 pr-6 text-right">
                                                <button
                                                    onClick={() => openEditModal(item)}
                                                    disabled={isFetchDetailsLoading}
                                                    className="inline-flex items-center justify-center bg-white text-slate-700 px-4 py-1.5 rounded-md text-xs font-semibold border border-slate-200 hover:bg-slate-50 hover:text-slate-900 active:bg-slate-100 transition-all min-w-[70px] disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                                                >
                                                    {isFetchDetailsLoading && activeLoadingId === item.Id ? (
                                                        <Loader2 className="animate-spin text-slate-400" size={14} />
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
            </div>

            {/* ADD MODAL */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40  flex items-center justify-center z-50 p-4">
                    <div className="bg-white w-full max-w-md rounded-xl shadow-xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
                        <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex justify-between items-center">
                            <h3 className="font-semibold text-slate-900 text-base">Add New Restriction</h3>
                            <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors rounded-lg p-1 hover:bg-slate-100">
                                <X size={18} />
                            </button>
                        </div>

                        <div className="p-6 space-y-5">
                            <div className="relative">
                                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Select User Name</label>
                                <button
                                    onClick={() => setIsAddUserDropdownOpen(!isAddUserDropdownOpen)}
                                    className="w-full flex items-center justify-between p-2.5 border border-slate-200 rounded-lg bg-white hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm shadow-sm"
                                    disabled={isUsersLoading}
                                >
                                    <span className="flex items-center gap-2 text-slate-700">
                                        <User size={16} className="text-slate-400" />
                                        {isUsersLoading ? "Loading users..." : (newRestriction.userName || <span className="text-slate-400">Please select user name...</span>)}
                                    </span>
                                    <ChevronDown size={16} className={`text-slate-400 transition-transform ${isAddUserDropdownOpen ? 'rotate-180 text-slate-600' : ''}`} />
                                </button>

                                {isAddUserDropdownOpen && (
                                    <div className="absolute top-full left-0 w-full bg-white border border-slate-200 mt-1.5 rounded-lg shadow-lg z-[60] max-h-48 overflow-y-auto py-1 animate-in fade-in slide-in-from-top-1 duration-100">
                                        {Array.isArray(appUsers) && appUsers.map((user) => (
                                            <div
                                                key={user.value}
                                                onClick={() => { 
                                                    setNewRestriction({ ...newRestriction, userId: Number(user.value), userName: user.text }); 
                                                    setIsAddUserDropdownOpen(false); 
                                                }}
                                                className="flex items-center gap-3 px-4 py-2 hover:bg-slate-50 cursor-pointer transition-colors"
                                            >
                                                <div className={`w-4 h-4 border rounded flex items-center justify-center transition-all ${newRestriction.userName === user.text ? 'bg-emerald-600 border-emerald-600' : 'border-slate-300'}`}>
                                                    {newRestriction.userName === user.text && <Check size={12} className="text-white" strokeWidth={3} />}
                                                </div>
                                                <span className={`text-sm ${newRestriction.userName === user.text ? 'text-slate-900 font-medium' : 'text-slate-600'}`}>{user.text}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Case Name - Case #</label>
                                <select
                                    className="w-full p-2.5 border border-slate-200 rounded-lg bg-white outline-none text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-700 shadow-sm appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2394a3b8%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:10px_auto] bg-[right_14px_center] bg-no-repeat pr-10"
                                    value={newRestriction.caseId || ""}
                                    onChange={(e) => {
                                        const selectedId = Number(e.target.value);
                                        const selectedCase = caseList?.find(c => c.caseId === selectedId);
                                        setNewRestriction({ ...newRestriction, caseId: selectedId, caseDesc: selectedCase ? selectedCase.text : '' });
                                    }}
                                    disabled={isCasesLoading}
                                >
                                    <option value="">{isCasesLoading ? "Loading cases..." : "Select a Case"}</option>
                                    {caseList && caseList.map(c => (
                                        <option key={c.caseId} value={c.caseId}>{c.text}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-100">
                                <div>
                                    <span className="block text-sm font-medium text-slate-900">Status Restriction</span>
                                    <span className="text-xs text-slate-500">Toggle whether restriction is active.</span>
                                </div>
                                <button
                                    onClick={() => setNewRestriction({ ...newRestriction, statusDesc: newRestriction.statusDesc === 'ON' ? 'OFF' : 'ON' })}
                                    className={`px-4 py-1.5 rounded-lg text-xs font-bold tracking-wider uppercase shadow-sm transition-colors border ${
                                        newRestriction.statusDesc === 'ON' 
                                            ? 'bg-emerald-600 text-white border-emerald-700 hover:bg-emerald-700' 
                                            : 'bg-rose-600 text-white border-rose-700 hover:bg-rose-700'
                                    }`}
                                >
                                    {newRestriction.statusDesc}
                                </button>
                            </div>
                        </div>

                        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                            <button onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors" disabled={isSaving}>Cancel</button>
                            <button onClick={handleAddNew} className="px-5 py-2 text-sm font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-slate-300 flex items-center gap-2 transition-colors shadow-sm" disabled={isSaving}>
                                {isSaving && <Loader2 className="animate-spin" size={14} />}
                                {isSaving ? "Saving..." : "Save Restriction"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* EDIT MODAL */}
            {isEditModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40  flex items-center justify-center z-50 p-4">
                    <div className="bg-white w-full max-w-md rounded-xl shadow-xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
                        <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex justify-between items-center">
                            <h3 className="font-semibold text-slate-900 text-base">Edit Restriction Details</h3>
                            <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors rounded-lg p-1 hover:bg-slate-100">
                                <X size={18} />
                            </button>
                        </div>

                        <div className="p-6 space-y-5">
                            <div className="relative">
                                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Select User Name</label>
                                <button
                                    onClick={() => setIsEditUserDropdownOpen(!isEditUserDropdownOpen)}
                                    className="w-full flex items-center justify-between p-2.5 border border-slate-200 rounded-lg bg-white hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all text-sm shadow-sm"
                                    disabled={isUsersLoading}
                                >
                                    <span className="flex items-center gap-2 text-slate-700">
                                        <User size={16} className="text-slate-400" />
                                        {isUsersLoading ? "Loading users..." : (editRestriction.userName || <span className="text-slate-400">Please select user name...</span>)}
                                    </span>
                                    <ChevronDown size={16} className={`text-slate-400 transition-transform ${isEditUserDropdownOpen ? 'rotate-180 text-slate-600' : ''}`} />
                                </button>

                                {isEditUserDropdownOpen && (
                                    <div className="absolute top-full left-0 w-full bg-white border border-slate-200 mt-1.5 rounded-lg shadow-lg z-[60] max-h-48 overflow-y-auto py-1 animate-in fade-in slide-in-from-top-1 duration-100">
                                        {Array.isArray(appUsers) && appUsers.map((user) => (
                                            <div
                                                key={user.value}
                                                onClick={() => { 
                                                    setEditRestriction({ ...editRestriction, userId: Number(user.value), userName: user.text }); 
                                                    setIsEditUserDropdownOpen(false); 
                                                }}
                                                className="flex items-center gap-3 px-4 py-2 hover:bg-slate-50 cursor-pointer transition-colors"
                                            >
                                                <div className={`w-4 h-4 border rounded flex items-center justify-center transition-all ${editRestriction.userId === Number(user.value) ? 'bg-sky-600 border-sky-600' : 'border-slate-300'}`}>
                                                    {editRestriction.userId === Number(user.value) && <Check size={12} className="text-white" strokeWidth={3} />}
                                                </div>
                                                <span className={`text-sm ${editRestriction.userId === Number(user.value) ? 'text-slate-900 font-medium' : 'text-slate-600'}`}>{user.text}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Case Name - Case #</label>
                                <select
                                    className="w-full p-2.5 border border-slate-200 rounded-lg bg-white outline-none text-sm focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all text-slate-700 shadow-sm appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2394a3b8%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:10px_auto] bg-[right_14px_center] bg-no-repeat pr-10"
                                    value={editRestriction.caseId || ""}
                                    onChange={(e) => {
                                        const selectedId = Number(e.target.value);
                                        const selectedCase = caseList?.find(c => c.caseId === selectedId);
                                        setEditRestriction({ ...editRestriction, caseId: selectedId, caseDesc: selectedCase ? selectedCase.text : '' });
                                    }}
                                    disabled={isCasesLoading}
                                >
                                    <option value="">{isCasesLoading ? "Loading cases..." : "Select a Case"}</option>
                                    {caseList && caseList.map(c => (
                                        <option key={c.caseId} value={c.caseId}>{c.text}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-100">
                                <div>
                                    <span className="block text-sm font-medium text-slate-900">Status Restriction</span>
                                    <span className="text-xs text-slate-500">Toggle whether restriction is active.</span>
                                </div>
                                <button
                                    onClick={() => setEditRestriction({ ...editRestriction, statusDesc: editRestriction.statusDesc === 'ON' ? 'OFF' : 'ON' })}
                                    className={`px-4 py-1.5 rounded-lg text-xs font-bold tracking-wider uppercase shadow-sm transition-colors border ${
                                        editRestriction.statusDesc === 'ON' 
                                            ? 'bg-emerald-600 text-white border-emerald-700 hover:bg-emerald-700' 
                                            : 'bg-rose-600 text-white border-rose-700 hover:bg-rose-700'
                                    }`}
                                >
                                    {editRestriction.statusDesc}
                                </button>
                            </div>
                        </div>

                        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                            <button onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors" disabled={isUpdating}>Close</button>
                            <button onClick={handleUpdate} className="px-5 py-2 text-sm font-semibold bg-sky-600 text-white rounded-lg hover:bg-sky-700 disabled:bg-slate-300 flex items-center gap-2 transition-colors shadow-sm" disabled={isUpdating}>
                                {isUpdating && <Loader2 className="animate-spin" size={14} />}
                                {isUpdating ? "Updating..." : "Update Restriction"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageUserRestriction;