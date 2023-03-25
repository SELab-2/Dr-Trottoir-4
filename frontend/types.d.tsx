export type Login = {
    email: string;
    password: string;
};

export type SignUp = {
    first_name: string;
    last_name: string;
    email: string;
    password1: string;
    password2: string;
};

export type Reset_Password = {
    email: string;
};
