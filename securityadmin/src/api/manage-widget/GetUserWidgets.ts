export const getUserWidgets = async (appUserId: number, selectedModuleId?: number | null) => {
    const moduleQueryParam = selectedModuleId ? `&selectedModuleId=${selectedModuleId}` : '';
    const apiUrl = `/api/SecurityAdmin/GetUserWidgets?appUserId=${appUserId}${moduleQueryParam}`;

    const response = await fetch(apiUrl, { method: "GET" });
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    return response.json();
};