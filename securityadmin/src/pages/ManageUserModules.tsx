import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useGetModuleList } from '../api-hooks/user-modules-hooks/useGetModuleList';
import { useEditModuleRole } from '../api-hooks/user-modules-hooks/useEditModuleRole';
import { useEditModuleAccess } from '../api-hooks/user-modules-hooks/useEditModuleAccess';
import { useRemoveUserModule } from '../api-hooks/user-modules-hooks/useRemoveUserModule';
import { useSaveModuleRole } from '../api-hooks/user-modules-hooks/useSaveModuleRole';
import type { GridDataItem } from '../types/user-modules/userModules.types';
import { Layers, LayoutGrid, Shield, User, KeyRound, ShieldAlert, CheckCircle2, Loader2, X, ChevronDown } from 'lucide-react';
import { toast } from 'react-toastify';

type ModalType = 'role' | 'access' | null;

const ManageUserModules: React.FC = () => {
    const { id } = useParams();
    const currentUserId = id || '1';
    const navigate = useNavigate();

    // Custom Hooks
    const {
        modules,
        userInfo,
        isLoading,
        error,
        refetch,
    } = useGetModuleList(currentUserId);

    const { fetchRoles, availableRoles, setAvailableRoles, loading: rolesLoading } = useEditModuleRole();
    const { fetchAccessDetails, loading: accessLoading } = useEditModuleAccess();
    const { removeModuleAccess, loading: removeLoading } = useRemoveUserModule();
    const { saveRole, loading: saveLoading } = useSaveModuleRole();

    // Local States
    const [activeModal, setActiveModal] = useState<ModalType>(null);
    const [selectedModule, setSelectedModule] = useState<GridDataItem | null>(null);
    const [isModalLoading, setIsModalLoading] = useState<boolean>(false);
    const [selectedRoleId, setSelectedRoleId] = useState<number | string>('');
    const [hasAccessStatus, setHasAccessStatus] = useState<boolean>(false);

    const isSaving = saveLoading || removeLoading;
    const isModalActionLoading = rolesLoading || accessLoading || isModalLoading;

    // Open Role Modal
    const openRoleModal = async (mod: GridDataItem) => {
        setSelectedModule(mod);
        setActiveModal('role');
        setAvailableRoles([]);
        setIsModalLoading(true);
        setSelectedRoleId(mod.AppRoleId || '');

        try {
            const roles = await fetchRoles(mod.ModuleId);
            if (roles && roles.length > 0) {
                setAvailableRoles(roles);
            }
        } catch (err) {
            console.error("Error fetching roles:", err);
            toast.error("Could not load roles. Please try again.");
        } finally {
            setIsModalLoading(false);
        }
    };

    // Open Access Modal
    const openAccessModal = async (mod: GridDataItem) => {
        setSelectedModule(mod);
        setActiveModal('access');
        setIsModalLoading(true);
        setHasAccessStatus(mod.HasAccess);

        try {
            await fetchAccessDetails(Number(currentUserId), mod.ModuleId, mod.HasAccess);
            setHasAccessStatus(mod.HasAccess);
        } catch (err) {
            console.error("Error fetching access info:", err);
            toast.error("Could not load access details. Please try again.");
        } finally {
            setIsModalLoading(false);
        }
    };

    // Save Changes Handler
    const handleSaveChanges = async () => {
        if (!selectedModule) return;

        try {
            if (activeModal === 'access') {
                if (hasAccessStatus === false) {
                    await removeModuleAccess({
                        AppUserId: Number(currentUserId),
                        ModuleId: selectedModule.ModuleId,
                        AccessType: 2
                    });
                    toast.success('Access removed successfully!');
                } else {
                    closeModal();
                    return;
                }
            } else if (activeModal === 'role') {
                if (!selectedRoleId) {
                    toast.error('Please select a role before saving.');
                    return;
                }

                await saveRole({
                    AppUserId: Number(currentUserId),
                    ModuleId: selectedModule.ModuleId,
                    AppRoleId: Number(selectedRoleId),
                    HasAccess: true
                });
                toast.success('Role updated and access granted successfully!');
            }

            closeModal();
            await refetch();
        } catch (err) {
            console.error("Error saving data:", err);
            toast.error(err instanceof Error ? err.message : 'Something went wrong while saving.');
        }
    };

    const closeModal = () => {
        setActiveModal(null);
        setSelectedModule(null);
        setAvailableRoles([]);
        setSelectedRoleId('');
        setHasAccessStatus(false);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50/50">
                <Loader2 className="h-10 w-10 text-indigo-600 animate-spin mb-4" />
                <p className="text-sm font-medium text-slate-600">Loading modules data...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50/50 p-4">
                <div className="bg-white p-6 rounded-xl border border-red-100 shadow-sm text-center max-w-sm w-full">
                    <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                        <ShieldAlert className="h-6 w-6 text-red-500" />
                    </div>
                    <p className="text-slate-900 font-semibold mb-1">Failed to load data</p>
                    <p className="text-slate-500 text-sm mb-4">{error}</p>
                    <button onClick={() => refetch()} className="w-full text-sm font-medium bg-slate-900 hover:bg-slate-800 text-white py-2 rounded-lg transition-colors">
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50/30 p-4 md:p-8 lg:p-12 font-sans antialiased text-slate-900">
         

            <div className="max-w-6xl mx-auto space-y-6">
                
                {/* Modern Navigation Tabs */}
                <div className="flex bg-slate-100 p-1.5 rounded-xl max-w-md shadow-sm border border-slate-200/50">
                    <button 
                        onClick={() => navigate(`/users/widgets/${id}`)}
                        className="flex-1 flex items-center justify-center gap-2 py-2 px-3 text-sm font-medium text-slate-600 hover:text-slate-900 rounded-lg transition-all"
                    >
                        <Shield size={16} /> Widgets
                    </button>
                    <button
                        onClick={() => navigate(`/users/privileges/${id}`)}
                        className="flex-1 flex items-center justify-center gap-2 py-2 px-3 text-sm font-medium text-slate-600 hover:text-slate-900 rounded-lg transition-all"
                    >
                        <Layers size={16} /> Privileges
                    </button>
                    <button 
                        onClick={() => navigate(`/users/modules/${id}`)}
                        className="flex-1 flex items-center justify-center gap-2 bg-white py-2 px-3 text-sm font-semibold text-indigo-600 rounded-lg shadow-sm border border-slate-200/20 transition-all"
                    >
                        <LayoutGrid size={16} /> Modules
                    </button>
                </div>

                {/* Profile Header Block */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col md:flex-row md:items-center gap-5">
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
                        <User className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-3 gap-x-8 w-full">
                        <div>
                            <span className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-0.5">User Name</span>
                            <span className="text-sm font-semibold text-slate-800">{userInfo?.name || '—'}</span>
                        </div>
                        <div>
                            <span className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-0.5">Login ID</span>
                            <span className="text-sm font-mono font-medium text-slate-700">{userInfo?.loginId || '—'}</span>
                        </div>
                        <div>
                            <span className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-0.5">System Role</span>
                            <span className="text-sm font-medium text-slate-800">{userInfo?.role || '—'}</span>
                        </div>
                    </div>
                </div>

                {/* Table Component */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                        <h3 className="font-semibold text-slate-800">Module Access Control</h3>
                        <span className="text-xs font-medium bg-slate-50 text-slate-500 px-2.5 py-1 rounded-md border border-slate-200/60">
                            Total Modules: {modules.length}
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/70 text-slate-500 text-xs font-bold uppercase tracking-wider border-b border-slate-200/60">
                                    <th className="px-6 py-3.5 font-semibold">Module Name</th>
                                    <th className="px-6 py-3.5 font-semibold text-center w-32">Has Access</th>
                                    <th className="px-6 py-3.5 font-semibold">Assigned Role</th>
                                    <th className="px-6 py-3.5 text-right w-52">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm divide-y divide-slate-100">
                                {modules.map((mod) => (
                                    <tr key={mod.ModuleId} className="hover:bg-slate-50/40 transition-colors group">
                                        <td className="px-6 py-4 font-medium text-slate-800">{mod.ModuleName}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                                                mod.HasAccess 
                                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/50' 
                                                    : 'bg-slate-100 text-slate-600'
                                            }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${mod.HasAccess ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                                                {mod.HasAccess ? 'Yes' : 'No'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 font-normal">
                                            {mod.RoleName ? (
                                                <span className="bg-slate-50 px-2 py-1 rounded border border-slate-200/40 text-xs font-medium text-slate-700">
                                                    {mod.RoleName}
                                                </span>
                                            ) : (
                                                <span className="text-slate-300">—</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {!mod.HasAccess ? (
                                                <button
                                                    onClick={() => openRoleModal(mod)}
                                                    className="inline-flex items-center gap-1.5 text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100/80 px-3 py-1.5 rounded-lg transition whitespace-nowrap"
                                                >
                                                    <CheckCircle2 size={14} /> Grant Access
                                                </button>
                                            ) : mod.IsPrimary ? (
                                                <span className="text-xs font-medium text-amber-600 bg-amber-50 border border-amber-200/40 px-2.5 py-1 rounded-md whitespace-nowrap">
                                                    Primary Module
                                                </span>
                                            ) : (
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => openRoleModal(mod)}
                                                        className="inline-flex items-center justify-center gap-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 shadow-sm hover:bg-slate-50 px-2.5 py-1.5 rounded-md transition whitespace-nowrap"
                                                    >
                                                        <KeyRound size={13} /> Edit Role
                                                    </button>
                                                    <button
                                                        onClick={() => openAccessModal(mod)}
                                                        className="inline-flex items-center justify-center gap-1.5 text-xs font-medium text-rose-600 bg-white border border-rose-200 shadow-sm hover:bg-rose-50/50 px-2.5 py-1.5 rounded-md transition whitespace-nowrap"
                                                    >
                                                        <ShieldAlert size={13} /> Edit Access
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* MODALS */}
                {activeModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 transition-all animate-fade-in">
                        {/* Soft Blur Backdrop */}
                        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={closeModal} />

                        <div className="relative bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-100 overflow-hidden transform transition-all scale-100">
                            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                                <h3 className="font-semibold text-slate-800">
                                    {activeModal === 'role' ? 'Modify Module Role' : 'Manage Access Settings'}
                                </h3>
                                <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-50 transition">
                                    <X size={18} />
                                </button>
                            </div>

                            <div className="p-6 space-y-4">
                                <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/50">
                                    <span className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-0.5">Target Module</span>
                                    <span className="text-sm font-semibold text-slate-800">{selectedModule?.ModuleName}</span>
                                </div>

                                {activeModal === 'role' && (
                                    <div className="space-y-1.5">
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Select Permissions Role</label>
                                        {isModalActionLoading ? (
                                            <div className="flex items-center gap-2 text-sm text-indigo-600 py-2">
                                                <Loader2 className="h-4 w-4 animate-spin" /> Fetching available roles...
                                            </div>
                                        ) : (
                                            <div className="relative">
                                                <select
                                                    className="w-full border border-slate-200 bg-white rounded-xl p-2.5 pr-10 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all appearance-none cursor-pointer shadow-sm text-slate-700 font-medium"
                                                    value={selectedRoleId}
                                                    onChange={(e) => setSelectedRoleId(e.target.value)}
                                                >
                                                    <option value="">-- Choose Role --</option>
                                                    {availableRoles.map((role) => (
                                                        <option key={role.Id} value={role.Id}>
                                                            {role.Description}
                                                        </option>
                                                    ))}
                                                </select>
                                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400 pl-2 border-l border-slate-100 my-2">
                                                    <ChevronDown size={16} />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {activeModal === 'access' && (
                                    <div className="space-y-3">
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Access Configuration</label>
                                        {isModalActionLoading ? (
                                            <div className="flex items-center gap-2 text-sm text-indigo-600 py-2">
                                                <Loader2 className="h-4 w-4 animate-spin" /> Syncing data...
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                                                    hasAccessStatus === true ? 'border-indigo-200 bg-indigo-50/30' : 'border-slate-100 hover:bg-slate-50'
                                                }`}>
                                                    <input
                                                        type="radio"
                                                        id="can_access"
                                                        name="access_control"
                                                        className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-slate-300"
                                                        checked={hasAccessStatus === true}
                                                        onChange={() => setHasAccessStatus(true)}
                                                    />
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-semibold text-slate-800">Maintain Access</span>
                                                        <span className="text-xs text-slate-400">User will continue to have access to this module</span>
                                                    </div>
                                                </label>
                                                
                                                <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                                                    hasAccessStatus === false ? 'border-rose-200 bg-rose-50/30' : 'border-slate-100 hover:bg-slate-50'
                                                }`}>
                                                    <input
                                                        type="radio"
                                                        id="remove_access"
                                                        name="access_control"
                                                        className="w-4 h-4 text-rose-600 focus:ring-rose-500 border-slate-300"
                                                        checked={hasAccessStatus === false}
                                                        onChange={() => setHasAccessStatus(false)}
                                                    />
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-semibold text-rose-700">Revoke / Remove Access</span>
                                                        <span className="text-xs text-slate-400">Completely block user's access from this module</span>
                                                    </div>
                                                </label>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
                                <button
                                    onClick={closeModal}
                                    className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-sm transition"
                                    disabled={isSaving}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveChanges}
                                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition shadow-sm disabled:opacity-50 flex items-center gap-2"
                                    disabled={isModalActionLoading || isSaving}
                                >
                                    {isSaving ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                                        </>
                                    ) : (
                                        'Save Changes'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManageUserModules;