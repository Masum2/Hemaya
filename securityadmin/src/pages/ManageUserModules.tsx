import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

// --- API Response Interfaces ---
interface GridDataItem {
    AppUserId: number;
    AppRoleId: number;
    IsPrimary: boolean;
    RoleName: string | null;
    ModuleName: string;
    Id: number;
    ModuleId: number;
    HasAccess: boolean;
}

interface ApiResponse {
    Message: string | null;
    Data: {
        UserId: number;
        GridData: GridDataItem[];
        AppUserName: string;
        LoginId: string;
        AppUserRole: string;
    };
}

interface RoleOption {
    Id: number;
    Description: string;
}

interface EditRoleApiResponse {
    Message: string | null;
    Data: {
        Message: string;
        UserModule: {
            AppUserId: number;
            AppRoleId: number;
            Id: number;
            ModuleId: number;
            HasAccess: boolean;
        };
        ModuleName: string;
        Roles: RoleOption[];
    };
}

interface EditAccessApiResponse {
    Message: string | null;
    Data: {
        RemoveUserModule: {
            AppUserId: number;
            ModuleId: number;
            AccessType: number;
        };
        ModuleName: string;
    };
}

type ModalType = 'role' | 'access' | null;

const ManageUserModules: React.FC = () => {
    const { id } = useParams();
    const currentUserId = id || '1';

    // States
    const [modules, setModules] = useState<GridDataItem[]>([]);
    const [userInfo, setUserInfo] = useState({
        name: 'Loading...',
        loginId: 'Loading...',
        role: 'Loading...'
    });
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const [activeModal, setActiveModal] = useState<ModalType>(null);
    const [selectedModule, setSelectedModule] = useState<GridDataItem | null>(null);

    // মোডাল রোল স্টেট
    const [availableRoles, setAvailableRoles] = useState<RoleOption[]>([]);
    const [isModalLoading, setIsModalLoading] = useState<boolean>(false);
    const [isSaving, setIsSaving] = useState<boolean>(false); // সেভিং লোডার স্টেট
    const [selectedRoleId, setSelectedRoleId] = useState<number | string>('');

    // মোডাল অ্যাক্সেস স্টেট
    const [hasAccessStatus, setHasAccessStatus] = useState<boolean>(false);

    // Initial Data Fetching Function (এটিকে আলাদা করা হয়েছে যাতে সেভ করার পর আবার কল করা যায়)
    const fetchModules = async () => {
        try {
            setIsLoading(true);
            const response = await fetch(`/api/SecurityAdmin/GetModuleList?userId=${currentUserId}`);

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const resData: ApiResponse = await response.json();

            if (resData.Data) {
                setModules(resData.Data.GridData);
                setUserInfo({
                    name: resData.Data.AppUserName,
                    loginId: resData.Data.LoginId,
                    role: resData.Data.AppUserRole
                });
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchModules();
    }, [id]);

    // Grant Access / Edit Role ক্লিক ফাংশন
    const openRoleModal = async (mod: GridDataItem) => {
        setSelectedModule(mod);
        setActiveModal('role');
        setAvailableRoles([]);
        setIsModalLoading(true);
        setSelectedRoleId(mod.AppRoleId || '');

        try {
            const response = await fetch(`/api/SecurityAdmin/EditModuleRole?moduleId=${mod.ModuleId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch roles for this module');
            }
            const resData: EditRoleApiResponse = await response.json();

            if (resData.Data && resData.Data.Roles) {
                setAvailableRoles(resData.Data.Roles);
            }
        } catch (err) {
            console.error("Error fetching roles:", err);
            alert("Could not load roles. Please try again.");
        } finally {
            setIsModalLoading(false);
        }
    };

    // Edit Access ক্লিক ফাংশন
    const openAccessModal = async (mod: GridDataItem) => {
        setSelectedModule(mod);
        setActiveModal('access');
        setIsModalLoading(true);
        setHasAccessStatus(mod.HasAccess);

        try {
            const response = await fetch(
                `/api/SecurityAdmin/EditModuleAccess?userId=${currentUserId}&moduleId=${mod.ModuleId}&hasAccess=${mod.HasAccess}`
            );

            if (!response.ok) {
                throw new Error('Failed to fetch access details');
            }

            const resData: EditAccessApiResponse = await response.json();

            if (resData.Data) {
                setHasAccessStatus(mod.HasAccess);
            }
        } catch (err) {
            console.error("Error fetching access info:", err);
            alert("Could not load access details. Please try again.");
        } finally {
            setIsModalLoading(false);
        }
    };

    // Save Changes বাটনে ক্লিক করলে এই ফাংশনটি এক্সিকিউট হবে

    const handleSaveChanges = async () => {
        if (!selectedModule) return;

        setIsSaving(true);
        try {
            if (activeModal === 'access') {
                // যদি ইউজার 'Remove access' সিলেক্ট করে থাকে
                if (hasAccessStatus === false) {
                    const response = await fetch('/api/SecurityAdmin/RemoveUserModule', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        // এখানে AccessType: 2 পাস করা হলো যা ব্যাকএন্ডের RemoveAccessPermanently নির্দেশ করে
                        body: JSON.stringify({
                            AppUserId: Number(currentUserId),
                            ModuleId: selectedModule.ModuleId,
                            AccessType: 2
                        }),
                    });

                    if (!response.ok) throw new Error('Failed to remove module access');
                    alert('Access removed successfully!');
                } else {
                    // যদি 'Can access?' সিলেক্টেড থাকে এবং ইউজার কোনো পরিবর্তন না করে সেভ দেয়
                    closeModal();
                    return;
                }
            }

            else if (activeModal === 'role') {
                if (!selectedRoleId) {
                    alert('Please select a role before saving.');
                    setIsSaving(false);
                    return;
                }

                // নতুন রোল অ্যাসাইন বা গ্র্যান্ট অ্যাক্সেস করার জন্য
                const response = await fetch('/api/SecurityAdmin/SaveModuleRole', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        AppUserId: Number(currentUserId),
                        ModuleId: selectedModule.ModuleId,
                        AppRoleId: Number(selectedRoleId),
                        HasAccess: true
                    }),
                });

                if (!response.ok) throw new Error('Failed to save module role');
                alert('Role updated and access granted successfully!');
            }

            // সফল হলে মোডাল বন্ধ করে টেবিল রিফ্রেশ করা হবে
            closeModal();
            fetchModules();
        } catch (err) {
            console.error("Error saving data:", err);
            alert(err instanceof Error ? err.message : 'Something went wrong while saving.');
        } finally {
            setIsSaving(false);
        }
    };

    const closeModal = () => {
        setActiveModal(null);
        setSelectedModule(null);
        setAvailableRoles([]);
        setSelectedRoleId('');
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

                {/* --- Header Section --- */}
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-2xl text-gray-800 mb-6">Manage User Modules for:</h2>
                    <div className="flex flex-wrap gap-x-16 gap-y-4 text-[15px] text-gray-700">
                        <p><span className="text-gray-900 font-medium">Name:</span> {userInfo.name}</p>
                        <p><span className="text-gray-900 font-medium">Login ID:</span> {userInfo.loginId}</p>
                        <p><span className="text-gray-900 font-medium">Role:</span> {userInfo.role}</p>
                    </div>
                </div>

                {/* --- Table Section --- */}
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

            {/* --- MODALS --- */}
            {activeModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/70 " onClick={closeModal} />

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

                                            {isModalLoading ? (
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

                                        {isModalLoading ? (
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
                                    disabled={isModalLoading || isSaving}
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