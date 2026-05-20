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

type PermissionSection = {
    title: string;
    items: string[];
};

const permissionsData: PermissionSection[] = [
    {
        title: "Adhoc Reports",
        items: [
            "Case Decision Summary Report",
            "Case Notes By Service Type Report",
            "Case Notes By Social Worker Report",
            "Child Victims Summary Report",
            "Client Support Service",
            "Client Support Service Summary Report",
            "Customized Case Report",
            "CW Disparity & Equity",
            "CW Investigation & Assessment",
            "CW Out Of Home Placement",
            "CW-TCM Billing Report",
            "Intake Referral Trends Report",
            "Intake Referrals Summary Report",
            "Perpetrators Summary Report",
            "Placement Home Details",
            "Placement Trends Report",
            "QIC Report",
            "Referrals Summary Report",
            "Report/Intake Summary",
            "Staff Activities Summary Report",
            "Substance Abuse Summary Report",
            "User Activities Summary Report",
            "Year End Report",
        ],
    },
    {
        title: "AFCARS Related",
        items: ["Add/Edit AFCARS Related", "AFCARS Report"],
    },
    {
        title: "Assign Worker",
        items: ["Assign Social Worker - Add"],
    },
];

const getAllPermissionItems = (): string[] => {
    return permissionsData.flatMap(section => section.items);
};

const getInitialCheckedItems = (): Record<string, boolean> => {
    const initial: Record<string, boolean> = {};
    getAllPermissionItems().forEach(item => {
        initial[item] = true;
    });
    return initial;
};

export const ManageSystemPrivileges: React.FC = () => {
    const [selectedRole, setSelectedRole] = useState<string>("Response Supervisor");
    const [searchTerm, setSearchTerm] = useState<string>("");

    const [expanded, setExpanded] = useState<Record<string, boolean>>(() => {
        const initial: Record<string, boolean> = {};
        permissionsData.forEach(section => {
            initial[section.title] = true;
        });
        return initial;
    });

    const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>(
        getInitialCheckedItems
    );

    const [sectionChecked, setSectionChecked] = useState<Record<string, boolean>>({});

    const isAllSelected = Object.values(checkedItems).every(Boolean);

    // FIX 1: .every() পরিবর্তন করে .some() করা হয়েছে যেন অন্তত একটি আইটেম checked হলেই মেইন সেকশন checked দেখায়
    useEffect(() => {
        const updatedSections: Record<string, boolean> = {};

        permissionsData.forEach(section => {
            updatedSections[section.title] = section.items.some(
                item => checkedItems[item]
            );
        });

        setSectionChecked(updatedSections);
    }, [checkedItems]);

    const toggleAccordion = useCallback((title: string): void => {
        setExpanded(prev => ({
            ...prev,
            [title]: !prev[title],
        }));
    }, []);

    const handleSectionCheck = useCallback(
        (sectionTitle: string, checked: boolean): void => {
            const section = permissionsData.find(item => item.title === sectionTitle);
            if (!section) return;

            setCheckedItems(prev => {
                const updated = { ...prev };
                section.items.forEach(item => {
                    updated[item] = checked;
                });
                return updated;
            });
        },
        []
    );

    // FIX 2: এখানেও .every() এর জায়গায় .some() লজিক ব্যবহার করা হয়েছে
    const handleItemCheck = useCallback(
        (sectionTitle: string, item: string, checked: boolean): void => {
            setCheckedItems(prev => {
                const updatedCheckedItems = {
                    ...prev,
                    [item]: checked,
                };

                const section = permissionsData.find(s => s.title === sectionTitle);

                if (section) {
                    // যেকোনো একটি আইটেমও যদি true হয়, তবে মেইন সেকশন ট্রু হবে
                    const anyChecked = section.items.some(
                        permission => updatedCheckedItems[permission]
                    );

                    setSectionChecked(prevSection => ({
                        ...prevSection,
                        [sectionTitle]: anyChecked,
                    }));
                }

                return updatedCheckedItems;
            });
        },
        []
    );

    const handleAssignAll = useCallback(() => {
        const updated: Record<string, boolean> = {};
        getAllPermissionItems().forEach(item => {
            updated[item] = true;
        });
        setCheckedItems(updated);
    }, []);

    const handleUnassignAll = useCallback(() => {
        const updated: Record<string, boolean> = {};
        getAllPermissionItems().forEach(item => {
            updated[item] = false;
        });
        setCheckedItems(updated);
    }, []);

    const handleResetAll = useCallback(() => {
        setCheckedItems(getInitialCheckedItems());
    }, []);

    const handleSave = useCallback(() => {
        console.log("Saving permissions for role:", selectedRole);
        console.log("Checked items:", checkedItems);
        alert(`Privileges saved for ${selectedRole} role`);
    }, [selectedRole, checkedItems]);

    const filteredSections = permissionsData
        .map(section => ({
            ...section,
            items: section.items.filter(item =>
                item.toLowerCase().includes(searchTerm.toLowerCase())
            ),
        }))
        .filter(section => section.items.length > 0);

    const totalPermissions = getAllPermissionItems().length;
    const selectedPermissionsCount = Object.values(checkedItems).filter(Boolean).length;

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
                                        onChange={e => setSelectedRole(e.target.value)}
                                        className="h-11 w-full appearance-none rounded-lg border border-slate-300 bg-white px-4 pr-10 text-base text-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                                    >
                                        <option value="Response Supervisor">Response Supervisor</option>
                                        <option value="Admin">Admin</option>
                                        <option value="Supervisor">Supervisor</option>
                                        <option value="Social Worker">Social Worker</option>
                                        <option value="Case Manager">Case Manager</option>
                                    </select>
                                    {selectedRole && (
                                        <button
                                            type="button"
                                            onClick={() => setSelectedRole("")}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                        >
                                            <X size={16} />
                                        </button>
                                    )}
                                    <div className="absolute right-10 top-1/2 -translate-y-1/2 pointer-events-none">
                                        <ChevronDown size={16} className="text-slate-400" />
                                    </div>
                                </div>
                            </div>
                            <button className="h-11 px-6 rounded-lg bg-indigo-600 text-white font-medium text-sm shadow-sm hover:bg-indigo-700 transition-all">
                                Switch to Role
                            </button>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between pt-2 border-t border-slate-100">
                            <button
                                onClick={handleResetAll}
                                className="h-10 px-5 rounded-lg bg-amber-600 text-white text-sm font-medium shadow-sm hover:bg-amber-700 transition-all flex items-center gap-2"
                            >
                                <RotateCcw size={14} />
                                Reset All Users Privileges for this Role
                            </button>

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
                            <div key={section.title} className="px-6 py-4 hover:bg-slate-50/50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => toggleAccordion(section.title)}
                                        className="p-1 rounded-md text-slate-500 hover:bg-slate-100 transition-colors"
                                    >
                                        {expanded[section.title] ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                                    </button>
                                    <input
                                        type="checkbox"
                                        checked={sectionChecked[section.title] || false}
                                        onChange={e => handleSectionCheck(section.title, e.target.checked)}
                                        className="h-4 w-4 rounded border-slate-300 text-indigo-600"
                                    />
                                    <span className="text-base font-medium text-slate-800">{section.title}</span>
                                    <span className="text-xs text-slate-400 ml-auto">{section.items.length} items</span>
                                </div>

                                {expanded[section.title] && (
                                    <div className="ml-10 mt-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                        {section.items.map(item => (
                                            <label
                                                key={item}
                                                className="flex items-center gap-3 py-1.5 px-1 rounded-md hover:bg-slate-50 cursor-pointer transition-colors"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={checkedItems[item] || false}
                                                    onChange={e => handleItemCheck(section.title, item, e.target.checked)}
                                                    className="h-4 w-4 rounded border-slate-300 text-indigo-600"
                                                />
                                                <span className="text-sm text-slate-600">{item}</span>
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}

                        {filteredSections.length === 0 && (
                            <div className="px-6 py-12 text-center text-slate-500">
                                No permissions match your search.
                            </div>
                        )}
                    </div>

                    <div className="border-t border-slate-200 bg-slate-50/80 px-6 py-4 flex justify-end">
                        <button
                            onClick={handleSave}
                            className="h-10 px-6 rounded-lg bg-indigo-600 text-white text-sm font-medium shadow-sm hover:bg-indigo-700 transition-all flex items-center gap-2"
                        >
                            <Save size={16} />
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};