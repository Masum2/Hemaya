import axios from 'axios';
import type { EditUserRestrictionPayload } from '../../types/user-restriction/userRestrictionTypes';


export const editUserRestriction = async (payload: EditUserRestrictionPayload): Promise<any> => {
  const response = await axios.put(
    '/api/SecurityAdmin/EditUserRestriction',
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