import axios from 'axios';
import type { AppUser } from './manage-users/userTypes';



export const userService = {
  
    getUserList: async (): Promise<AppUser[]> => {
       
        const response = await axios.get('/api/SecurityAdmin/GetUserList', {

            withCredentials: true,

            headers: {

                'accept': '*/*'

            }

        });
        const resData = response.data;

        console.log("Clean API Response Data:", resData);

      
        if (resData && Array.isArray(resData.Data)) return resData.Data;
        if (Array.isArray(resData)) return resData;
        if (resData && Array.isArray(resData.data)) return resData.data;
        if (resData && Array.isArray(resData.appUserData)) return resData.appUserData;
        if (resData && Array.isArray(resData.result)) return resData.result;

        console.warn("Expected an array but got a different structure.");
        return [];
    }
};


