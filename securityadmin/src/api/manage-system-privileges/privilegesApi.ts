import type { ManageSystemPrivilegesResponse, SavePrivilegesPayload } from "../../types/manage-system-privileges/privileges";


export const privilegesApi = {
    // Fetch privilege tree for a specific role
    getPrivileges: async (roleId: number): Promise<ManageSystemPrivilegesResponse> => {
        const response = await fetch(`/api/SecurityAdmin/GetManageSystemPrivileges?roleId=${roleId}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
    },

    // Change system role
    changeRole: async (roleId: number): Promise<{ Message: string }> => {
        const response = await fetch(`/api/SecurityAdmin/ChangeSystemRole`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ roleId }),
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
    },

    // Save privileges configuration
    savePrivileges: async (payload: SavePrivilegesPayload): Promise<{ Message: string }> => {
        const response = await fetch(`/api/SecurityAdmin/SaveSystemPrivileges`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
    },
};