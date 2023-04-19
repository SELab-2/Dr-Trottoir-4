import { AxiosResponse } from "axios";
import api from "@/lib/api/axios";

export interface RemarkAtBuilding {
    id : number,
    building : number,
    timestamp : string,
    remark : string,
    student_on_tour : number,
}

export async function getAllRemarksAtBuilding() : Promise<AxiosResponse<any>> {
    const request_url: string = `${process.env.NEXT_PUBLIC_BASE_API_URL}${process.env.NEXT_PUBLIC_API_ALL_REMARKS}`;
    return await api.get(request_url);
}

export async function getRemarkAtBuilding(remarkId: number) : Promise<AxiosResponse<any>> {
    const request_url : string = `${process.env.NEXT_PUBLIC_BASE_API_URL}${process.env.NEXT_PUBLIC_API_REMARK_AT_BUILDING}${remarkId}`;
    return await api.get(request_url);
}

export async function getAllRemarksAtBuildingWithBuildingId(buildingId: number) : Promise<AxiosResponse<any>> {
    const request_url : string = `${process.env.NEXT_PUBLIC_BASE_API_URL}${process.env.NEXT_PUBLIC_API_REMARKS_OF_A_BUILDING}${buildingId}`;
    return await api.get(request_url);
}

