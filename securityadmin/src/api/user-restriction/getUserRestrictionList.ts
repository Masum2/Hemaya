import axios from 'axios';
import type { UserRestrictionResponse } from '../../types/user-restriction/userRestrictionTypes';


export const getUserRestrictionList = async (): Promise<UserRestrictionResponse> => {
  const response = await axios.get<UserRestrictionResponse>(
    '/api/SecurityAdmin/GetUserRestrictionList'
  );
  return response.data;
};