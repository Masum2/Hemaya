import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, X } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

// Dotnet Enum Data Object Structure for grouping roles by category
const SYSTEM_ROLES = [
    { id: 1, name: 'SuperAdmin', category: 'CW', label: 'Super Admin' },
    { id: 2, name: 'Admin', category: 'CW', label: 'Admin' },
    { id: 3, name: 'Director', category: 'CW', label: 'Director' },
    { id: 4, name: 'Supervisor', category: 'CW', label: 'Supervisor (FSP)' },
    { id: 6, name: 'CaseInvestigator', category: 'CW', label: 'Case Investigator (FSP)' },
    { id: 8, name: 'ICWTSocialWorker', category: 'CW', label: 'ICWT Social Worker' },
    { id: 9, name: 'ICWTSupervisor', category: 'CW', label: 'ICWT Supervisor' },
    { id: 91, name: 'Manager', category: 'CW', label: 'Manager' },

    { id: 10, name: 'FPSupervisor', category: 'FP', label: 'FP Supervisor' },
    { id: 11, name: 'FPSocialWorker', category: 'FP', label: 'FP Social Worker' },

    { id: 21, name: 'FCSocialWorker', category: 'FC', label: 'FC Social Worker' },
    { id: 22, name: 'FCSupervisor', category: 'FC', label: 'FC Supervisor' },
    { id: 23, name: 'FCProgramManager', category: 'FC', label: 'FC Program Manager' },

    { id: 31, name: 'RMHSocialWorker', category: 'RMH', label: 'RMH Social Worker' },
    { id: 32, name: 'RMHSupervisor', category: 'RMH', label: 'RMH Supervisor' }
];

// Category mapping for user-friendly display names
const CATEGORY_NAMES: { [key: string]: string } = {
    CW: "Child Welfare (CW)",
    FP: "Family Preservation (FP)",
    FC: "Foster Care (FC)",
    RMH: "Rehab Mental Health (RMH)"
};

const UserForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        roleId: 2, // Default role set to Admin (ID = 2)
        email: '',
        phone: '',
        loginId: '',
        password: '',
        isActive: true // UI চেকবক্স ট্র্যাকিংয়ের জন্য (এটি backend-এর isTeamMember এ ম্যাপ হবে)
    });

    useEffect(() => {
        const fetchUserDataForEdit = async () => {
            if (id) {
                setLoading(true);
                setError(null);
                try {
                    const response = await axios.get('/api/SecurityAdmin/GetUserList', {
                        withCredentials: true,
                        headers: { 'accept': '*/*' }
                    });

                    let userList = [];
                    if (response.data && Array.isArray(response.data.Data)) {
                        userList = response.data.Data;
                    } else if (Array.isArray(response.data)) {
                        userList = response.data;
                    } else if (response.data && Array.isArray(response.data.data)) {
                        userList = response.data.data;
                    }

                    const userToEdit = userList.find((u: any) => u.Id === parseInt(id) || u.id === id || u.Id === id);

                    if (userToEdit) {
                        const fetchedRoleId = userToEdit.AppRoleId || userToEdit.appRoleId || 2;

                        // এখানে ব্যাকএন্ডের isActive অথবা IsActive ফিল্ডটিকে ট্র্যাক করা হচ্ছে
                        const fetchedIsActive = userToEdit.isActive !== undefined
                            ? userToEdit.isActive
                            : (userToEdit.IsActive !== undefined ? userToEdit.IsActive : true);

                        setFormData({
                            firstName: userToEdit.FirstName || userToEdit.firstName || '',
                            lastName: userToEdit.LastName || userToEdit.lastName || '',
                            roleId: parseInt(fetchedRoleId),
                            email: userToEdit.Email || userToEdit.email || '',
                            phone: userToEdit.Phone || userToEdit.phone || '',
                            loginId: userToEdit.LoginId || userToEdit.loginId || '',
                            password: '',
                            isActive: fetchedIsActive // সঠিক স্টেট অ্যাসাইন করা হলো
                        });
                    } else {
                        setError("User data not found.");
                        toast.error("User data not found!");
                    }
                } catch (err: any) {
                    console.error("Error fetching user for edit:", err);
                    setError("Failed to load user data.");
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchUserDataForEdit();
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // সোয়াগার পেলোডের স্ট্রাকচার অনুযায়ী অবজেক্ট তৈরি
        const apiPayload = {
            appUserData: {
                id: id ? parseInt(id) : 0,
                loginId: formData.loginId,
                password: formData.password || "Password123!",
                firstName: formData.firstName,
                lastName: formData.lastName,
                phone: formData.phone || "string",
                email: formData.email,
                isTeamMember: formData.isActive, // ফ্রন্টএন্ডের চেকবক্স ভ্যালু এখানে পাস হচ্ছে
                isTempPassword: !id
            },
            appRoleId: formData.roleId
        };

        try {
            if (id) {
                const response = await axios.put('/api/SecurityAdmin/EditAppUser', apiPayload, {
                    withCredentials: true,
                    headers: {
                        'accept': '*/*',
                        'Content-Type': 'application/json-patch+json'
                    }
                });
                console.log("Update API Response:", response.data);
                toast.success("User profile updated successfully!");
            } else {
                const response = await axios.post('/api/SecurityAdmin/AddNewUser', apiPayload, {
                    withCredentials: true,
                    headers: {
                        'accept': '*/*',
                        'Content-Type': 'application/json-patch+json'
                    }
                });
                console.log("Success API Response:", response.data);
                toast.success("New user created successfully!");
            }

            setTimeout(() => {
                navigate('/users');
            }, 1000);

        } catch (err: any) {
            console.error("Error saving user:", err);

            let serverMessage = id ? "Failed to update user profile." : "Failed to create new user.";
            if (err.response?.data) {
                if (typeof err.response.data === 'string') {
                    serverMessage = err.response.data;
                } else if (err.response.data.errors) {
                    serverMessage = Object.values(err.response.data.errors).flat().join(" | ");
                } else if (err.response.data.message) {
                    serverMessage = err.response.data.message;
                }
            }
            setError(serverMessage);
            toast.error(serverMessage);
        } finally {
            setLoading(false);
        }
    };

    // Grouping roles by category for structured dropdown display
    const groupedRoles = SYSTEM_ROLES.reduce((acc, current) => {
        if (!acc[current.category]) {
            acc[current.category] = [];
        }
        acc[current.category].push(current);
        return acc;
    }, {} as { [key: string]: typeof SYSTEM_ROLES });

    return (
        <div className="min-h-full p-4 md:p-8 flex justify-center items-start">
            <div className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">

                {/* Form Header */}
                <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-4 border-b border-slate-200 dark:border-slate-800">
                    <h2 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white">
                        {id ? 'Edit User Profile' : 'Create New User'}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Please fill in the details below to {id ? 'update the' : 'add a new'} user account.
                    </p>
                </div>

                {/* Error Banner */}
                {error && (
                    <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-4 border-b border-red-200 dark:border-red-800 text-sm font-medium text-center">
                        {error}
                    </div>
                )}

                {/* Form Body */}
                <form onSubmit={handleSubmit} className="p-6 md:p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">

                        {/* First Name */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">First Name</label>
                            <input
                                type="text"
                                required
                                placeholder="e.g. Hasan"
                                value={formData.firstName}
                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all dark:text-white text-sm"
                            />
                        </div>

                        {/* Last Name */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Last Name</label>
                            <input
                                type="text"
                                required
                                placeholder="e.g. Mahmud"
                                value={formData.lastName}
                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all dark:text-white text-sm"
                            />
                        </div>

                        {/* User Role */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">User Role</label>
                            <select
                                value={formData.roleId}
                                onChange={(e) => setFormData({ ...formData, roleId: parseInt(e.target.value) })}
                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white text-sm"
                            >
                                {Object.keys(groupedRoles).map((category) => (
                                    <optgroup key={category} label={CATEGORY_NAMES[category] || category} className="font-bold text-slate-500 bg-slate-100 dark:bg-slate-800">
                                        {groupedRoles[category].map((role) => (
                                            <option key={role.id} value={role.id} className="font-normal text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900">
                                                {role.label}
                                            </option>
                                        ))}
                                    </optgroup>
                                ))}
                            </select>
                        </div>

                        {/* Email */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Email Address</label>
                            <input
                                type="email"
                                required
                                placeholder="example@mail.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white text-sm"
                            />
                        </div>

                        {/* Phone */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Phone Number</label>
                            <input
                                type="text"
                                placeholder="+880 1XXX XXXXXX"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white text-sm"
                            />
                        </div>

                        {/* Login Id */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                                Login ID {id && <span className="text-[10px] text-amber-500 lowercase font-normal">(non-editable)</span>}
                            </label>
                            <input
                                type="text"
                                required
                                disabled={!!id}
                                placeholder="unique_username"
                                value={formData.loginId}
                                onChange={(e) => setFormData({ ...formData, loginId: e.target.value })}
                                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm ${id
                                    ? 'bg-slate-100 dark:bg-slate-800/80 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-700 cursor-not-allowed'
                                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 dark:text-white'
                                    }`}
                            />
                        </div>

                        {/* Password */}
                        {!id && (
                            <div className="flex flex-col gap-1.5 md:col-span-2">
                                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Password</label>
                                <input
                                    type="password"
                                    required={!id}
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white text-sm"
                                />
                            </div>
                        )}

                        {/* Status Checkbox (isTeamMember ম্যাপড) - শুধুমাত্র Edit মোডে দেখাবে */}
                        {id && (
                            <div className="flex items-center gap-3 md:col-span-2 bg-slate-50 dark:bg-slate-800/30 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 mt-2 animate-fadeIn">
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    checked={formData.isActive}
                                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                    className="w-4 h-4 text-blue-600 bg-slate-100 border-slate-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-slate-800 dark:bg-slate-700 dark:border-slate-600 cursor-pointer"
                                />
                                <label htmlFor="isActive" className="flex flex-col cursor-pointer select-none">
                                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                                        Account Status (Active)
                                    </span>
                                    <span className="text-xs text-slate-500 dark:text-slate-400">
                                        {formData.isActive ? 'This user is active and can log into the system.' : 'This user is deactivated and cannot access the system.'}
                                    </span>
                                </label>
                            </div>
                        )}

                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row justify-end items-center gap-3 mt-10 pt-6 border-t border-slate-100 dark:border-slate-800">
                        <button
                            type="button"
                            disabled={loading}
                            onClick={() => navigate('/users')}
                            className="w-full sm:w-auto flex items-center cursor-pointer justify-center gap-2 px-6 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-semibold text-sm disabled:opacity-50"
                        >
                            <X size={18} /> Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full sm:w-auto cursor-pointer flex items-center justify-center gap-2 px-8 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all font-semibold text-sm disabled:opacity-70"
                        >
                            <Save size={18} /> {loading ? 'Saving...' : id ? 'Update User' : 'Save User'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UserForm;