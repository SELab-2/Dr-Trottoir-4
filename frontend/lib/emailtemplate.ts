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

export async function patchMailTemplate(templateId : number, data : Object) {
    const patch_url: string = `${process.env.NEXT_PUBLIC_BASE_API_URL}${process.env.NEXT_PUBLIC_API_EMAIL_TEMPLATE}${templateId}`
    return await api.patch(patch_url, data, {
        headers: { "Content-Type": "application/json" },
    });
}

export async function postMailTemplate(name : string, template : string) {
    const post_url: string = `${process.env.NEXT_PUBLIC_BASE_API_URL}${process.env.NEXT_PUBLIC_API_EMAIL_TEMPLATE}`
    return await api.post(post_url, {name, template}, {
        headers: { "Content-Type": "application/json" },
    });
}