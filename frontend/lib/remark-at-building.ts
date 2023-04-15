import {AxiosResponse} from "axios";
import api from "@/lib/api/axios";

// The types of remarks
export const remarkTypes = {
    arrival: "AA", // Aankomst
    inside: "BI", // binnen
    leaving: "VE", // vertrek
    remark: "OP" // opmerking
}

export interface RemarkAtBuilding {
    id: number
    remark: string,
    student_on_tour: number
    timestamp: string
}

export async function getRemarksOfBuilding(buildingId : number): Promise<AxiosResponse<any>> {
    const request_url: string = `${process.env.NEXT_PUBLIC_BASE_API_URL}${process.env.NEXT_PUBLIC_API_REMARKS_OF_A_BUILDING}${buildingId}`;
    return await api.get(request_url);
}

export async function getAllRemarksAtBuilding(): Promise<AxiosResponse<any>> {
    const request_url: string = `${process.env.NEXT_PUBLIC_BASE_API_URL}${process.env.NEXT_PUBLIC_API_ALL_REMARKS}`;
    return await api.get(request_url);
}

export async function postRemarkAtBuilding(buildingId: number, studentOnTourId: number, remark: string, time: Date, remarkType: string): Promise<AxiosResponse<any>> {
    const post_url: string = `${process.env.NEXT_PUBLIC_BASE_API_URL}${process.env.NEXT_PUBLIC_API_REMARK_AT_BUILDING}`;
    return await api.post(post_url, JSON.stringify({
        building: buildingId,
        student_on_tour: studentOnTourId,
        remark: remark,
        timestamp: time.toISOString(),
        type: remarkType
    }), {
        headers: {"Content-Type": "application/json"},
    });
}