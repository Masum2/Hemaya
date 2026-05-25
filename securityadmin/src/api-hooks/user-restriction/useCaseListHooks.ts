import { useQuery } from '@tanstack/react-query';
import type { CaseResponse } from '../../types/user-restriction/userRestrictionTypes';
import { getCaseList } from '../../api/user-restriction/getCaseList';


export const useCaseListHooks = () => {
  return useQuery<CaseResponse, Error>({
    queryKey: ['caseList'],
    queryFn: getCaseList,
  });
};