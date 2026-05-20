import axiosInstance from '../../../api/axiosInstance';
import type { ApiUser } from '../types/user.types';


export const UserService = {
    getUsers: async (): Promise<ApiUser[]> => {
        // এখানে শুরুতে একটা স্ল্যাশ (/) থাকবে এবং তারপর এন্ডপয়েন্ট
        const response = await axiosInstance.get<ApiUser[]>('/SecurityAdmin/GetUserList');
        return response.data;
    },
};