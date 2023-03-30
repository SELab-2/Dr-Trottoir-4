import { AxiosResponse } from "axios";
import api from "@/lib/api/axios";

export interface BuildingOnTour {
    id : number,
    tour : number,
    building : number,
    index : number
}

export async function getAllBuildingsOnTour() : Promise<AxiosResponse<any>> {
    const request_url: string = `${process.env.NEXT_PUBLIC_BASE_API_URL}${process.env.NEXT_PUBLIC_API_ALL_BUILDINGS_ON_TOUR}`;
    return await api.get(request_url);
}

export async function getAllBuildingsOnTourWithTourID(tourID : number) : Promise<AxiosResponse<any>> {
    const request_url : string = `${process.env.NEXT_PUBLIC_BASE_API_URL}${process.env.NEXT_PUBLIC_API_ALL_BUILDINGS_ON_TOUR_ID}${tourID}`;
    return await api.get(request_url);
}
