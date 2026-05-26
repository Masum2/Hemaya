import { useState, useCallback, useEffect } from "react";
import { Roles, type PrivilegeTree } from "../../types/manage-system-privileges/privileges";
import { privilegesApi } from "../../api/manage-system-privileges/privilegesApi";


export const usePrivileges = () => {
    const [selectedRole, setSelectedRole] = useState<string>(Roles.Supervisor.toString());
    const [originalRole, setOriginalRole] = useState<string>(Roles.Supervisor.toString());
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

    const fetchPrivileges = useCallback(async (roleId: number) => {
        setLoading(true);
        setError(null);
        setSuccessMessage(null);
        try {
            const data = await privilegesApi.getPrivileges(roleId);
            if (data.Data && data.Data.PrivilegeTree) {
                setPrivilegeTree(data.Data.PrivilegeTree);

                const initialExpanded: Record<string, boolean> = {};
                const initialChecked: Record<string, boolean> = {};
                const initialSectionChecked: Record<string, boolean> = {};

                data.Data.PrivilegeTree.forEach((section: { Text: string | number; Items: { Text: string | number; Checked: boolean; }[]; }) => {
                    initialExpanded[section.Text] = true;
                    let hasCheckedItem = false;

                    if (section.Items && section.Items.length > 0) {
                        section.Items.forEach((item: { Text: string | number; Checked: boolean; }) => {
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

    const changeSystemRole = useCallback(async (roleId: number) => {
        setChangingRole(true);
        setError(null);
        setSuccessMessage(null);
        try {
            const result = await privilegesApi.changeRole(roleId);
            if (result.Message === "Success" || result) {
                setSuccessMessage(`Successfully switched to role ID ${roleId}`);
                setOriginalRole(roleId.toString());
                await fetchPrivileges(roleId);
            }
        } catch (err) {
            console.error("Error changing role:", err);
            setError(err instanceof Error ? err.message : "Failed to change system role");
        } finally {
            setChangingRole(false);
        }
    }, [fetchPrivileges]);

    const handleInitialLoad = useCallback(async () => {
        if (selectedRole) {
            await fetchPrivileges(parseInt(selectedRole));
            setOriginalRole(selectedRole);
        }
    }, [selectedRole, fetchPrivileges]);

    const handleRoleChange = useCallback(async (newRoleId: string) => {
        const roleId = parseInt(newRoleId);
        setSelectedRole(newRoleId);
        if (isPrivilegesLoaded) {
            await changeSystemRole(roleId);
        }
    }, [isPrivilegesLoaded, changeSystemRole]);

    const savePrivileges = useCallback(async () => {
        setSaving(true);
        setError(null);
        setSuccessMessage(null);

        const selectedPrivilegeIds: number[] = [];
        privilegeTree.forEach(section => {
            if (section.Items && section.Items.length > 0) {
                section.Items.forEach((item: { Text: string | number; Id: string; }) => {
                    if (checkedItems[item.Text]) {
                        const privilegeId = parseInt(item.Id);
                        if (!isNaN(privilegeId)) selectedPrivilegeIds.push(privilegeId);
                    }
                });
            }
        });

        try {
            const result = await privilegesApi.savePrivileges({
                selectedRoleId: parseInt(selectedRole),
                selectedPrivileges: selectedPrivilegeIds,
            });
            if (result.Message === "Success" || result) {
                setSuccessMessage(`Privileges saved successfully for role ID ${selectedRole}`);
                setTimeout(() => {
                    fetchPrivileges(parseInt(selectedRole));
                }, 1000);
            }
        } catch (err) {
            console.error("Error saving privileges:", err);
            setError(err instanceof Error ? err.message : "Failed to save privileges");
        } finally {
            setSaving(false);
        }
    }, [selectedRole, checkedItems, privilegeTree, fetchPrivileges]);

    useEffect(() => {
        const updatedSections: Record<string, boolean> = {};
        privilegeTree.forEach(section => {
            if (section.Items && section.Items.length > 0) {
                updatedSections[section.Text] = section.Items.some((item: { Text: string | number; }) => checkedItems[item.Text]);
            } else {
                updatedSections[section.Text] = false;
            }
        });
        setSectionChecked(updatedSections);
    }, [checkedItems, privilegeTree]);

    const toggleAccordion = useCallback((title: string): void => {
        setExpanded(prev => ({ ...prev, [title]: !prev[title] }));
    }, []);

    const handleSectionCheck = useCallback((sectionTitle: string, checked: boolean): void => {
        const section = privilegeTree.find(item => item.Text === sectionTitle);
        if (!section || !section.Items) return;

        setCheckedItems(prev => {
            const updated = { ...prev };
            section.Items.forEach((item: { Text: string | number; }) => {
                updated[item.Text] = checked;
            });
            return updated;
        });
    }, [privilegeTree]);

    const handleItemCheck = useCallback((sectionTitle: string, itemText: string, checked: boolean): void => {
        setCheckedItems(prev => {
            const updatedCheckedItems = { ...prev, [itemText]: checked };
            const section = privilegeTree.find(s => s.Text === sectionTitle);

            if (section && section.Items) {
                const anyChecked = section.Items.some((permission: { Text: string | number; }) => updatedCheckedItems[permission.Text]);
                setSectionChecked(prevSection => ({ ...prevSection, [sectionTitle]: anyChecked }));
            }
            return updatedCheckedItems;
        });
    }, [privilegeTree]);

    const handleAssignAll = useCallback(() => {
        const updated: Record<string, boolean> = {};
        privilegeTree.forEach(section => {
            if (section.Items) {
                section.Items.forEach((item: { Text: string | number; }) => { updated[item.Text] = true; });
            }
        });
        setCheckedItems(updated);
    }, [privilegeTree]);

    const handleUnassignAll = useCallback(() => {
        const updated: Record<string, boolean> = {};
        privilegeTree.forEach(section => {
            if (section.Items) {
                section.Items.forEach((item: { Text: string | number; }) => { updated[item.Text] = false; });
            }
        });
        setCheckedItems(updated);
    }, [privilegeTree]);

    return {
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
    };
};