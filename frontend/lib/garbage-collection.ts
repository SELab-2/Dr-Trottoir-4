import api from "@/lib/api/axios";
import {AxiosResponse} from "axios";
import {DateInterval, getFromDate} from "@/lib/date";

export interface GarbageCollectionInterface {
    id: number;
    building: number;
    date: Date;
    garbage_type: string;
}


export async function getGarbageCollectionFromBuilding(buildingId: number, params: DateInterval | null = null): Promise<AxiosResponse<any>> {
    const request_url: string = `${process.env.NEXT_PUBLIC_BASE_API_URL}${process.env.NEXT_PUBLIC_API_GARBAGE_COLLECTION_BUILDING}${buildingId}`;
    return getFromDate(request_url, params);
}