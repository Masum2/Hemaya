import { useState, useCallback } from 'react';
import { assignAllWidgets } from '../../api/manage-widget/AssignAllWidgets';
import { toast } from 'react-toastify';
import type { AssignWidgetPayload } from '../../types/manage-widget-types/widget.types';

interface Widget {
    WidgetComponentId: number;
    WidgetType: number;
}

interface AssignAllWidgetsRequest {
    appUserId: number;
    currentModule: number | null;
    selectedModuleId: number | null;
    widgets: AssignWidgetPayload[];
}

interface ErrorResponse {
    response?: {
        data?: {
            message?: string;
        };
    };
    message?: string;
}

export const useAssignAllWidgets = (appUserId: number, selectedModuleId: number | null) => {
    const [loading, setLoading] = useState<boolean>(false);

    const assignWidgets = useCallback(async (widgets: AssignWidgetPayload[]): Promise<boolean> => {
        setLoading(true);
        try {
            const requestData: AssignAllWidgetsRequest = {
                appUserId: appUserId,
                currentModule: selectedModuleId,
                selectedModuleId: selectedModuleId,
                widgets: widgets
            };

            await assignAllWidgets(requestData);

            toast.success("Widgets assigned successfully!");
            return true;
        } catch (err) {
            const error = err as ErrorResponse;
            console.error("Assign widgets error:", error);

            const errorMessage = error?.response?.data?.message || error?.message || "Failed to assign widgets.";
            toast.error(errorMessage);
            return false;
        } finally {
            setLoading(false);
        }
    }, [appUserId, selectedModuleId]);

    const assignSingleWidget = useCallback(async (widgetComponentId: number, widgetType: number): Promise<boolean> => {
        return assignWidgets([
            {
                widgetComponentId: widgetComponentId,
                widgetType: widgetType,
                isSelected: true
            }
        ]);
    }, [assignWidgets]);

    const assignAllAvailableWidgets = useCallback(async (readyWidgets: Widget[]): Promise<boolean> => {
        if (!readyWidgets || readyWidgets.length === 0) {
            return true;
        }

        const mappedWidgets: AssignWidgetPayload[] = readyWidgets.map((widget: Widget) => ({
            widgetComponentId: widget.WidgetComponentId,
            widgetType: widget.WidgetType,
            isSelected: true
        }));

        const success = await assignWidgets(mappedWidgets);

        if (success) {
            toast.success(`All ${readyWidgets.length} widget${readyWidgets.length > 1 ? 's' : ''} assigned successfully!`);
        }

        return success;
    }, [assignWidgets]);

    return { assignSingleWidget, assignAllAvailableWidgets, loading };
};