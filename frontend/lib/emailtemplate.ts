import process from "process";
import api from "@/lib/api/axios";

export interface Emailtemplate {
    id : number,
    name : string,
    template : string
}

export async function getAllMailTemplates() {
    const request_url: string = `${process.env.NEXT_PUBLIC_BASE_API_URL}${process.env.NEXT_PUBLIC_API_ALL_EMAIL_TEMPLATES}`;
    return await api.get(request_url);
}