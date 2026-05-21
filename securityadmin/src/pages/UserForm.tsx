/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, X } from 'lucide-react';
import { useGetUserList } from '../api-hooks/manage-users-hook/useGetUserList';
import { useAddNewUser } from '../api-hooks/manage-users-hook/useAddNewUser';
import { useEditAppUser } from '../api-hooks/manage-users-hook/useEditAppUser';
import { CATEGORY_NAMES, SYSTEM_ROLES } from '../constant/user-manage/systemRoles';

interface FormData {
    firstName: string;
    lastName: string;
    roleId: number;
    email: string;
    phone: string;
    loginId: string;
    password: string;
    isActive: boolean;
}

const UserForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = !!id;

    const { user, loading: loadingUser, error: userError } = useGetUserList(id);
    const { submitNewUser, loading: addingUser } = useAddNewUser();
    const { submitEditUser, loading: editingUser } = useEditAppUser(id);

    const [formData, setFormData] = useState<FormData>({
        firstName: '',
        lastName: '',
        roleId: 2,
        email: '',
        phone: '',
        loginId: '',
        password: '',
        isActive: true
    });

  
    useEffect(() => {
        if (user && isEditMode) {
            const fetchedRoleId = user.AppRoleId ?? user.appRoleId ?? 2;
            const fetchedIsActive = user.isActive !== undefined
                ? user.isActive
                : (user.IsActive !== undefined ? user.IsActive : true);

            
            setFormData({
                firstName: user.FirstName || user.firstName || '',
                lastName: user.LastName || user.lastName || '',
                roleId: Number(fetchedRoleId),
                email: user.Email || user.email || '',
                phone: user.Phone || user.phone || '',
                loginId: user.LoginId || user.loginId || '',
                password: '',
                isActive: fetchedIsActive
            });
        }
    }, [user, isEditMode]); // This is the correct way - effect runs when user or isEditMode changes

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        let result;
        if (isEditMode) {
            result = await submitEditUser(formData);
        } else {
            result = await submitNewUser(formData);
        }

        if (result.success) {
            setTimeout(() => {
                navigate('/users');
            }, 1000);
        }
    };

    const groupedRoles = SYSTEM_ROLES.reduce((acc, current) => {
        if (!acc[current.category]) {
            acc[current.category] = [];
        }
        acc[current.category].push(current);
        return acc;
    }, {} as { [key: string]: typeof SYSTEM_ROLES });

    const isLoading = loadingUser || addingUser || editingUser;
    const displayError = userError;

    return (
        <div className="min-h-full p-4 md:p-8 flex justify-center items-start">
            <div className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">

                <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-4 border-b border-slate-200 dark:border-slate-800">
                    <h2 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white">
                        {isEditMode ? 'Edit User Profile' : 'Create New User'}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Please fill in the details below to {isEditMode ? 'update the' : 'add a new'} user account.
                    </p>
                </div>

                {displayError && (
                    <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-4 border-b border-red-200 dark:border-red-800 text-sm font-medium text-center">
                        {displayError}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="p-6 md:p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">First Name</label>
                            <input
                                type="text"
                                required
                                placeholder="e.g. Hasan"
                                value={formData.firstName}
                                onChange={(e) => setFormData((prev) => ({ ...prev, firstName: e.target.value }))}
                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all dark:text-white text-sm"
                                disabled={isLoading}
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Last Name</label>
                            <input
                                type="text"
                                required
                                placeholder="e.g. Mahmud"
                                value={formData.lastName}
                                onChange={(e) => setFormData((prev) => ({ ...prev, lastName: e.target.value }))}
                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all dark:text-white text-sm"
                                disabled={isLoading}
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">User Role</label>
                            <select
                                value={formData.roleId}
                                onChange={(e) => setFormData((prev) => ({ ...prev, roleId: parseInt(e.target.value, 10) }))}
                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white text-sm"
                                disabled={isLoading}
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

                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Email Address</label>
                            <input
                                type="email"
                                required
                                placeholder="example@mail.com"
                                value={formData.email}
                                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white text-sm"
                                disabled={isLoading}
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Phone Number</label>
                            <input
                                type="text"
                                placeholder="+880 1XXX XXXXXX"
                                value={formData.phone}
                                onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white text-sm"
                                disabled={isLoading}
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                                Login ID {isEditMode && <span className="text-[10px] text-amber-500 lowercase font-normal">(non-editable)</span>}
                            </label>
                            <input
                                type="text"
                                required
                                disabled={isEditMode || isLoading}
                                placeholder="unique_username"
                                value={formData.loginId}
                                onChange={(e) => setFormData((prev) => ({ ...prev, loginId: e.target.value }))}
                                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm ${(isEditMode || isLoading)
                                    ? 'bg-slate-100 dark:bg-slate-800/80 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-700 cursor-not-allowed'
                                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 dark:text-white'
                                    }`}
                            />
                        </div>

                        {!isEditMode && (
                            <div className="flex flex-col gap-1.5 md:col-span-2">
                                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Password</label>
                                <input
                                    type="password"
                                    required={!isEditMode}
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white text-sm"
                                    disabled={isLoading}
                                />
                            </div>
                        )}

                        {isEditMode && (
                            <div className="flex items-center gap-3 md:col-span-2 bg-slate-50 dark:bg-slate-800/30 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 mt-2">
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    checked={formData.isActive}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, isActive: e.target.checked }))}
                                    className="w-4 h-4 text-blue-600 bg-slate-100 border-slate-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-slate-800 dark:bg-slate-700 dark:border-slate-600 cursor-pointer"
                                    disabled={isLoading}
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

                    <div className="flex flex-col sm:flex-row justify-end items-center gap-3 mt-10 pt-6 border-t border-slate-100 dark:border-slate-800">
                        <button
                            type="button"
                            disabled={isLoading}
                            onClick={() => navigate('/users')}
                            className="w-full sm:w-auto flex items-center cursor-pointer justify-center gap-2 px-6 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-semibold text-sm disabled:opacity-50"
                        >
                            <X size={18} /> Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full sm:w-auto cursor-pointer flex items-center justify-center gap-2 px-8 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all font-semibold text-sm disabled:opacity-70"
                        >
                            <Save size={18} /> {isLoading ? 'Saving...' : isEditMode ? 'Update User' : 'Save User'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UserForm;