import {SignUp} from "@/types.d";

const signup = async (firstname: string, lastname: string, email: string, password1: string, password2: string, router: any): Promise<void> => {

    const signup_data: SignUp = {
        firstname: firstname,
        lastname: lastname,
        email: email,
        password1: password1,
        password2: password2,
    }

    // check if passwords match
    if (signup_data.password1 !== signup_data.password2) {
        alert("Passwords do not match");
        return;
    }

    const host = `${process.env.NEXT_PUBLIC_BASE_API_URL}${process.env.NEXT_PUBLIC_API_SIGNUP}`;
    const response = await fetch(host, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(signup_data),
    });

    if (response.status != 201) { // authentication failed
        throw Error(await response.text());
    } else {
        // authentication was successful, so go to the welcome page
        alert("Successfully created account");
        await router.push("/login");
    }
}

export default signup;
