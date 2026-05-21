import type { RemoveUserModulePayload } from "../../types/user-modules/userModules.types";


export const removeUserModule = async (payload: RemoveUserModulePayload) => {
    const response = await fetch('/api/SecurityAdmin/RemoveUserModule', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error('Failed to remove module access');
    return response.json();
};