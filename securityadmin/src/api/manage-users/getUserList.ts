import axios from 'axios';

export const getUserList = async () => {
    const response = await axios.get('/api/SecurityAdmin/GetUserList', {
        withCredentials: true,
        headers: { 'accept': '*/*' }
    });
    return response;
};