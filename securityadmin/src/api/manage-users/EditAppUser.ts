import axios from 'axios';
import type { EditAppUserPayload } from '../../types/user-manage-types/EditAppUserTypes';


export const editAppUser = async (payload: EditAppUserPayload) => {
    const response = await axios.put('/api/SecurityAdmin/EditAppUser', payload, {
        withCredentials: true,
        headers: {
            'accept': '*/*',
            'Content-Type': 'application/json-patch+json'
        }
    });
    return response;
};