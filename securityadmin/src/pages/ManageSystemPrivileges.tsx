import React, { useState, useCallback, useEffect } from "react";
import {
    ChevronDown,
    ChevronRight,
    Save,
    RotateCcw,
    X,
    Search,
    CheckSquare,
    Square,
} from "lucide-react";

// API Response Types
interface PrivilegeItem {
    Text: string;
    Id: string;
    Checked: boolean;
    HasChildren: boolean;
    Expanded: boolean;
    Items: PrivilegeItem[];
}

interface PrivilegeTree {
    Text: string;
    Id: string;
    Checked: boolean;
    HasChildren: boolean;
    Expanded: boolean;
    Items: PrivilegeItem[];
}

interface ManageSystemPrivilegesResponse {
    Message: string | null;
    Data: {
        AppRoleId: number;
        SelRoleId: number;
        PrivilegeTree: PrivilegeTree[];
    };
}

// Role Enum from backend (matching your C# enum)
enum Roles {
    None = 0,
    SuperAdmin = 1,
    Admin = 2,
    Director = 3,
    Supervisor = 4,
    IntakeSocialWorker = 5,
    CaseInvestigator = 6,
    ICWTSocialWorker = 8,
    ICWTSupervisor = 9,
    FPSupervisor = 10,
    FPSocialWorker = 11,
    Manager = 91,
    FCSocialWorker = 21,
    FCSupervisor = 22,
    FCProgramManager = 23,
    RMHSocialWorker = 31,
    RMHSupervisor = 32,
}

// Role options with categories
const roleOptions = [
    { value: Roles.SuperAdmin, label: "Super Admin", category: "CW" },
    { value: Roles.Admin, label: "Admin", category: "CW" },
    { value: Roles.Director, label: "Director", category: "CW" },
    { value: Roles.Supervisor, label: "Supervisor", category: "CW" },
    { value: Roles.IntakeSocialWorker, label: "Intake Social Worker", category: "CW" },
    { value: Roles.CaseInvestigator, label: "Case Investigator", category: "CW" },
    { value: Roles.ICWTSocialWorker, label: "ICWT Social Worker", category: "CW" },
    { value: Roles.ICWTSupervisor, label: "ICWT Supervisor", category: "CW" },
    { value: Roles.Manager, label: "Manager", category: "CW" },
    { value: Roles.FPSupervisor, label: "FP Supervisor", category: "FP" },
    { value: Roles.FPSocialWorker, label: "FP Social Worker", category: "FP" },
    { value: Roles.FCSocialWorker, label: "FC Social Worker", category: "FC" },
    { value: Roles.FCSupervisor, label: "FC Supervisor", category: "FC" },
    { value: Roles.FCProgramManager, label: "FC Program Manager", category: "FC" },
    { value: Roles.RMHSocialWorker, label: "RMH Social Worker", category: "RMH" },
    { value: Roles.RMHSupervisor, label: "RMH Supervisor", category: "RMH" },
];

// Group roles by category
const groupedRoles = roleOptions.reduce((acc, role) => {
    if (!acc[role.category]) {
        acc[role.category] = [];
    }
    acc[role.category].push(role);
    return acc;
}, {} as Record<string, typeof roleOptions>);

export const ManageSystemPrivileges: React.FC = () => {
    const [selectedRole, setSelectedRole] = useState<string>(Roles.Supervisor.toString());
    const [originalRole, setOriginalRole] = useState<string>(Roles.Supervisor.toString());
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [saving, setSaving] = useState<boolean>(false);
    const [changingRole, setChangingRole] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [isPrivilegesLoaded, setIsPrivilegesLoaded] = useState<boolean>(false);

    const [privilegeTree, setPrivilegeTree] = useState<PrivilegeTree[]>([]);
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});
    const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
    const [sectionChecked, setSectionChecked] = useState<Record<string, boolean>>({});

    // Fetch privileges for selected role
    const fetchPrivileges = useCallback(async (roleId: number) => {
        setLoading(true);
        setError(null);
        setSuccessMessage(null);

        try {
            const response = await fetch(
                `/api/SecurityAdmin/GetManageSystemPrivileges?roleId=${roleId}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: ManageSystemPrivilegesResponse = await response.json();

            if (data.Data && data.Data.PrivilegeTree) {
                setPrivilegeTree(data.Data.PrivilegeTree);

                const initialExpanded: Record<string, boolean> = {};
                const initialChecked: Record<string, boolean> = {};
                const initialSectionChecked: Record<string, boolean> = {};

                data.Data.PrivilegeTree.forEach(section => {
                    initialExpanded[section.Text] = true;
                    let hasCheckedItem = false;

                    if (section.Items && section.Items.length > 0) {
                        section.Items.forEach(item => {
                            initialChecked[item.Text] = item.Checked;
                            if (item.Checked) hasCheckedItem = true;
                        });
                    }

                    initialSectionChecked[section.Text] = hasCheckedItem;
                });

                setExpanded(initialExpanded);
                setCheckedItems(initialChecked);
                setSectionChecked(initialSectionChecked);
                setIsPrivilegesLoaded(true);
            }
        } catch (err) {
            console.error("Error fetching privileges:", err);
            setError(err instanceof Error ? err.message : "Failed to fetch privileges");
            setIsPrivilegesLoaded(false);
        } finally {
            setLoading(false);
        }
    }, []);

    // Change System Role API
    const changeSystemRole = useCallback(async (roleId: number) => {
        setChangingRole(true);
        setError(null);
        setSuccessMessage(null);

        try {
            const response = await fetch(
                `/api/SecurityAdmin/ChangeSystemRole`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ roleId: roleId }),
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            
            if (result.Message === "Success" || response.ok) {
                setSuccessMessage(`Successfully switched to role ID ${roleId}`);
                setOriginalRole(roleId.toString());
                // Reload privileges after role change
                await fetchPrivileges(roleId);
            } else {
                throw new Error(result.Message || "Failed to change role");
            }
        } catch (err) {
            console.error("Error changing role:", err);
            setError(err instanceof Error ? err.message : "Failed to change system role");
        } finally {
            setChangingRole(false);
        }
    }, [fetchPrivileges]);

    // Initial load - only when "Switch to Role" button is clicked
    const handleInitialLoad = useCallback(async () => {
        if (selectedRole) {
            await fetchPrivileges(parseInt(selectedRole));
            setOriginalRole(selectedRole);
        }
    }, [selectedRole, fetchPrivileges]);

    // Handle role change from dropdown
    const handleRoleChange = useCallback(async (newRoleId: string) => {
        const roleId = parseInt(newRoleId);
        setSelectedRole(newRoleId);
        
        // If privileges are already loaded, call change role API
        if (isPrivilegesLoaded) {
            await changeSystemRole(roleId);
        }
    }, [isPrivilegesLoaded, changeSystemRole]);

    // Save privileges
    const savePrivileges = useCallback(async () => {
        setSaving(true);
        setError(null);
        setSuccessMessage(null);

        // Collect all selected privilege IDs
        const selectedPrivilegeIds: number[] = [];
        
        privilegeTree.forEach(section => {
            if (section.Items && section.Items.length > 0) {
                section.Items.forEach(item => {
                    if (checkedItems[item.Text]) {
                        const privilegeId = parseInt(item.Id);
                        if (!isNaN(privilegeId)) {
                            selectedPrivilegeIds.push(privilegeId);
                        }
                    }
                });
            }
        });

        const payload = {
            selectedRoleId: parseInt(selectedRole),
            selectedPrivileges: selectedPrivilegeIds
        };

        try {
            const response = await fetch(
                `/api/SecurityAdmin/SaveSystemPrivileges`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(payload),
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            
            if (result.Message === "Success" || response.ok) {
                setSuccessMessage(`Privileges saved successfully for role ID ${selectedRole}`);
                setTimeout(() => {
                    fetchPrivileges(parseInt(selectedRole));
                }, 1000);
            } else {
                throw new Error(result.Message || "Failed to save privileges");
            }
        } catch (err) {
            console.error("Error saving privileges:", err);
            setError(err instanceof Error ? err.message : "Failed to save privileges");
        } finally {
            setSaving(false);
        }
    }, [selectedRole, checkedItems, privilegeTree, fetchPrivileges]);

    // Update section checked state when individual items change
    useEffect(() => {
        const updatedSections: Record<string, boolean> = {};

        privilegeTree.forEach(section => {
            if (section.Items && section.Items.length > 0) {
                updatedSections[section.Text] = section.Items.some(
                    item => checkedItems[item.Text]
                );
            } else {
                updatedSections[section.Text] = false;
            }
        });

        setSectionChecked(updatedSections);
    }, [checkedItems, privilegeTree]);

    const toggleAccordion = useCallback((title: string): void => {
        setExpanded(prev => ({
            ...prev,
            [title]: !prev[title],
        }));
    }, []);

    const handleSectionCheck = useCallback(
        (sectionTitle: string, checked: boolean): void => {
            const section = privilegeTree.find(item => item.Text === sectionTitle);
            if (!section || !section.Items) return;

            setCheckedItems(prev => {
                const updated = { ...prev };
                section.Items.forEach(item => {
                    updated[item.Text] = checked;
                });
                return updated;
            });
        },
        [privilegeTree]
    );

    const handleItemCheck = useCallback(
        (sectionTitle: string, itemText: string, checked: boolean): void => {
            setCheckedItems(prev => {
                const updatedCheckedItems = {
                    ...prev,
                    [itemText]: checked,
                };

                const section = privilegeTree.find(s => s.Text === sectionTitle);

                if (section && section.Items) {
                    const anyChecked = section.Items.some(
                        permission => updatedCheckedItems[permission.Text]
                    );

                    setSectionChecked(prevSection => ({
                        ...prevSection,
                        [sectionTitle]: anyChecked,
                    }));
                }

                return updatedCheckedItems;
            });
        },
        [privilegeTree]
    );

    const handleAssignAll = useCallback(() => {
        const updated: Record<string, boolean> = {};
        privilegeTree.forEach(section => {
            if (section.Items) {
                section.Items.forEach(item => {
                    updated[item.Text] = true;
                });
            }
        });
        setCheckedItems(updated);
    }, [privilegeTree]);

    const handleUnassignAll = useCallback(() => {
        const updated: Record<string, boolean> = {};
        privilegeTree.forEach(section => {
            if (section.Items) {
                section.Items.forEach(item => {
                    updated[item.Text] = false;
                });
            }
        });
        setCheckedItems(updated);
    }, [privilegeTree]);

    const handleResetAll = useCallback(() => {
        fetchPrivileges(parseInt(selectedRole));
    }, [selectedRole, fetchPrivileges]);

    // Filter sections based on search term
    const filteredSections = privilegeTree
        .map(section => ({
            ...section,
            Items: section.Items?.filter(item =>
                item.Text.toLowerCase().includes(searchTerm.toLowerCase())
            ) || [],
        }))
        .filter(section => section.Items.length > 0);

    const totalPermissions = privilegeTree.reduce(
        (sum, section) => sum + (section.Items?.length || 0),
        0
    );
    const selectedPermissionsCount = Object.values(checkedItems).filter(Boolean).length;
    const isAllSelected = totalPermissions > 0 && selectedPermissionsCount === totalPermissions;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            <div className="p-6 md:p-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-semibold text-slate-800 tracking-tight">
                        Manage System Privileges
                    </h1>
                    <p className="text-slate-500 mt-1 text-sm">
                        Configure role-based access controls and permissions
                    </p>
                </div>

                {/* Success Message */}
                {successMessage && (
                    <div className="mb-4 rounded-lg bg-green-50 border border-green-200 p-4">
                        <p className="text-green-600 text-sm">{successMessage}</p>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-4">
                        <p className="text-red-600 text-sm">{error}</p>
                    </div>
                )}

                {/* Top Card */}
                <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <div className="p-5 space-y-5">
                        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                            <div className="flex-1 max-w-md">
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
                                    <div className="absolute right-10 top-1/2 -translate-y-1/2 pointer-events-none">
                                        <ChevronDown size={16} className="text-slate-400" />
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={isPrivilegesLoaded ? () => changeSystemRole(parseInt(selectedRole)) : handleInitialLoad}
                                disabled={loading || changingRole}
                                className="h-11 px-6 rounded-lg bg-indigo-600 text-white font-medium text-sm shadow-sm hover:bg-indigo-700 transition-all disabled:opacity-50 flex items-center gap-2"
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

                        {/* Permissions Section - Only show after initial load */}
                        {isPrivilegesLoaded && (
                            <>
                                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between pt-2 border-t border-slate-100">
                                  

                                    <div className="flex gap-6">
                                        <button
                                            onClick={handleAssignAll}
                                            className="flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
                                        >
                                            {isAllSelected ? <CheckSquare size={16} /> : <Square size={16} />}
                                            Assign All Privileges
                                        </button>
                                        <button
                                            onClick={handleUnassignAll}
                                            className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors"
                                        >
                                            {!isAllSelected ? <CheckSquare size={16} /> : <Square size={16} />}
                                            Unassign All Privileges
                                        </button>
                                    </div>
                                </div>

                                {/* Permissions Card */}
                                <div className="mt-6 rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
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

                                    <div className="divide-y divide-slate-100">
                                        {filteredSections.map(section => (
                                            <div key={section.Text} className="px-6 py-4 hover:bg-slate-50/50 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <button
                                                        onClick={() => toggleAccordion(section.Text)}
                                                        className="p-1 rounded-md text-slate-500 hover:bg-slate-100 transition-colors"
                                                    >
                                                        {expanded[section.Text] ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                                                    </button>
                                                    <input
                                                        type="checkbox"
                                                        checked={sectionChecked[section.Text] || false}
                                                        onChange={e => handleSectionCheck(section.Text, e.target.checked)}
                                                        className="h-4 w-4 rounded border-slate-300 text-indigo-600"
                                                    />
                                                    <span className="text-base font-medium text-slate-800">{section.Text}</span>
                                                    <span className="text-xs text-slate-400 ml-auto">{section.Items.length} items</span>
                                                </div>

                                                {expanded[section.Text] && (
                                                    <div className="ml-10 mt-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                                        {section.Items.map(item => (
                                                            <label
                                                                key={item.Id || item.Text}
                                                                className="flex items-center gap-3 py-1.5 px-1 rounded-md hover:bg-slate-50 cursor-pointer transition-colors"
                                                            >
                                                                <input
                                                                    type="checkbox"
                                                                    checked={checkedItems[item.Text] || false}
                                                                    onChange={e => handleItemCheck(section.Text, item.Text, e.target.checked)}
                                                                    className="h-4 w-4 rounded border-slate-300 text-indigo-600"
                                                                />
                                                                <span className="text-sm text-slate-600">{item.Text}</span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))}

                                        {filteredSections.length === 0 && !loading && (
                                            <div className="px-6 py-12 text-center text-slate-500">
                                                No permissions match your search.
                                            </div>
                                        )}
                                    </div>

                                    <div className="border-t border-slate-200 bg-slate-50/80 px-6 py-4 flex justify-end">
                                        <button
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