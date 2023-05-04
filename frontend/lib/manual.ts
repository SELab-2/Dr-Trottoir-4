import api from "@/lib/api/axios";
import {AxiosResponse} from "axios";

export interface ManualInterface {
    id: number;
    building: number;
    version_number: number;
    file:string;
}

// TODO: file gaat geen string mogen zijn bij posten
export interface ManualPostInterface {

}

export const getManual = async (manualId: string | undefined | number): Promise<AxiosResponse<any>> => {
    const request_url: string = `${process.env.NEXT_PUBLIC_BASE_API_URL}${process.env.NEXT_PUBLIC_API_MANUAL}${manualId}`;
    return await api.get(request_url);
}

export const getManualsFromBuilding = async (buildingId: string | undefined | number): Promise<AxiosResponse<any>> => {
    const request_url: string = `${process.env.NEXT_PUBLIC_BASE_API_URL}${process.env.NEXT_PUBLIC_API_MANUAL_BUILDING}${buildingId}`;
    return await api.get(request_url);
}
