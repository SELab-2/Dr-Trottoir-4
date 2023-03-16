import axios from 'axios';
import {useRouter} from "next/router";

// Instance used to make authenticated requests
const api = axios.create({
    baseURL: `${process.env.NEXT_PUBLIC_BASE_API_URL}`,
    withCredentials: true
});

// Intercept on request and add access tokens to request
api.interceptors.request.use(
    (config) => {
        console.log("Request");
        return config;
    },
    (error) => {
        console.log("Error: request");
        return Promise.reject(error);
    }
);

// Intercept on response and renew refresh token if necessary
api.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        console.error(error.response);
        if (error.response.status === 401 && !error.config._retry) {
            error.config._retry = true;
            try {
                const request_url: string = `${process.env.NEXT_PUBLIC_API_REFRESH_TOKEN}`
                await api.post(request_url);
                console.log("post");
                return api.request(error.config);
            } catch (error) {
                console.log("ERROR");
                console.error(error);
                const router = useRouter();
                if (router.pathname != '/login') {
                    await router.push('/login');
                }
                throw error;
            }
        }
        return Promise.reject(error);
    }
);

export default api;