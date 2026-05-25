import { useQuery } from '@tanstack/react-query';
import type { UserRestrictionResponse } from '../../types/user-restriction/userRestrictionTypes';
import { getUserRestrictionList } from '../../api/user-restriction/GetUserRestrictionList';


export const useUserGetRestrictionListHooks = () => {
  return useQuery<UserRestrictionResponse, Error>({
    queryKey: ['userRestrictionList'],
    queryFn: getUserRestrictionList,
  });
};