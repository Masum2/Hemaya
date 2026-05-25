import axios from 'axios';
import type { CaseResponse } from '../../types/user-restriction/userRestrictionTypes';


export const getCaseList = async (): Promise<CaseResponse> => {
  const response = await axios.get<CaseResponse>(
    '/api/SecurityAdmin/GetAllOpenAndClosedCases'
  );
  return response.data;
};