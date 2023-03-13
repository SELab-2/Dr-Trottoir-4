import axios, {request} from 'axios';
import {useRouter} from "next/router";

/*export function getTokens() {
  const accessToken = Cookies.get('auth-access-token');
  const refreshToken = Cookies.get('auth-refresh-token');
  console.log(accessToken, refreshToken)
  return { accessToken, refreshToken };
}

async function refreshAccessToken() {
  const { refreshToken } = getTokens();

  try {
    const response = await axios.post(
        `http://${process.env.NEXT_PUBLIC_API_HOST}:${process.env.NEXT_PUBLIC_API_PORT}/user/token/refresh`, { refreshToken });
    console.log("response from refreshAccessToken:" + refreshToken)
    const { accessToken } = response.data;
    Cookies.set('access_token', accessToken);
    return accessToken;
  } catch (error) {
    console.error('Failed to refresh access token:', error);
    throw error;
  }
}*/

const api = axios.create({
    baseURL: `http://${process.env.NEXT_PUBLIC_API_HOST}:${process.env.NEXT_PUBLIC_API_PORT}`,
    withCredentials: true
});


api.interceptors.request.use(
    (config: any) => {
        console.log("Interceptor ran on request");
        /*const { accessToken } = getTokens();
        if (accessToken) {
          config.headers.Authorization = `Bearer ${accessToken}`;
          console.log(config)
        }*/
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
                await api.post('user/token/refresh/');
                // const accessToken = await refreshAccessToken();
                // error.config.headers.Authorization = `Bearer ${accessToken}`;
                return api.request(error.config);
            } catch (error) {
                console.error('Failed to refresh access token:', error);
                const router = useRouter();
                router.push('/login');
                throw error;
            }
        }
        throw error;
    }
);

export default api;