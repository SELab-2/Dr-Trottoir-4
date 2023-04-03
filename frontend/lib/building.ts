import api from "@/lib/api/axios";
import { AxiosResponse } from "axios";

export interface BuildingInterface {
    id: number;
    syndic_id: number;
    name: string;
    city: string;
    postal_code: string;
    street: string;
    house_number: number;
    bus: string;
    region_id: number;
    duration: string;
    client_id: number;
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

export const patchBuildingInfo = async (buildingId: string | undefined, data: BuildingInterface | Object) => {
    const request_url: string = `${process.env.NEXT_PUBLIC_BASE_API_URL}${process.env.NEXT_PUBLIC_API_BUILDING}${buildingId}`;
    return await api.patch(request_url, data);
};

export const generateNewPublicId = async (buildingId: string | undefined) => {
    const request_url: string = `${process.env.NEXT_PUBLIC_BASE_API_URL}${process.env.NEXT_PUBLIC_API_NEW_PUBLIC_ID_BUILDING}${buildingId}`;
    return await api.post(request_url)
}
