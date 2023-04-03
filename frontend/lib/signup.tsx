import { SignUp } from "@/types.d";
import api from "@/lib/api/axios";
import { AxiosResponse } from "axios";

const signup = async (
    firstname: string,
    lastname: string,
    phone_number: string,
    email: string,
    password1: string,
    password2: string,
    verification_code: string
): Promise<AxiosResponse<any, any>> => {
    const host = `${process.env.NEXT_PUBLIC_BASE_API_URL}${process.env.NEXT_PUBLIC_API_SIGNUP}`;
    const signup_data: SignUp = {
        first_name: firstname,
        last_name: lastname,
        phone_number: phone_number,
        email: email,
        password1: password1,
        password2: password2,
        verification_code: verification_code,
    };

    // TODO Display error message from backend that will check this
    // Small check if passwords are equal
    if (signup_data.password1 !== signup_data.password2) {
        return Promise.reject("Passwords do not match");
    }

    return api.post(host, JSON.stringify(signup_data), {
        headers: { "Content-Type": "application/json" },
    });
};

export default signup;
