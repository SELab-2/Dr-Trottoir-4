import axios from "axios";

axios.defaults.withCredentials = true;
// Instance used to make authenticated requests
const api = axios.create({
    baseURL: `${process.env.NEXT_PUBLIC_BASE_API_URL}`,
    withCredentials: true,
});

// Intercept on response and renew refresh token if necessary
api.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        if (error.response.status === 401 && !error.config._retried) {
            // Set a flag to only try to retrieve an access token once, otherwise it keeps infinitely looping
            error.config._retried = true;
            const request_url: string = `${process.env.NEXT_PUBLIC_API_REFRESH_TOKEN}`;
            // Wait for the post response, to retrieve a new access token
            await api.post(request_url, {}, error.config);
            // Retry the request
            return api.request(error.config);
        }
        // return an error if the response is an error and we already retried
        return Promise.reject(error);
    }
);

export default api;
