import api from "@/lib/api/axios";
import {AxiosResponse} from "axios";

export interface GarbageCollectionInterface {
    id: number;
    building: number;
    date: Date;
    garbage_type: string;
}


export const getGarbageCollectionFromBuilding = async (buildingId: number, start: string = "", end: string = ""): Promise<AxiosResponse<any>> => {
    let request_url: string = `${process.env.NEXT_PUBLIC_BASE_API_URL}${process.env.NEXT_PUBLIC_API_GARBAGE_COLLECTION_BUILDING}${buildingId}`;

    return await api.get(request_url, {
        params: {
            "start-date": start,
            "end-date": end
        }
    });
}
