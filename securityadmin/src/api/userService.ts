import axios from 'axios';
import type {  AppUser } from '../types/user';


export const userService = {
    /**
     * ব্যাকএন্ড থেকে ইউজার লিস্ট নিয়ে আসে এবং ক্লিন অ্যারে রিটার্ন করে
     */
    getUserList: async (): Promise<AppUser[]> => {
       
        const response = await axios.get('/api/SecurityAdmin/GetUserList', {

            withCredentials: true,

            headers: {

                'accept': '*/*'

            }

        });
        const resData = response.data;

        console.log("Clean API Response Data:", resData);

        // বিভিন্ন স্ট্রাকচারের ডেটা হ্যান্ডেল করার লজিক (সেন্ট্রালাইজড)
        if (resData && Array.isArray(resData.Data)) return resData.Data;
        if (Array.isArray(resData)) return resData;
        if (resData && Array.isArray(resData.data)) return resData.data;
        if (resData && Array.isArray(resData.appUserData)) return resData.appUserData;
        if (resData && Array.isArray(resData.result)) return resData.result;

        console.warn("Expected an array but got a different structure.");
        return [];
    }
};


