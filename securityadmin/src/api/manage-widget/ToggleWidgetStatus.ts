import type { ToggleStatusPayload } from "../../types/manage-widget-types/widget.types";


export const toggleWidgetStatus = async (payload: ToggleStatusPayload) => {
    const response = await fetch('/api/SecurityAdmin/ToggleWidgetStatus', {
        method: 'POST',
        headers: {
            'accept': '*/*',
            'Content-Type': 'application/json-patch+json',
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok) throw new Error("Failed to update status");
    return response;
};