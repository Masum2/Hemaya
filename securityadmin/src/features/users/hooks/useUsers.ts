import { useQuery } from '@tanstack/react-query';
import { UserService } from '../services/user.service';

export const useGetUsers = () => {
    return useQuery({
        queryKey: ['users'],
        queryFn: UserService.getUsers,
        staleTime: 1 * 60 * 1000, // ১ মিনিট পর্যন্ত ডাটা ক্যাশে ফ্রেশ থাকবে
    });
};