// src/api/security-admin/GetUserPrivilege.ts

// ডাটাবেজ থেকে প্রিভিলেজ লিস্ট রিড করার ফাংশন
export const getUserPrivilege = async (appUserId: number, userModule: number) => {
    const apiUrl = `/api/SecurityAdmin/GetUserPrivilege?appUserId=${appUserId}&userModule=${userModule}`;

    const response = await fetch(apiUrl, { method: "GET" });
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    return response.json();
};

// ডাটাবেজে নতুন প্রিভিলেজ সেভ করার ফাংশন (POST Request)
export const saveUserPrivileges = async (payload: {
    selRoleId: number;
    selAppUserId: number;
    userModule: string;
    selectedPrivileges: number[];
}) => {
    const apiUrl = `/api/SecurityAdmin/SaveUserPrivileges`;

    const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        throw new Error(`Failed to save privileges. Server status: ${response.status}`);
    }

    // রেসপন্স যদি একদম এম্পটি (খালি) আসে, তবে টেক্সট হিসেবে রিসিভ করাই সেফ
    const textData = await response.text();
    try {
        return textData ? JSON.parse(textData) : { success: true };
    } catch {
        return { success: true };
    }
};

// নতুন রিসেট এপিআই ফাংশন
export const resetUserPrivileges = async (payload: {
    appUserId: number;
    selRoleId: number;
    userModule: string;
}) => {
    const apiUrl = `/api/SecurityAdmin/ResetUserPrivileges`;

    const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        throw new Error(`Failed to reset privileges: ${response.status}`);
    }

    const textData = await response.text();
    try {
        return textData ? JSON.parse(textData) : { success: true };
    } catch {
        return { success: true };
    }
};