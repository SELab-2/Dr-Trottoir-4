import {AxiosResponse} from "axios";
import {DateInterval, getFromDate} from "@/lib/date";

export interface GarbageCollectionInterface {
    id: number;
    building: number;
    date: Date;
    garbage_type: string;
}


export const garbageTypes: Record<string, string> = {
    "GFT": "GFT",
    "GLS": "Glas",
    "GRF": "Grof vuil",
    "KER": "Kerstbomen",
    "PAP": "Papier",
    "PMD": "PMD",
    "RES": "Restafval",
}

export function getGarbageColor(garbageType : string) {
    const garbageColors: Record<string, string> = {
        "GFT": "green",
        "Glas": "gainsboro",
        "Grof vuil": "sienna",
        "Kerstbomen": "seagreen",
        "Papier": "goldenrod",
        "PMD": "dodgerblue",
        "Restafval": "dimgrey",
    };
    return garbageColors[garbageType] ? garbageColors[garbageType] : "blue";
}


export async function getGarbageCollectionFromBuilding(buildingId: number, params: DateInterval | null = null): Promise<AxiosResponse<any>> {
    const request_url: string = `${process.env.NEXT_PUBLIC_BASE_API_URL}${process.env.NEXT_PUBLIC_API_GARBAGE_COLLECTION_BUILDING}${buildingId}`;
    return getFromDate(request_url, params);
}