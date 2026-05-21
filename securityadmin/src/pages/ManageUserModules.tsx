import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useGetModuleList } from '../api-hooks/user-modules-hooks/useGetModuleList';
import { useEditModuleRole } from '../api-hooks/user-modules-hooks/useEditModuleRole';
import { useEditModuleAccess } from '../api-hooks/user-modules-hooks/useEditModuleAccess';
import { useRemoveUserModule } from '../api-hooks/user-modules-hooks/useRemoveUserModule';
import { useSaveModuleRole } from '../api-hooks/user-modules-hooks/useSaveModuleRole';
import type { GridDataItem } from '../types/user-modules/userModules.types';


type ModalType = 'role' | 'access' | null;

const ManageUserModules: React.FC = () => {
    const { id } = useParams();
    const currentUserId = id || '1';

    // Custom Hooks
    const {
        modules,
        userInfo,
        isLoading,
        error,
        refetch,
        // setModules
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
            alert("Could not load roles. Please try again.");
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
            alert("Could not load access details. Please try again.");
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
                    alert('Access removed successfully!');
                } else {
                    closeModal();
                    return;
                }
            } else if (activeModal === 'role') {
                if (!selectedRoleId) {
                    alert('Please select a role before saving.');
                    return;
                }

                await saveRole({
                    AppUserId: Number(currentUserId),
                    ModuleId: selectedModule.ModuleId,
                    AppRoleId: Number(selectedRoleId),
                    HasAccess: true
                });
                alert('Role updated and access granted successfully!');
            }

            closeModal();
            await refetch();
        } catch (err) {
            console.error("Error saving data:", err);
            alert(err instanceof Error ? err.message : 'Something went wrong while saving.');
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
            <div className="min-h-screen flex items-center justify-center bg-[#f3f4f6]">
                <p className="text-lg font-medium text-gray-600 animate-pulse">Loading data...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f3f4f6]">
                <div className="bg-white p-6 rounded-lg shadow-md text-center max-w-sm">
                    <p className="text-red-500 font-bold mb-2">Error</p>
                    <p className="text-gray-600 text-sm">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f3f4f6] p-4 md:p-10 font-sans">
            <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">

                {/* Header Section */}
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-2xl text-gray-800 mb-6">Manage User Modules for:</h2>
                    <div className="flex flex-wrap gap-x-16 gap-y-4 text-[15px] text-gray-700">
                        <p><span className="text-gray-900 font-medium">Name:</span> {userInfo.name}</p>
                        <p><span className="text-gray-900 font-medium">Login ID:</span> {userInfo.loginId}</p>
                        <p><span className="text-gray-900 font-medium">Role:</span> {userInfo.role}</p>
                    </div>
                </div>

                {/* Table Section */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#f8fafc] text-gray-700 text-sm font-bold border-y border-gray-200">
                                <th className="px-6 py-4 border-r border-gray-200">Module</th>
                                <th className="px-6 py-4 border-r border-gray-200 text-center">Has Access</th>
                                <th className="px-6 py-4 border-r border-gray-200">Role</th>
                                <th className="px-6 py-4"></th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {modules.map((mod) => (
                                <tr key={mod.ModuleId} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-6 py-4 text-gray-800">{mod.ModuleName}</td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold text-white min-w-[35px] ${mod.HasAccess ? 'bg-[#1a8754]' : 'bg-[#6c757d]'}`}>
                                            {mod.HasAccess ? 'Yes' : 'No'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-700">{mod.RoleName || '—'}</td>
                                    <td className="px-6 py-4 text-right">
                                        {!mod.HasAccess ? (
                                            <button
                                                onClick={() => openRoleModal(mod)}
                                                className="bg-[#198754] hover:bg-[#157347] text-white px-4 py-1.5 rounded-md text-sm font-medium transition"
                                            >
                                                Grant Access
                                            </button>
                                        ) : mod.IsPrimary ? (
                                            <span className="text-gray-600 font-medium pr-2">Primary Module</span>
                                        ) : (
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => openRoleModal(mod)}
                                                    className="bg-[#198754]/80 hover:bg-[#198754] text-white px-3 py-1.5 rounded-md text-sm font-medium transition"
                                                >
                                                    Edit Role
                                                </button>
                                                <button
                                                    onClick={() => openAccessModal(mod)}
                                                    className="bg-[#dc3545] hover:bg-[#bb2d3b] text-white px-3 py-1.5 rounded-md text-sm font-medium transition"
                                                >
                                                    Edit Access
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
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/70" onClick={closeModal} />

                    <div className="relative bg-white w-full max-w-md rounded-lg shadow-2xl">
                        <div className="p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-2 border-b pb-3">
                                {activeModal === 'role' ? 'Edit Role' : 'Edit Access'}
                            </h3>

                            <div className="py-4">
                                {activeModal === 'role' && (
                                    <div className="space-y-4">
                                        <p className="text-sm text-gray-600">Module: <span className="font-semibold text-gray-900">{selectedModule?.ModuleName}</span></p>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Role</label>
                                            {isModalActionLoading ? (
                                                <p className="text-sm text-blue-600 animate-pulse">Loading roles...</p>
                                            ) : (
                                                <select
                                                    className="w-full border border-gray-300 rounded-md p-2 text-sm outline-none focus:ring-1 focus:ring-blue-500"
                                                    value={selectedRoleId}
                                                    onChange={(e) => setSelectedRoleId(e.target.value)}
                                                >
                                                    <option value="">-- Select Role --</option>
                                                    {availableRoles.map((role) => (
                                                        <option key={role.Id} value={role.Id}>
                                                            {role.Description}
                                                        </option>
                                                    ))}
                                                </select>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {activeModal === 'access' && (
                                    <div className="space-y-4">
                                        <p className="text-sm text-gray-600 mb-2">Module: <span className="font-semibold text-gray-900">{selectedModule?.ModuleName}</span></p>
                                        {isModalActionLoading ? (
                                            <p className="text-sm text-blue-600 animate-pulse">Loading status...</p>
                                        ) : (
                                            <>
                                                <div className="flex items-center gap-2 mb-4">
                                                    <input
                                                        type="radio"
                                                        id="can_access"
                                                        name="access_control"
                                                        className="w-4 h-4 cursor-pointer"
                                                        checked={hasAccessStatus === true}
                                                        onChange={() => setHasAccessStatus(true)}
                                                    />
                                                    <label htmlFor="can_access" className="text-sm font-medium text-gray-800 cursor-pointer">Can access?</label>
                                                </div>
                                                <div className="flex items-center gap-2 mb-6">
                                                    <input
                                                        type="radio"
                                                        id="remove_access"
                                                        name="access_control"
                                                        className="w-4 h-4 cursor-pointer"
                                                        checked={hasAccessStatus === false}
                                                        onChange={() => setHasAccessStatus(false)}
                                                    />
                                                    <label htmlFor="remove_access" className="text-sm font-medium text-gray-800 cursor-pointer">Remove access</label>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="mt-4 flex justify-end gap-2 pt-4 border-t border-gray-100">
                                <button
                                    onClick={closeModal}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition"
                                    disabled={isSaving}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveChanges}
                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition shadow-sm disabled:opacity-50 flex items-center gap-1"
                                    disabled={isModalActionLoading || isSaving}
                                >
                                    {isSaving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageUserModules;