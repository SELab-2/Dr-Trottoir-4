export type Login = {
    email : string
    password: string
}

export type SignUp = {
    firstname: string,
    lastname: string,
    email: string,
    password1: string,
    password2: string,
}

export type Reset_Password = {
    email : string
}
