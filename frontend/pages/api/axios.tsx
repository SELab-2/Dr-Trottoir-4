import axios from 'axios';
import {useRouter} from "next/router";


const api = axios.create({
    baseURL: `${process.env.NEXT_PUBLIC_BASE_API_URL}`,
    withCredentials: true
});


api.interceptors.request.use(
    (config: any) => {
        console.log("Interceptor ran on request");
        return config;
    },
    (error: any) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response: any) => {
        console.log("Interceptor ran, response was OK");
        return response;
    },
    async (error: any) => {
        console.log("Interceptor ran, response was NOT OK");
        console.log(error.response);
        if (error.response.status === 401 && !error.config.retry) {
            error.config.retry = true;
            try {
                const request_url : string = `${process.env.NEXT_PUBLIC_API_REFRESH_TOKEN}`
                await api.post(request_url);
                return api.request(error.config);
            } catch (error) {
                console.error("Failed to refresh access token:", error);
                const router = useRouter();
                await router.push('/login');
                throw error;
            }
        }
        throw error;
    }
);

export default api;