import api from "../pages/api/axios";

export const logout = () => {
    const logout_url: string = `${process.env.NEXT_PUBLIC_BASE_API_URL}${process.env.NEXT_PUBLIC_API_LOGOUT}`;

    return api.post(logout_url);
};
