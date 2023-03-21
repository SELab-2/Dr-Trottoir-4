import { SignUp } from "@/types.d";
import login from "@/lib/login";
import api from "@/pages/api/axios";

const signup = async (
    firstname: string,
    lastname: string,
    email: string,
    password1: string,
    password2: string,
    router: any
): Promise<void> => {
    const host = `${process.env.NEXT_PUBLIC_BASE_API_URL}${process.env.NEXT_PUBLIC_API_SIGNUP}`;
    const signup_data: SignUp = {
        first_name: firstname,
        last_name: lastname,
        email: email,
        password1: password1,
        password2: password2,
    };

    // TODO Display error message from backend that will check this
    // Small check if passwords are equal
    if (signup_data.password1 !== signup_data.password2) {
        alert("Passwords do not match");
        return;
    }

    // Attempt to signup with axios so authentication tokens get saved in our axios instance
    api.post(host, signup_data, {
        headers: { "Content-Type": "application/json" },
    })
        .then((response: { status: number }) => {
            if (response.status == 201) {
                alert("Succesfully created account");
                router.push("/welcome");
            }
        })
        .catch((error) => {
            console.error(error);
        });
};

export default signup;
