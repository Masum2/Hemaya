import type { SaveModuleRolePayload } from "../../types/user-modules/userModules.types";


export const saveModuleRole = async (payload: SaveModuleRolePayload) => {
    const response = await fetch('/api/SecurityAdmin/SaveModuleRole', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error('Failed to save module role');
    return response.json();
};