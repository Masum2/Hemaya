import { useState, useEffect } from 'react';
import { getUserWidgets } from '../../api/manage-widget/GetUserWidgets';
import { toast } from 'react-toastify';
import type { ApiResponse, ModuleItem, WidgetItem } from '../../types/manage-widget-types/widget.types';

interface ErrorResponse {
    message?: string;
    response?: {
        data?: {
            message?: string;
        };
    };
}

export const useGetUserWidgets = (appUserId: number, selectedModuleId: number | null) => {
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [modules, setModules] = useState<ModuleItem[]>([]);
    const [assignedWidgets, setAssignedWidgets] = useState<WidgetItem[]>([]);
    const [readyWidgets, setReadyWidgets] = useState<WidgetItem[]>([]);
    const [userInfo, setUserInfo] = useState<{
        name: string;
        loginId: string;
        role: string;
    }>({
        name: "",
        loginId: "",
        role: ""
    });

    useEffect(() => {
        const fetchData = async (): Promise<void> => {
            setLoading(true);
            setError(null);

            try {
                const result: ApiResponse = await getUserWidgets(appUserId, selectedModuleId);

                if (result && result.Data) {
                    setUserInfo({
                        name: result.Data.AppUserName || "",
                        loginId: result.Data.LoginId || "",
                        role: result.Data.AppUserRole || ""
                    });

                    setModules(result.Data.UserModules || []);
                    setAssignedWidgets(result.Data.UserWidgets || []);
                    setReadyWidgets(result.Data.ExtWidgets || []);
                }
            } catch (err) {
                const error = err as ErrorResponse;
                const errorMessage = error?.response?.data?.message || error?.message || "Failed to load data";
                setError(errorMessage);
                toast.error(errorMessage);
            } finally {
                setLoading(false);
            }
        };

        if (appUserId) {
            fetchData();
        }
    }, [selectedModuleId, appUserId]);

    return {
        loading,
        error,
        modules,
        assignedWidgets,
        readyWidgets,
        userInfo,
        setAssignedWidgets,
        setReadyWidgets
    };
};