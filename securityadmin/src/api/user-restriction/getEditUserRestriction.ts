import axios from 'axios';

export interface EditDetailsResponse {
  id: number;
  appUserId: number;
  caseId: number;
  restrictStatus: boolean;
  createdBy: string;
  createdOn: string;
  recordedBy: string;
  recordedOn: string;
  selectedUserIds: number[];
  selectedUserIDs: string;
}

export const getEditUserRestriction = async (id: number): Promise<EditDetailsResponse> => {
  const response = await axios.get<EditDetailsResponse>(
    `/api/SecurityAdmin/GetEditUserRestriction?id=${id}`
  );
  return response.data;
};