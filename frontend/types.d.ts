export type Login = {
    email: string;
    password: string;
};

export type SignUp = {
    first_name: string;
    last_name: string;
    phone_number: phone_number,
    email: string;
    password1: string;
    password2: string;
    verification_code: verification_code,
};

export type Reset_Password = {
    email: string;
};

export type TourView = {
    name: string;
    region: string;
    last_modified: string;
    tour_id: number;
};

export type BuildingOnTourView = {
    buildingName: string;
    city: string;
    postalCode: string;
    street: string;
    houseNumber: number;
    bus: string;
    buildingId: number;
    index: number;
};

export type BuildingNotOnTourView = {
    buildingName: string;
    city: string;
    postalCode: string;
    street: string;
    houseNumber: number;
    bus: string;
    buildingId: number;
};

export type UserView = {
    email : string;
    first_name : string;
    last_name : string;
    role : string;
    phone_number : string;
    userId : number;
    isActive : boolean;
}