import type { AssignAllWidgetsPayload } from "../../types/manage-widget-types/widget.types";


export const assignAllWidgets = async (payload: AssignAllWidgetsPayload) => {
    const response = await fetch('/api/SecurityAdmin/AssignAllWidgets', {
        method: 'POST',
        headers: {
            'accept': '*/*',
            'Content-Type': 'application/json-patch+json',
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok) throw new Error("Failed to assign widgets");
    return response;
};