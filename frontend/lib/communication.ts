import api from "@/lib/api/axios";
import { AxiosResponse } from "axios";

export interface EmailTemplate {
    id: number,
    name: string,
    template: string,
}

export async function getAllEmailTemplates() : Promise<AxiosResponse<any>> {
    const request_url: string = `${process.env.NEXT_PUBLIC_BASE_API_URL}${process.env.NEXT_PUBLIC_API_ALL_TEMPLATES}`;
    return await api.get(request_url);
}

export async function getEmailTemplateWithID(id: number) : Promise<AxiosResponse<any>> {
    const request_url: string = `${process.env.NEXT_PUBLIC_BASE_API_URL}${process.env.NEXT_PUBLIC_API_TEMPLATE}${id}`;
    return await api.get(request_url);
}
