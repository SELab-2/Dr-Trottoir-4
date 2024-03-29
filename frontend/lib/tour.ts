import {AxiosResponse} from "axios";
import api from "@/lib/api/axios";
import {getUserInfo} from "@/lib/user";

export interface Tour {
    id: number,
    name: string,
    region: number,
    modified_at: Date
}

export async function getToursFromRegions(userId: number | null): Promise<AxiosResponse<any>> {
    if (userId && userId >=0) {
        const res = await getUserInfo(userId.toString());
        const regions = res.data.region;
        const request_url: string = `${process.env.NEXT_PUBLIC_BASE_API_URL}${process.env.NEXT_PUBLIC_API_ALL_TOURS}`;
        return await api.get(request_url, {
            params: {
                "region-id-list": regions,
            }
        });
    } else {
        return getAllTours();
    }
}

export async function getAllTours(): Promise<AxiosResponse<any>> {
    const request_url: string = `${process.env.NEXT_PUBLIC_BASE_API_URL}${process.env.NEXT_PUBLIC_API_ALL_TOURS}`;
    return await api.get(request_url);
}

export async function getTour(tourId: number): Promise<AxiosResponse<any>> {
    const request_url: string = `${process.env.NEXT_PUBLIC_BASE_API_URL}${process.env.NEXT_PUBLIC_API_TOUR}${tourId}`;
    return await api.get(request_url);
}

export async function getBuildingsOfTour(tourId: number): Promise<AxiosResponse<any>> {
    const request_url: string = `${process.env.NEXT_PUBLIC_BASE_API_URL}${process.env.NEXT_PUBLIC_API_TOUR}${tourId}/buildings/`;
    return await api.get(request_url);
}

export async function deleteTour(tourId: number): Promise<AxiosResponse<any>> {
    const delete_url: string = `${process.env.NEXT_PUBLIC_BASE_API_URL}${process.env.NEXT_PUBLIC_API_TOUR}${tourId}`;
    return await api.delete(delete_url);
}

export async function postTour(tourName: string, modifiedAt: Date, region: number): Promise<AxiosResponse<any>> {
    const post_url: string = `${process.env.NEXT_PUBLIC_BASE_API_URL}${process.env.NEXT_PUBLIC_API_TOUR}`;
    return await api.post(post_url, JSON.stringify({name: tourName, modified_at: modifiedAt, region}),
        {
            headers: {"Content-Type": "application/json"},
        }
    );
}

export async function patchTour(tourId: number, data: Object, modifiedAt: Date): Promise<AxiosResponse<any>> {
    const post_url: string = `${process.env.NEXT_PUBLIC_BASE_API_URL}${process.env.NEXT_PUBLIC_API_TOUR}${tourId}`;
    return await api.patch(post_url, JSON.stringify({...data, modified_at: modifiedAt}),
        {
            headers: {"Content-Type": "application/json"},
        }
    );
}

/**
 * Takes a data object with buildings as key & index (the position of the building on the tour) as value
 */
export async function swapBuildingsOnTour(tourId: number, data: Object) {
    const post_url: string = `${process.env.NEXT_PUBLIC_BASE_API_URL}${process.env.NEXT_PUBLIC_API_TOUR}${tourId}/sequence/`;
    return await api.post(post_url, JSON.stringify(data),
        {
            headers: {"Content-Type": "application/json"},
        }
    );
}