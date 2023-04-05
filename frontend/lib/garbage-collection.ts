import api from "@/lib/api/axios";
import {AxiosResponse} from "axios";

export interface GarbageCollectionInterface {
    id: number;
    building: number;
    date: Date;
    garbage_type: string;
}


// TODO: query params
export const getGarbageCollectionFromBuilding = async (buildingId: number, start=null, end=null): Promise<AxiosResponse<any>> => {
    const request_url: string = `${process.env.NEXT_PUBLIC_BASE_API_URL}${process.env.NEXT_PUBLIC_API_GARBAGE_COLLECTION_BUILDING}${buildingId}`;
    return await api.get(request_url);
}
