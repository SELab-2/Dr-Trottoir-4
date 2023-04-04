import {AxiosResponse} from "axios";
import api from "@/lib/api/axios";

export interface RegionInterface {
    id: number;
    region: number;
}

export async function getAllRegions(): Promise<AxiosResponse<any>> {
    const request_url: string = `${process.env.NEXT_PUBLIC_BASE_API_URL}${process.env.NEXT_PUBLIC_API_ALL_REGIONS}`;
    return await api.get(request_url);
}

export async function getRegion(regionId: number): Promise<AxiosResponse<any>> {
    const request_url: string = `${process.env.NEXT_PUBLIC_BASE_API_URL}${process.env.NEXT_PUBLIC_API_REGION}${regionId}`;
    return await api.get(request_url);
}