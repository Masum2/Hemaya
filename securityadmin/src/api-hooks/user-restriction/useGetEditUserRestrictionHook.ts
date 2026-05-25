import { useMutation } from '@tanstack/react-query';
import { getEditUserRestriction } from '../../api/user-restriction/getEditUserRestriction';


export const useGetEditUserRestrictionHook = () => {
  return useMutation({
    mutationFn: (id: number) => getEditUserRestriction(id),
  });
};