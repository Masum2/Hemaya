import { useQuery } from '@tanstack/react-query';
import type { AppUserResponse } from '../../types/user-restriction/userRestrictionTypes';
import { getAppUserList } from '../../api/user-restriction/getAppUserList';


export const useAppUserListHooks = () => {
  return useQuery<AppUserResponse, Error>({
    queryKey: ['appUserList'],
    queryFn: async () => {
      const res = await getAppUserList();
      // যদি রেসপন্স এরে না হয়ে কোনো অবজেক্ট হয়, তবে সেটিকে এরেতে কনভার্ট করা বা সেফটি চেক দেওয়া
      return Array.isArray(res) ? res : (res as any).Data || [];
    },
  });
};