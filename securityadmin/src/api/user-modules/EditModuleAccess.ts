import type { EditModuleAccessQuery } from "../../types/user-modules/userModules.types";


export const editModuleAccess = async (params: EditModuleAccessQuery) => {
    const response = await fetch(
        `/api/SecurityAdmin/EditModuleAccess?userId=${params.userId}&moduleId=${params.moduleId}&hasAccess=${params.hasAccess}`
    );
    if (!response.ok) {
        throw new Error('Failed to fetch access details');
    }
    return response.json();
};