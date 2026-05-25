export interface UserRestrictionData {
  Id: number;
  CaseName: string | null;
  CaseNumber: string;
  UserName: string;
  RestrictedStatus: boolean;
  CaseDesc: string;
  StatusDesc: 'ON' | 'OFF';
}

export interface UserRestrictionResponse {
  Message: string | null;
  Data: UserRestrictionData[];
}

export interface AppUserData {
  text: string;
  value: string;
}

export type AppUserResponse = AppUserData[];

export interface CaseData {
  caseId: number;
  text: string;
  value: string;
}

export type CaseResponse = CaseData[];

export interface AddUserRestrictionPayload {
  id: number;
  caseId: number;
  restrictStatus: boolean;
  createdBy: string;
  createdOn: string;
  recordedBy: string;
  recordedOn: string;
  selectedUserIds: number[];
}
export interface EditUserRestrictionPayload {
  id: number;
  caseId: number;
  restrictStatus: boolean;
  createdBy: string;
  createdOn: string;
  recordedBy: string;
  recordedOn: string;
  selectedUserIds: number[];
}