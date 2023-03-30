import { AxiosResponse } from "axios";
import api from "@/lib/api/axios";

export interface Tour {
    id : number,
    name : string,
    region : number,
    modified_at : Date
}

export async function getAllTours() : Promise<AxiosResponse<any>> {
    const request_url: string = `${process.env.NEXT_PUBLIC_BASE_API_URL}${process.env.NEXT_PUBLIC_API_ALL_TOURS}`;
    return await api.get(request_url);
}

export async function getTour(tourId: number) : Promise<AxiosResponse<any>> {
    const request_url: string = `${process.env.NEXT_PUBLIC_BASE_API_URL}${process.env.NEXT_PUBLIC_API_TOUR}${tourId}`;
    return await api.get(request_url);
}

export async function deleteTour(tourId : number) : Promise<AxiosResponse<any>> {
    const delete_url: string = `${process.env.NEXT_PUBLIC_BASE_API_URL}${process.env.NEXT_PUBLIC_API_TOUR}${tourId}`;
    return await api.delete(delete_url);
}

export async function postTour(tourName : string, modifiedAt : Date, region : number) : Promise<AxiosResponse<any>> {
    const post_url: string = `${process.env.NEXT_PUBLIC_BASE_API_URL}${process.env.NEXT_PUBLIC_API_TOUR}`;
    return await api.post(post_url, JSON.stringify({name : tourName, modified_at : modifiedAt, region}),
        {
            headers: { "Content-Type": "application/json" },
        }
    );
}