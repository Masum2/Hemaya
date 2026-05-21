/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { getUserList } from '../../api/manage-users/getUserList';
import type { AxiosError } from 'axios';

interface User {
    Id?: number;
    id?: number;
    FirstName?: string;
    firstName?: string;
    LastName?: string;
    lastName?: string;
    AppRoleId?: number;
    appRoleId?: number;
    Email?: string;
    email?: string;
    Phone?: string;
    phone?: string;
    LoginId?: string;
    loginId?: string;
    isActive?: boolean;
    IsActive?: boolean;
}

interface ApiResponse {
    data?: {
        Data?: User[];
        data?: User[];
    };
    Data?: User[];
}

export const useGetUserList = (userId?: string) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [user, setUser] = useState<User | null>(null);

    // Define fetchUserForEdit first using useCallback
    const fetchUserForEdit = useCallback(async () => {
        if (!userId) return;

        setLoading(true);
        setError(null);

        try {
            const response = await getUserList() as { data: ApiResponse };

            let userList: User[] = [];

            if (response.data && Array.isArray(response.data.Data)) {
                userList = response.data.Data;
            } else if (Array.isArray(response.data)) {
                userList = response.data;
            } else if (response.data && Array.isArray(response.data.data)) {
                userList = response.data.data;
            } else if (Array.isArray(response.data?.Data)) {
                userList = response.data.Data;
            }

            const userIdNumber = parseInt(userId, 10);

            const userToEdit = userList.find((u: User) =>
                u.Id === userIdNumber ||
                u.id === userIdNumber ||
                u.Id === parseInt(userId, 10) ||
                u.id === parseInt(userId, 10)
            );

            if (userToEdit) {
                setUser(userToEdit);
            } else {
                const errorMessage = "User data not found.";
                setError(errorMessage);
                toast.error("User data not found!");
            }
        } catch (err) {
            const error = err as AxiosError;
            console.error("Error fetching user for edit:", error);
            setError("Failed to load user data.");
            toast.error("Failed to load user data!");
        } finally {
            setLoading(false);
        }
    }, [userId]); // Add userId as dependency

    // Now useEffect can safely call fetchUserForEdit
    useEffect(() => {
        if (userId) {
            fetchUserForEdit();
        }
    }, [userId, fetchUserForEdit]);

    return { user, loading, error, refetch: fetchUserForEdit };
};