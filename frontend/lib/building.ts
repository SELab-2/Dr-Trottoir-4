import api from "@/lib/api/axios";
import {AxiosResponse} from "axios";

export interface BuildingInterface {
    id: number;
    syndic: number;
    name: string;
    city: string;
    postal_code: string;
    street: string;
    house_number: string;
    bus: string;
    client_number: string;
    duration: string;
    region: number;
    public_id: string;
}

export interface BuildingPostInterface {
    syndic: number;
    name: string;
    city: string;
    postal_code: string;
    street: string;
    house_number: string;
    bus: string;
    client_number: string;
    duration: string;
    region: number;
    public_id: string;
}

export interface BuildingSyndicPostInterface {
    name: string;
    public_id: string;
}

export interface BuildingCommentPostInterface{
    building: number,
    comment: string
}

export interface BuildingCommentInterface {
    building: number,
    comment: string
    id: number
}

export const getBuildingsFromOwner = async (ownerId: number | string): Promise<AxiosResponse<any>> => {
    const request_url: string = `${process.env.NEXT_PUBLIC_BASE_API_URL}${process.env.NEXT_PUBLIC_API_OWNER_BUILDING}${ownerId}`;
    return await api.get(request_url);
};

export const getBuildingInfo = async (buildingId: string | undefined | number): Promise<AxiosResponse<any>> => {
    const request_url: string = `${process.env.NEXT_PUBLIC_BASE_API_URL}${process.env.NEXT_PUBLIC_API_BUILDING}${buildingId}`;
    return await api.get(request_url);
};

export const getBuildingInfoByPublicId = async (publicId: string | undefined | number): Promise<AxiosResponse<any>> => {
    const request_url: string = `${process.env.NEXT_PUBLIC_BASE_API_URL}${process.env.NEXT_PUBLIC_API_PUBLIC_ID_BUILDING}${publicId}`;
    return await api.get(request_url);
}

export async function getAllBuildings(): Promise<AxiosResponse<any>> {
    const request_url: string = `${process.env.NEXT_PUBLIC_BASE_API_URL}${process.env.NEXT_PUBLIC_API_ALL_BUILDINGS}`;
    return await api.get(request_url);
}

export function getAddress(building: BuildingInterface): string {
    return `${building.street} ${building.house_number} ${building.bus ? building.bus : ""}, ${building.postal_code} ${building.city}`;
}

export const patchBuildingInfo = async (buildingId: string | number | undefined, data: BuildingInterface | Object) => {
    const request_url: string = `${process.env.NEXT_PUBLIC_BASE_API_URL}${process.env.NEXT_PUBLIC_API_BUILDING}${buildingId}`;
    return await api.patch(request_url, data);
};

export const generateNewPublicId = async (buildingId: string | number | undefined) => {
    const request_url: string = `${process.env.NEXT_PUBLIC_BASE_API_URL}${process.env.NEXT_PUBLIC_API_NEW_PUBLIC_ID_BUILDING}${buildingId}`;
    return await api.post(request_url)
}

export const deleteBuilding = async (buildingId: string | number | undefined) => {
    const request_url: string = `${process.env.NEXT_PUBLIC_BASE_API_URL}${process.env.NEXT_PUBLIC_API_BUILDING}${buildingId}`;
    return await api.delete(request_url);
};

export async function postBuilding(building: BuildingPostInterface): Promise<AxiosResponse<any>> {
    const request_url: string = `${process.env.NEXT_PUBLIC_BASE_API_URL}${process.env.NEXT_PUBLIC_API_BUILDING}`;
    return await api.post(request_url, JSON.stringify(building),
        {
            headers: {"Content-Type": "application/json"},
        }
    );
}

export async function patchBuilding(building: BuildingPostInterface, id: number): Promise<AxiosResponse<any>> {
    const request_url: string = `${process.env.NEXT_PUBLIC_BASE_API_URL}${process.env.NEXT_PUBLIC_API_BUILDING_COMMENT}`;
    return await api.patch(request_url, JSON.stringify(building),
        {
            headers: {"Content-Type": "application/json"},
        }
    );
}

export async function postBuildingComment(buildingComment: BuildingCommentPostInterface): Promise<AxiosResponse<any>> {
    const request_url: string = `${process.env.NEXT_PUBLIC_BASE_API_URL}${process.env.NEXT_PUBLIC_API_BUILDING}`;
    return await api.post(request_url, JSON.stringify(buildingComment),
        {
            headers: {"Content-Type": "application/json"},
        }
    );
}

export async function patchBuildingComment(buildingComment: BuildingCommentPostInterface): Promise<AxiosResponse<any>> {
    const request_url: string = `${process.env.NEXT_PUBLIC_BASE_API_URL}${process.env.NEXT_PUBLIC_API_BUILDING}${buildingComment.building}`;
    return await api.patch(request_url, JSON.stringify(buildingComment),
        {
            headers: {"Content-Type": "application/json"},
        }
    );
}

export async function getBuildingComment(id: number): Promise<AxiosResponse<any>> {
    const request_url: string = `${process.env.NEXT_PUBLIC_BASE_API_URL}${process.env.NEXT_PUBLIC_API_BUILDING_COMMENT_BUILDING}${id}`;
    return await api.get(request_url);
}

export function getDurationFromMinutes(durationInMinutes: number) {
    return `${Math.floor(durationInMinutes / 60)
        .toString()
        .padStart(2, "0")}:${(durationInMinutes % 60)
        .toString()
        .padStart(2, "0")}`
}


export const getNewPublicId = async () => {
    const request_url: string = `${process.env.NEXT_PUBLIC_BASE_API_URL}${process.env.NEXT_PUBLIC_API_GET_NEW_PUBLIC_ID_BUILDING}`;
    return await api.get(request_url)
}

