import axios from 'axios';
import type { AddNewUserPayload } from '../../types/user-manage-types/AddUserTypes';



export const addNewUser = async (payload: AddNewUserPayload) => {
    const response = await axios.post('/api/SecurityAdmin/AddNewUser', payload, {
        withCredentials: true,
        headers: {
            'accept': '*/*',
            'Content-Type': 'application/json-patch+json'
        }
    });
    return response;
};