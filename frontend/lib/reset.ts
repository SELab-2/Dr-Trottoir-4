import {Reset_Password} from "@/types";
import api from "@/lib/api/axios";
import {AxiosResponse} from "axios";

const reset = async (email: string): Promise<AxiosResponse<any, any>> => {
    const host = `${process.env.NEXT_PUBLIC_BASE_API_URL}${process.env.NEXT_PUBLIC_API_RESET_PASSWORD}`;
    const reset_data: Reset_Password = {
        email: email,
    };

    return api.post(host, JSON.stringify(reset_data), {
        headers: { "Content-Type": "application/json" },
    });
};

export default reset;
