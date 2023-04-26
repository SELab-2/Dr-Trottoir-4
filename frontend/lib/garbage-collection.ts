import {AxiosResponse} from "axios";
import {DateInterval, getFromDate} from "@/lib/date";
import api from "@/lib/api/axios";

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

export function getGarbageColor(garbageType: string) {
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

export async function patchGarbageCollection(garbageCollectionId: number, data: Object) {
    const patch_url: string = `${process.env.NEXT_PUBLIC_BASE_API_URL}${process.env.NEXT_PUBLIC_API_GARBAGE_COLLECTION}${garbageCollectionId}`;
    return await api.patch(patch_url, data,
        {
            headers: {"Content-Type": "application/json"},
        });
}

export async function postGarbageCollection(building: number, date: string, type: string) {
    const post_url: string = `${process.env.NEXT_PUBLIC_BASE_API_URL}${process.env.NEXT_PUBLIC_API_GARBAGE_COLLECTION}`;
    return await api.post(post_url, {building, date, garbage_type: type},
        {
            headers: {"Content-Type": "application/json"},
        });
}

export async function deleteGarbageCollection(garbageCollectionId: number) {
    const delete_url: string = `${process.env.NEXT_PUBLIC_BASE_API_URL}${process.env.NEXT_PUBLIC_API_GARBAGE_COLLECTION}${garbageCollectionId}`;
    return await api.delete(delete_url);
}

export async function duplicateGarbageCollectionSchedule(startDatePeriod: string, endDatePeriod: string, startDateCopy: string, buildingIds: number[] = []) {
    let data: { [name: string]: string | number | number[] } = {
        start_date_period: startDatePeriod,
        end_date_period: endDatePeriod,
        start_date_copy: startDateCopy
    };
    if (buildingIds.length > 0) {
        data["building_ids"] = buildingIds;
    }
    const post_url: string = `${process.env.NEXT_PUBLIC_BASE_API_URL}${process.env.NEXT_PUBLIC_API_DUPLICATE_GARBAGE_COLLECTION}`;
    return await api.post(post_url, data,
        {
            headers: {"Content-Type": "application/json"},
        });
}

// Bulk move a garbage type from one date to another
export async function bulkMoveGarbageCollectionSchedule(
    garbage_type: string,
    date: string,
    move_to_date: string,
    buildings: number[] | null = null,
    region: number | null = null,
    tour: number | null = null
) {
    const params : {[key : string] : string | number | number[]} = {garbage_type, date, move_to_date};
    if (region) {
        params["region"] = region;
    } else if (tour) {
        params["tour"] = tour;
    } else if (buildings) {
        params["buildings"] = "[" + buildings.toString() + "]";
    }
    const post_url: string = `${process.env.NEXT_PUBLIC_BASE_API_URL}${process.env.NEXT_PUBLIC_API_BULK_MOVE_GARBAGE_COLLECTION}`;
    return await api.post(post_url, {},
        {
            headers: {"Content-Type": "application/json"},
            params : params
        });
}