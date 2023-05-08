import api from "@/lib/api/axios";
import {AxiosResponse} from "axios";


export interface BuildingManual {
    id: number,
    building: number,
    version_number: 0,
    file: string
}

export async function getManualsForBuilding(buildingId: number): Promise<AxiosResponse<any>> {
    const get_url: string = `${process.env.NEXT_PUBLIC_BASE_API_URL}${process.env.NEXT_PUBLIC_API_MANUAL_BUILDING}${buildingId}`;
    return await api.get(get_url, {
        headers: {"Content-Type": "multipart/form-data"},
    });
}

export function getManualPath(relativePath : string) {
    return `${process.env.NEXT_PUBLIC_BASE_API_URL}${relativePath.substring(1)}` // Remove first / of relativePath
}