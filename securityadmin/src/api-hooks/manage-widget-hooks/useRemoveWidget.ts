import { useState } from 'react';
import { removeWidget } from '../../api/manage-widget/RemoveWidget';
import { toast } from 'react-toastify';

export const useRemoveWidget = (appUserId: number, selectedModuleId: number | null) => {
    const [loading, setLoading] = useState(false);

    const removeWidgetById = async (widgetId: number) => {
        setLoading(true);
        try {
            await removeWidget({
                id: widgetId,
                appUserId: appUserId,
                selectedModuleId: selectedModuleId
            });

            toast.success("Widget removed successfully!");
            return true;
        } catch (err) {
            console.error("Remove widget error:", err);
            toast.error("Failed to remove widget. Please try again.");
            return false;
        } finally {
            setLoading(false);
        }
    };

    return { removeWidgetById, loading };
};