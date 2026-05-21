import { useState } from 'react';
import { saveModuleRole } from '../../api/user-modules/SaveModuleRole';
import type { SaveModuleRolePayload } from '../../types/user-modules/userModules.types';


export const useSaveModuleRole = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const saveRole = async (payload: SaveModuleRolePayload) => {
        setLoading(true);
        setError(null);
        try {
            const response = await saveModuleRole(payload);
            return { success: true, data: response };
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Failed to save module role';
            setError(errorMsg);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return { saveRole, loading, error };
};