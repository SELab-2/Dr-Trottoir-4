import api from "./api/axios";

export const getAllUsers = () => {
    const allUsersUrl: string = `${process.env.NEXT_PUBLIC_BASE_API_URL}${process.env.NEXT_PUBLIC_API_ALL_USERS}`;
    return api.get(allUsersUrl);
};
