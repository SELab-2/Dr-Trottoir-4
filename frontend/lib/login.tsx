import api from '../pages/api/axios';
import {Login} from "@/types.d";
import {NextRouter} from "next/router";

const login = async (email: string, password: string, router: NextRouter): Promise<void> => {

    const host: string = `${process.env.NEXT_PUBLIC_BASE_API_URL}${process.env.NEXT_PUBLIC_API_LOGIN}`;
    const login_data: Login = {
        email: email,
        password: password,
    };

    // Attempt to login with axios so authentication tokens get saved in our axios instance
    api.post(host, login_data, {
        headers: {'Content-Type': 'application/json'}
    })
        .then((response: { status: number }) => {
            if (response.status == 200) {
                router.push('/welcome');
            }
        })
        .catch((error) => {
            console.error(error);
        });
};

export default login;