import api from "@/lib/api/axios";
import { AxiosResponse } from "axios";

export interface BuildingInterface {
    id: number;
    city: string;
    postal_code: string;
    street: string;
    house_number: number;
    bus: number;
    client_id: number;
    duration: Date;
    syndic_id: number;
    region: number;
    name: string;
    public_id: string;
}

export const getBuildingsFromOwner = async (ownerId: string): Promise<AxiosResponse<any>> => {
    const request_url: string = `${process.env.NEXT_PUBLIC_BASE_API_URL}${process.env.NEXT_PUBLIC_API_OWNER_BUILDING}${ownerId}`;
    return await api.get(request_url);
};

export const getBuildingInfo = async (buildingId: string | undefined): Promise<AxiosResponse<any>> => {
    const request_url: string = `${process.env.NEXT_PUBLIC_BASE_API_URL}${process.env.NEXT_PUBLIC_API_BUILDING}${buildingId}`;
    return await api.get(request_url);
};

export async function getAllBuildings() : Promise<AxiosResponse<any>> {
    const request_url: string = `${process.env.NEXT_PUBLIC_BASE_API_URL}${process.env.NEXT_PUBLIC_API_ALL_BUILDINGS}`;
    return await api.get(request_url);
}

export function getAddress(building : BuildingInterface) : string {
    return `${building.street} ${building.house_number} ${building.bus ? building.bus : ""}, ${building.city} ${building.postal_code}`;
}