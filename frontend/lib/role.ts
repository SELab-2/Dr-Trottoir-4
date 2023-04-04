import api from "@/lib/api/axios";

export interface Role {
    id : number,
    rank : number,
    name: string,
}

export async function getAllRoles() {
    const request_url: string = `${process.env.NEXT_PUBLIC_BASE_API_URL}${process.env.NEXT_PUBLIC_API_ALL_ROLES}`;
    return await api.get(request_url);
}