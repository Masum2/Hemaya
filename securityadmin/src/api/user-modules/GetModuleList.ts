export const getModuleList = async (userId: string) => {
    const response = await fetch(`/api/SecurityAdmin/GetModuleList?userId=${userId}`);
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return response.json();
};