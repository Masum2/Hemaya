import { useState } from 'react';
import { toggleWidgetStatus } from '../../api/manage-widget/ToggleWidgetStatus';
import { toast } from 'react-toastify';

export const useToggleWidgetStatus = (appUserId: number, selectedModuleId: number | null) => {
    const [loading, setLoading] = useState(false);

    const toggleStatus = async (widgetId: number, currentStatus: boolean, onSuccess?: () => void) => {
        setLoading(true);
        const nextStatus = !currentStatus;

        try {
            await toggleWidgetStatus({
                widgetId: widgetId,
                activeStatus: !nextStatus,
                appUserId: appUserId,
                selectedModuleId: selectedModuleId
            });

            toast.success(`Widget status updated successfully!`);
            if (onSuccess) onSuccess();
        } catch (err) {
            console.error("Status toggle error:", err);
            toast.error("Could not update widget status. Please try again.");
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return { toggleStatus, loading };
};