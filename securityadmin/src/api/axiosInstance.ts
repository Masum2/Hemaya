import axios from 'axios';

export const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || '', // এনভায়রনমেন্ট ভেরিয়েবল ব্যবহার করা প্রফেশনাল
    withCredentials: true,
    headers: {
        'Accept': '*/*',
        'Content-Type': 'application/json',
    },
});