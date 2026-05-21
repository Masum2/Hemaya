/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from 'react';
import { getModuleList } from '../../api/user-modules/GetModuleList';
import type { ApiResponse, GridDataItem } from '../../types/user-modules/userModules.types';


export const useGetModuleList = (userId: string) => {
    const [modules, setModules] = useState<GridDataItem[]>([]);
    const [userInfo, setUserInfo] = useState({
        name: 'Loading...',
        loginId: 'Loading...',
        role: 'Loading...'
    });
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchModules = async () => {
        try {
            setIsLoading(true);
            const resData: ApiResponse = await getModuleList(userId);

            if (resData.Data) {
                setModules(resData.Data.GridData);
                setUserInfo({
                    name: resData.Data.AppUserName,
                    loginId: resData.Data.LoginId,
                    role: resData.Data.AppUserRole
                });
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (userId) {
            fetchModules();
        }
    }, [userId]);

    return {
        modules,
        userInfo,
        isLoading,
        error,
        refetch: fetchModules,
        setModules
    };
};