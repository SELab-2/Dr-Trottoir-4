import api from '../pages/api/axios';
import {Login} from "@/types.d";
import {useContext} from "react";
import AuthContext from "@/context/AuthProvider";

const login = async (email: string, password: string, router: any, loginUser : () => void): Promise<void> => {

    const host: string = `${process.env.NEXT_PUBLIC_BASE_API_URL}${process.env.NEXT_PUBLIC_API_LOGIN}`;

    const login_data: Login = {
        email: email,
        password: password,
    };
    api.post(host, login_data, {
        headers: {'Content-Type': 'application/json'}
    })
        .then((response: { status: number, data: any; }) => {
            console.log(response);
            if (response.status == 200) {
                loginUser();
                router.push('/welcome');
            }
        })
        .catch((error: any) => {
            console.log(error);
        });
};

export default login;