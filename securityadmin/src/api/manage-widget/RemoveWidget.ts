import type { RemoveWidgetPayload } from "../../types/manage-widget-types/widget.types";


export const removeWidget = async (payload: RemoveWidgetPayload) => {
    const response = await fetch('/api/SecurityAdmin/RemoveWidget', {
        method: 'POST',
        headers: {
            'accept': '*/*',
            'Content-Type': 'application/json-patch+json',
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok) throw new Error("Failed to remove widget");
    return response;
};