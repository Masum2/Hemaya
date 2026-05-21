import { useState } from 'react';
import { editModuleRole } from '../../api/user-modules/EditModuleRole';
import type { RoleOption } from '../../types/user-modules/userModules.types';


export const useEditModuleRole = () => {
    const [loading, setLoading] = useState(false);
    const [availableRoles, setAvailableRoles] = useState<RoleOption[]>([]);
    const [error, setError] = useState<string | null>(null);

    const fetchRoles = async (moduleId: number) => {
        setLoading(true);
        setError(null);
        try {
            const resData = await editModuleRole({ moduleId });
            if (resData.Data && resData.Data.Roles) {
                setAvailableRoles(resData.Data.Roles);
                return resData.Data.Roles;
            }
            return [];
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Failed to load roles';
            setError(errorMsg);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return { fetchRoles, availableRoles, setAvailableRoles, loading, error };
};