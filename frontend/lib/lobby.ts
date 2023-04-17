import process from "process";
import api from "@/lib/api/axios";

export interface Lobby {
    id: number,
    email: string,
    verification_code: string,
    role: number
}

export async function getAllInLobby() {
    const request_url: string = `${process.env.NEXT_PUBLIC_BASE_API_URL}${process.env.NEXT_PUBLIC_API_ALL_LOBBY}`;
    return api.get(request_url);
}