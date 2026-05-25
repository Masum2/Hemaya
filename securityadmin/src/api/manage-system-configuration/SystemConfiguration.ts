// src/api/security-admin/SystemConfiguration.ts

export interface ApiConfigItem {
    Id: number;
    Code: number;
    Value: number;
    IsActive: boolean;
}

export interface ApiResponse {
    Message: string | null;
    Data: ApiConfigItem[];
}

// এপিআই থেকে কনফিগারেশন ডেটা নিয়ে আসার ফাংশন
export const getSystemConfigurations = async (): Promise<ApiResponse> => {
    const apiUrl = `/api/SecurityAdmin/GetManageSystemConfiguration`;
    const response = await fetch(apiUrl, { method: "GET" });
    if (!response.ok) throw new Error(`Failed to load configurations: ${response.status}`);
    return response.json();
};

// এপিআই-তে সেভ বা আপডেট করার ফাংশন (প্রয়োজন অনুযায়ী মেথড POST/PUT এবং এন্ডপয়েন্ট চেঞ্জ করে নিতে পারেন)
export const saveSystemConfiguration = async (payload: ApiConfigItem) => {
    const apiUrl = `/api/SecurityAdmin/SaveSystemConfiguration`; // আপনার সেভ এন্ডপয়েন্ট এখানে বসাবেন
    const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error(`Failed to save configuration: ${response.status}`);
    
    const textData = await response.text();
    return textData ? JSON.parse(textData) : { success: true };
};