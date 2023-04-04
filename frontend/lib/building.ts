import api from "@/lib/api/axios";
import { AxiosResponse } from "axios";
import {User} from "@/lib/user";

export interface BuildingInterface {
    id: number;
    syndic: number;
    name: string;
    city: string;
    postal_code: string;
    street: string;
    house_number: number;
    bus: string;
    client_id: number;
    duration: Date;
    region: number;
    public_id: string;
}

export interface BuildingPostInterface {
    syndic: string;
    name: string;
    city: string;
    postal_code: string;
    street: string;
    house_number: string;
    bus: string;
    client_id: string;
    duration: string;
    region: string;
    public_id: string;
}

export const getBuildingsFromOwner = async (ownerId: string): Promise<AxiosResponse<any>> => {
    const request_url: string = `${process.env.NEXT_PUBLIC_BASE_API_URL}${process.env.NEXT_PUBLIC_API_OWNER_BUILDING}${ownerId}`;
    return await api.get(request_url);
};

export const getBuildingInfo = async (buildingId: number): Promise<AxiosResponse<any>> => {
    const request_url: string = `${process.env.NEXT_PUBLIC_BASE_API_URL}${process.env.NEXT_PUBLIC_API_BUILDING}${buildingId}`;
    return await api.get(request_url);
};

export async function getAllBuildings() : Promise<AxiosResponse<any>> {
    const request_url: string = `${process.env.NEXT_PUBLIC_BASE_API_URL}${process.env.NEXT_PUBLIC_API_ALL_BUILDINGS}`;
    return await api.get(request_url);
}

export function getAddress(building : BuildingInterface) : string {
    return `${building.street} ${building.house_number} ${building.bus ? building.bus : ""}, ${building.postal_code} ${building.city}`;
}

export const patchBuildingInfo = async (buildingId: string | undefined, data: BuildingInterface | Object) => {
    const request_url: string = `${process.env.NEXT_PUBLIC_BASE_API_URL}${process.env.NEXT_PUBLIC_API_BUILDING}${buildingId}`;
    return await api.patch(request_url, data);
};

export const generateNewPublicId = async (buildingId: string | undefined) => {
    const request_url: string = `${process.env.NEXT_PUBLIC_BASE_API_URL}${process.env.NEXT_PUBLIC_API_NEW_PUBLIC_ID_BUILDING}${buildingId}`;
    return await api.post(request_url)
}

export const deleteBuilding = async (buildingId: number | undefined) => {
    const request_url: string = `${process.env.NEXT_PUBLIC_BASE_API_URL}${process.env.NEXT_PUBLIC_API_BUILDING}${buildingId}`;
    return await api.delete(request_url);
};

export async function postBuilding(building: BuildingPostInterface) : Promise<AxiosResponse<any>> {
    const request_url: string = `${process.env.NEXT_PUBLIC_BASE_API_URL}${process.env.NEXT_PUBLIC_API_BUILDING}`;
    return await api.post(request_url, JSON.stringify(building),
        {
            headers: { "Content-Type": "application/json" },
        }
    );
}

