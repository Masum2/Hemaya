import { useState } from 'react';
import { editModuleAccess } from '../../api/user-modules/EditModuleAccess';

export const useEditModuleAccess = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchAccessDetails = async (userId: number, moduleId: number, hasAccess: boolean) => {
        setLoading(true);
        setError(null);
        try {
            const resData = await editModuleAccess({ userId, moduleId, hasAccess });
            return resData;
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Failed to load access details';
            setError(errorMsg);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return { fetchAccessDetails, loading, error };
};