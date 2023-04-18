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
    return await api.get(request_url);
}

export async function addToLobby(email : string, roleId : number) {
    const request_url: string = `${process.env.NEXT_PUBLIC_BASE_API_URL}${process.env.NEXT_PUBLIC_API_LOBBY}`;
    return await api.post(request_url, {email, role : roleId}, {
        headers: { "Content-Type": "application/json" },
    });
}

export async function deleteLobby(lobbyId : number) {
    const request_url: string = `${process.env.NEXT_PUBLIC_BASE_API_URL}${process.env.NEXT_PUBLIC_API_LOBBY}${lobbyId}`;
    return await api.delete(request_url);
}