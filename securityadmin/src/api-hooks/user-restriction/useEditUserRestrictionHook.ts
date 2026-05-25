import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { EditUserRestrictionPayload } from '../../types/user-restriction/userRestrictionTypes';
import { editUserRestriction } from '../../api/user-restriction/editUserRestriction';


export const useEditUserRestrictionHook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: EditUserRestrictionPayload) => editUserRestriction(payload),
    onSuccess: () => {
      // ডেটা আপডেট হওয়ার পর মেইন টেবিল লিস্ট অটো-রিফ্রেশ করবে
      queryClient.invalidateQueries({ queryKey: ['userRestrictionList'] });
    },
  });
};