import { AxiosResponse } from "axios";
import api from "@/lib/api/axios";

export async function getAllBuildingsOnTour() : Promise<AxiosResponse<any>> {
    const request_url: string = `${process.env.NEXT_PUBLIC_BASE_API_URL}${process.env.NEXT_PUBLIC_API_ALL_BUILDINGS_ON_TOUR}`;
    return api.get(request_url);
}