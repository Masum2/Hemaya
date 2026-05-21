import type { EditModuleRoleQuery } from "../../types/user-modules/userModules.types";


export const editModuleRole = async (params: EditModuleRoleQuery) => {
    const response = await fetch(`/api/SecurityAdmin/EditModuleRole?moduleId=${params.moduleId}`);
    if (!response.ok) {
        throw new Error('Failed to fetch roles for this module');
    }
    return response.json();
};