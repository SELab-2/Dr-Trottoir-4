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

export async function getAllBuildingsOnTourWithTourID(tourId : number) : Promise<AxiosResponse<any>> {
    const request_url : string = `${process.env.NEXT_PUBLIC_BASE_API_URL}${process.env.NEXT_PUBLIC_API_ALL_BUILDINGS_ON_TOUR_ID}${tourId}`;
    return await api.get(request_url);
}

export async function postBuildingOnTour(tour : number, building : number, index : number) {
    const post_url : string = `${process.env.NEXT_PUBLIC_BASE_API_URL}${process.env.NEXT_PUBLIC_API_BUILDING_ON_TOUR}`;
    return await api.post(post_url, JSON.stringify({tour, building, index}), {
        headers: { "Content-Type": "application/json" },
    });
}

export async function deleteBuildingOnTour(buildingOnTourId : number) : Promise<AxiosResponse<any>> {
    const delete_url: string = `${process.env.NEXT_PUBLIC_BASE_API_URL}${process.env.NEXT_PUBLIC_API_BUILDING_ON_TOUR}${buildingOnTourId}`;
    return await api.delete(delete_url);
}

export async function patchBuildingOnTour(buildingOnTourId : number, data : Object) : Promise<AxiosResponse<any>> {
    const patch_url: string = `${process.env.NEXT_PUBLIC_BASE_API_URL}${process.env.NEXT_PUBLIC_API_BUILDING_ON_TOUR}${buildingOnTourId}`;
    return await api.patch(patch_url, JSON.stringify(data),
        {
            headers: { "Content-Type": "application/json" },
        }
    );
}
