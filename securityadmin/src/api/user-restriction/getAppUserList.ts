import axios from 'axios';
import type { AppUserResponse } from '../../types/user-restriction/userRestrictionTypes';


export const getAppUserList = async (): Promise<AppUserResponse> => {
  const response = await axios.get<AppUserResponse>(
    '/api/SecurityAdmin/GetAppUsers'
  );
  return response.data;
};