import axios from 'axios';
import type { AddUserRestrictionPayload } from '../../types/user-restriction/userRestrictionTypes';


export const addNewUserRestriction = async (payload: AddUserRestrictionPayload): Promise<any> => {
  const response = await axios.post(
    '/api/SecurityAdmin/AddNewUserRestriction',
    payload,
    {
      headers: {
        'accept': '*/*',
        'Content-Type': 'application/json-patch+json',
      },
    }
  );
  return response.data;
};