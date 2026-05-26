import React, { useState } from "react";
import { ChevronDown, ChevronRight, Save, Search, CheckSquare, Square } from "lucide-react";
import { Roles, type PrivilegeItem, type PrivilegeTree, type RoleOption } from "../types/manage-system-privileges/privileges";
import { usePrivileges } from "../api-hooks/manage-system-privileges/usePrivileges";


// Role options with categories for the UI dropdown
const roleOptions: RoleOption[] = [
    { value: Roles.SuperAdmin, label: "Beraten", category: "CW" },
    { value: Roles.Admin, label: "Administrator", category: "CW" },
    { value: Roles.Director, label: "Director", category: "CW" },
    { value: Roles.Supervisor, label: "Supervisor", category: "CW" },
    { value: Roles.IntakeSocialWorker, label: "Intake Social Worker", category: "CW" },
    { value: Roles.CaseInvestigator, label: "Case Investigator", category: "CW" },
    { value: Roles.ICWTSocialWorker, label: "ICWT Social Worker", category: "CW" },
    { value: Roles.ICWTSupervisor, label: "ICWT Supervisor", category: "CW" },
    { value: Roles.Manager, label: "Manager", category: "CW" },
    { value: Roles.FPSupervisor, label: "MMIP Supervisor", category: "FP" },
    { value: Roles.FPSocialWorker, label: "MMIP Social Worker", category: "FP" },
    { value: Roles.FCSocialWorker, label: "Resource Family Social Worker", category: "FC" },
    { value: Roles.FCSupervisor, label: "Resource Family Supervisor", category: "FC" },
    { value: Roles.FCProgramManager, label: "RF Program Manager", category: "FC" },
    { value: Roles.RMHSocialWorker, label: "Clinical Mental Health Social Worker", category: "RMH" },
    { value: Roles.RMHSupervisor, label: "Clinical Mental Health Supervisor", category: "RMH" },
];

// Group roles by category safely
const groupedRoles = roleOptions.reduce((acc, role) => {
    if (!acc[role.category]) {
        acc[role.category] = [];
    }
    acc[role.category].push(role);
    return acc;
}, {} as Record<string, RoleOption[]>);

export const ManageSystemPrivileges: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState<string>("");

    // Custom Hook থেকে প্রয়োজনীয় সব স্টেট এবং হ্যান্ডলার ডিস্ট্রাকচার করা হলো
    const {
        selectedRole,
        loading,
        saving,
        changingRole,
        error,
        successMessage,
        isPrivilegesLoaded,
        privilegeTree,
        expanded,
        checkedItems,
        sectionChecked,
        handleInitialLoad,
        handleRoleChange,
        savePrivileges,
        toggleAccordion,
        handleSectionCheck,
        handleItemCheck,
        handleAssignAll,
        handleUnassignAll,
    } = usePrivileges();

    // টাইপ সেফটি নিশ্চিত করতে এক্সপ্লিসিটলি PrivilegeTree[] রিটার্ন টাইপ ডিফাইন করা হলো
    const filteredSections: PrivilegeTree[] = privilegeTree
        .map((section: PrivilegeTree) => ({
            ...section,
            Items: section.Items?.filter((item: PrivilegeItem) =>
                item.Text.toLowerCase().includes(searchTerm.toLowerCase())
            ) || [],
        }))
        .filter((section: PrivilegeTree) => section.Items.length > 0);

    const totalPermissions = privilegeTree.reduce(
        (sum, section: PrivilegeTree) => sum + (section.Items?.length || 0),
        0
    );
    const selectedPermissionsCount = Object.values(checkedItems).filter(Boolean).length;
    const isAllSelected = totalPermissions > 0 && selectedPermissionsCount === totalPermissions;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            <div className="p-6 md:p-8">
                {/* Header Section */}
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-semibold text-slate-800 tracking-tight">
                        Manage System Privileges
                    </h1>
                    <p className="text-slate-500 mt-1 text-sm">
                        Configure role-based access controls and permissions
                    </p>
                </div>

                {/* Success Message Alert */}
                {successMessage && (
                    <div className="mb-4 rounded-lg bg-green-50 border border-green-200 p-4 shadow-sm">
                        <p className="text-green-600 text-sm font-medium">{successMessage}</p>
                    </div>
                )}

                {/* Error Message Alert */}
                {error && (
                    <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-4 shadow-sm">
                        <p className="text-red-600 text-sm font-medium">{error}</p>
                    </div>
                )}

                {/* Top Role Selection Card */}
                <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <div className="p-5 space-y-5">
                        <div className="flex flex-col sm:flex-row gap-4 items-end">
                            <div className="flex-1 max-w-md w-full">
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Select Role
                                </label>
                                <div className="relative">
                                    <select
                                        value={selectedRole}
                                        onChange={e => handleRoleChange(e.target.value)}
                                        disabled={changingRole}
                                        className="h-11 w-full appearance-none rounded-lg border border-slate-300 bg-white px-4 pr-10 text-base text-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all disabled:opacity-50"
                                    >
                                        {Object.entries(groupedRoles).map(([category, roles]) => (
                                            <optgroup key={category} label={category}>
                                                {roles.map(role => (
                                                    <option key={role.value} value={role.value}>
                                                        {role.label}
                                                    </option>
                                                ))}
                                            </optgroup>
                                        ))}
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                        <ChevronDown size={16} className="text-slate-400" />
                                    </div>
                                </div>
                            </div>
                            
                            <button
                                onClick={isPrivilegesLoaded ? () => handleRoleChange(selectedRole) : handleInitialLoad}
                                disabled={loading || changingRole}
                                className="h-11 px-6 rounded-lg bg-indigo-600 text-white font-medium text-sm shadow-sm hover:bg-indigo-700 transition-all disabled:opacity-50 flex items-center gap-2 justify-center min-w-[140px]"
                            >
                                {(loading || changingRole) ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        {loading ? "Loading..." : "Changing..."}
                                    </>
                                ) : (
                                    isPrivilegesLoaded ? "Change Role" : "Switch to Role"
                                )}
                            </button>
                        </div>

                        {/* Permissions Section - Only visible after a role load */}
                        {isPrivilegesLoaded && (
                            <>
                                {/* Global Assign/Unassign Action Buttons */}
                                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between pt-4 border-t border-slate-100">
                                    <div className="flex gap-6">
                                        <button
                                            type="button"
                                            onClick={handleAssignAll}
                                            className="flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
                                        >
                                            {isAllSelected ? <CheckSquare size={16} /> : <Square size={16} />}
                                            Assign All Privileges
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleUnassignAll}
                                            className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors"
                                        >
                                            {!isAllSelected ? <CheckSquare size={16} /> : <Square size={16} />}
                                            Unassign All Privileges
                                        </button>
                                    </div>
                                </div>

                                {/* Inner Permissions Tree Component Card */}
                                <div className="mt-6 rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                                    {/* Subheader and Permission Search Bar */}
                                    <div className="border-b border-slate-200 bg-slate-50/80 px-6 py-4">
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                            <div>
                                                <h2 className="text-lg font-semibold text-slate-800">Permissions</h2>
                                                <p className="text-sm text-slate-500 mt-0.5">
                                                    {selectedPermissionsCount} of {totalPermissions} permissions assigned
                                                </p>
                                            </div>
                                            <div className="relative">
                                                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                                <input
                                                    type="text"
                                                    placeholder="Search permissions..."
                                                    value={searchTerm}
                                                    onChange={e => setSearchTerm(e.target.value)}
                                                    className="pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-300 w-full sm:w-64 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Accordion List for Parent Modules */}
                                    <div className="divide-y divide-slate-100">
                                        {filteredSections.map((section: PrivilegeTree) => (
                                            <div key={section.Text as string} className="px-6 py-4 hover:bg-slate-50/50 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleAccordion(section.Text as string)}
                                                        className="p-1 rounded-md text-slate-500 hover:bg-slate-100 transition-colors"
                                                    >
                                                        {expanded[section.Text as string] ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                                                    </button>
                                                    <input
                                                        type="checkbox"
                                                        checked={sectionChecked[section.Text as string] || false}
                                                        onChange={e => handleSectionCheck(section.Text as string, e.target.checked)}
                                                        className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                                    />
                                                    <span className="text-base font-medium text-slate-800">{section.Text as string}</span>
                                                    <span className="text-xs text-slate-400 ml-auto">{section.Items?.length || 0} items</span>
                                                </div>

                                                {/* Child Privileges Grid Layout */}
                                                {expanded[section.Text as string] && section.Items && (
                                                    <div className="ml-10 mt-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                                        {section.Items.map((item: PrivilegeItem) => (
                                                            <label
                                                                key={(item.Id || item.Text) as string}
                                                                className="flex items-center gap-3 py-1.5 px-1 rounded-md hover:bg-slate-50 cursor-pointer transition-colors"
                                                            >
                                                                <input
                                                                    type="checkbox"
                                                                    checked={checkedItems[item.Text as string] || false}
                                                                    onChange={e => handleItemCheck(section.Text as string, item.Text as string, e.target.checked)}
                                                                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                                                />
                                                                <span className="text-sm text-slate-600">{item.Text as string}</span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))}

                                        {/* Fallback Screen for Empty Search Result */}
                                        {filteredSections.length === 0 && !loading && (
                                            <div className="px-6 py-12 text-center text-slate-500">
                                                No permissions match your search.
                                            </div>
                                        )}
                                    </div>

                                    {/* Action Footer for Saving Configuration Changes */}
                                    <div className="border-t border-slate-200 bg-slate-50/80 px-6 py-4 flex justify-end">
                                        <button
                                            type="button"
                                            onClick={savePrivileges}
                                            disabled={saving}
                                            className="h-10 px-6 rounded-lg bg-indigo-600 text-white text-sm font-medium shadow-sm hover:bg-indigo-700 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {saving ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                    Saving...
                                                </>
                                            ) : (
                                                <>
                                                    <Save size={16} />
                                                    Save Changes
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};