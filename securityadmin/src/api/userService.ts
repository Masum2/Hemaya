import axios from "axios";
import type { AppUser } from "./manage-users/userTypes";

// ডটনেটের পোর্ট ডাইনামিকালি ডিটেক্ট করার জন্য window.location.origin ব্যবহার করা হলো
const API_BASE = window.location.origin;

export const userService = {
    getUserList: async (): Promise<AppUser[]> => {
        // এখানে ইউআরএল-টি Absolute করে দেওয়া হলো
        const response = await axios.get(`${API_BASE}/api/SecurityAdmin/GetUserList`, {
            withCredentials: true,
            headers: {
                Accept: "application/json"
            }
        });

        const resData = response.data;
        console.log("API Response:", resData);

        if (Array.isArray(resData?.Data)) return resData.Data;
        if (Array.isArray(resData)) return resData;
        if (Array.isArray(resData?.data)) return resData.data;
        if (Array.isArray(resData?.result)) return resData.result;

        return [];
    }
};