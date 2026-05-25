import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AddUserRestrictionPayload } from '../../types/user-restriction/userRestrictionTypes';
import { addNewUserRestriction } from '../../api/user-restriction/addNewUserRestriction';


export const useAddNewUserRestrictionHook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AddUserRestrictionPayload) => addNewUserRestriction(payload),
    onSuccess: () => {
      // ডেটা সেভ হওয়ার পর মেইন টেবিল লিস্ট রিফ্রেশ করবে
      queryClient.invalidateQueries({ queryKey: ['userRestrictionList'] });
    },
  });
};