import {AxiosResponse} from "axios";
import {DateInterval, getFromDate} from "@/lib/date";
import api from "@/lib/api/axios";

export interface GarbageCollectionInterface {
    id: number;
    building: number;
    date: string;
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

export function getGarbageColor(garbageType: string, today: boolean = true) {
    const garbageColors: Record<string, string> = {
        "GFT": "0, 128, 0",         // RGB value for green
        "Glas": "220, 220, 220",    // RGB value for gainsboro
        "Grof vuil": "160, 82, 45", // RGB value for sienna
        "Kerstbomen": "46, 139, 87",// RGB value for seagreen
        "Papier": "218, 165, 32",   // RGB value for goldenrod
        "PMD": "30, 144, 255",      // RGB value for dodgerblue
        "Restafval": "105, 105, 105",// RGB value for dimgrey
    };

    const baseColor = garbageColors[garbageType] ? garbageColors[garbageType] : "0, 0, 255"; // Default RGB value for blue

    if (!today) {
        return `rgba(${baseColor}, 0.4)`; // Adjust the alpha value for transparency if today is false
    }

    return `rgb(${baseColor})`;
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
): Promise<AxiosResponse<any, any>> {
    const params: { [key: string]: string | number | number[] } = {garbage_type, date, move_to_date};
    if (region) {
        params["region"] = region;
    } else if (tour) {
        params["tour"] = tour;
    } else if (buildings) {
        params["buildings"] = JSON.stringify(buildings);
    }
    const post_url: string = `${process.env.NEXT_PUBLIC_BASE_API_URL}${process.env.NEXT_PUBLIC_API_BULK_MOVE_GARBAGE_COLLECTION}`;
    return await api.post(post_url, {},
        {
            headers: {"Content-Type": "application/json"},
            params: params
        });
}
