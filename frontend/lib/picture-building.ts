import api from "@/lib/api/axios";
import { AxiosResponse } from "axios";

export const PictureTypeEnum = Object.freeze ({
    AA: Symbol("Aankomst"),
    BI: Symbol("Binnen"),
    VE: Symbol("Vertrek"),
    OP: Symbol("Opmerking"),
})

export interface PictureBuilding {
    id: number,
    building: number,
    picture: string,
    description: string,
    timestamp: Date,
    type: string,
}

export async function getAllBuildingPictures() : Promise<AxiosResponse<any>> {
    const request_url: string = `${process.env.NEXT_PUBLIC_API_ALL_PICTURES}`;
    return await api.get(request_url);
}

export async function getAllPicturesOfBuilding(building_id: number) : Promise<AxiosResponse<any>> {
    const request_url: string = `${process.env.NEXT_PUBLIC_API_PICTURE_BUILDING}${building_id}`;
    return await api.get(request_url);
}

export async function getSpecificPictureBuilding(picture_id: number) : Promise<AxiosResponse<any>> {
    const request_url: string = `${process.env.NEXT_PUBLIC_API_PICTURE}${picture_id}`;
    return await api.get(request_url);
}
