import api from "@/lib/api/axios";
import {AxiosResponse} from "axios";
import {BuildingPostInterface} from "@/lib/building";


export interface BuildingManual {
    id: number,
    building: number,
    version_number: 0,
    file: string
}

export interface BuildingManualPostInterface {
    building: number,
    file: File
}

export async function getManualsForBuilding(buildingId: number): Promise<AxiosResponse<any>> {
    const get_url: string = `${process.env.NEXT_PUBLIC_BASE_API_URL}${process.env.NEXT_PUBLIC_API_MANUAL_BUILDING}${buildingId}`;
    return await api.get(get_url, {
        headers: {"Content-Type": "multipart/form-data"},
    });
}

export function getManualPath(relativePath: string) {
    return `${process.env.NEXT_PUBLIC_BASE_API_URL}${relativePath}`
}

export async function postManual(manual: BuildingManualPostInterface): Promise<AxiosResponse<any>> {
    const formdata = new FormData();
    formdata.set("building", manual.building.toString());
    formdata.set("file", manual.file);
    const request_url: string = `${process.env.NEXT_PUBLIC_BASE_API_URL}${process.env.NEXT_PUBLIC_API_MANUAL}`;
    return await api.post(request_url, formdata,
        {
            headers: {"Content-Type": "multipart/form-data"},
        }
    );
}
