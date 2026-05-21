import { useState } from 'react';
import { removeUserModule } from '../../api/user-modules/RemoveUserModule';
import type { RemoveUserModulePayload } from '../../types/user-modules/userModules.types';


export const useRemoveUserModule = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const removeModuleAccess = async (payload: RemoveUserModulePayload) => {
        setLoading(true);
        setError(null);
        try {
            const response = await removeUserModule(payload);
            return { success: true, data: response };
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Failed to remove module access';
            setError(errorMsg);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return { removeModuleAccess, loading, error };
};