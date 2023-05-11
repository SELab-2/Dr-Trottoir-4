import api from "@/lib/api/axios";
import {AxiosResponse} from "axios";

export interface BuildingComment {
    id: number,
    comment: string,
    date: string,
    building: number,
}

export async function getAllBuildingComments() : Promise<AxiosResponse<any>> {
    const request_url: string = `${process.env.NEXT_PUBLIC_BASE_API_URL}${process.env.NEXT_PUBLIC_API_ALL_BUILDING_COMMENTS}`;
    return await api.get(request_url);
}

export async function getAllBuildingCommentsByID(id: number) : Promise<AxiosResponse<any>> {
    const request_url: string = `${process.env.NEXT_PUBLIC_BASE_API_URL}${process.env.NEXT_PUBLIC_API_BUILDING_COMMENT}${id}`;
    return await api.get(request_url);
}

export async function getAllBuildingCommentsByBuildingID(building_id: number) : Promise<AxiosResponse<any>> {
    const request_url: string = `${process.env.NEXT_PUBLIC_BASE_API_URL}${process.env.NEXT_PUBLIC_API_BUILDING_COMMENT_BUILDING}${building_id}`;
    return await api.get(request_url);
}
