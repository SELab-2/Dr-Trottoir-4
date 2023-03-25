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

export type User_Data = {
    user_id: string;
    is_active: boolean;
    email: string;
    first_name: string;
    last_name: string;
    phone_number: string;
    region: [];
    role: string;
}
