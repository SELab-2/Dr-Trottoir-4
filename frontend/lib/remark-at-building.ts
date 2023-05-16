import {AxiosResponse} from "axios";
import api from "@/lib/api/axios";

export interface RemarkAtBuildingInterface {
    id: number;
    student_on_tour: number;
    building: number;
    timestamp?: Date;
    remark?: string;
    type: "AA" | "BI" | "VE" | "OP";
}

export function translateRemarkAtBuildingType(type: RemarkAtBuildingInterface["type"]) {
    switch (type) {
        case "AA":
            return "Aankomst";
        case "BI":
            return "Binnen";
        case "VE":
            return "Vertrek";
        case "OP":
            return "Algemene Opmerking";
    }
}

export async function getRemarksAtBuildingOfSpecificBuilding(buildingId: number, mostRecent: boolean = false): Promise<AxiosResponse<any>> {
    let request_url: string = `${process.env.NEXT_PUBLIC_BASE_API_URL}${process.env.NEXT_PUBLIC_API_REMARKS_OF_A_BUILDING}${buildingId}`;

    return await api.get(request_url, {
        params: {
            "most-recent": mostRecent
        }
    });
}


// The types of remarks
export const remarkTypes = {
    arrival: "AA", // Aankomst
    inside: "BI", // binnen
    leaving: "VE", // vertrek
    remark: "OP" // opmerking
}

export interface RemarkAtBuilding {
    id: number,
    remark: string,
    student_on_tour: number,
    timestamp: string,
    type: string
}

export async function getRemarksOfBuilding(buildingId: number): Promise<AxiosResponse<any>> {
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

export async function patchRemarkAtBuilding(remarkId: number, remark: string): Promise<AxiosResponse<any>> {
    const patch_url: string = `${process.env.NEXT_PUBLIC_BASE_API_URL}${process.env.NEXT_PUBLIC_API_REMARK_AT_BUILDING}${remarkId}`;
    return await api.patch(patch_url, {
        remark: remark
    }, {
        headers: {"Content-Type": "application/json"},
    });
}

export async function deleteRemarkAtBuilding(remarkId: number): Promise<AxiosResponse<any>> {
    const delete_url: string = `${process.env.NEXT_PUBLIC_BASE_API_URL}${process.env.NEXT_PUBLIC_API_REMARK_AT_BUILDING}${remarkId}`;
    return await api.delete(delete_url);
}

export async function getRemarksOfStudentOnTourAtBuilding(buildingId: number, studentOnTourId: number, type: "AA" | "BI" | "VE" | "OP" | null = null) {
    const request_url: string = `${process.env.NEXT_PUBLIC_BASE_API_URL}${process.env.NEXT_PUBLIC_API_ALL_REMARKS}`;
    return await api.get(request_url, {
        params: type ? {
            "building": buildingId,
            "student-on-tour": studentOnTourId,
            "type": type
        } : {
            "building": buildingId,
            "student-on-tour": studentOnTourId
        }
    });
}

export async function getAllRemarksOfStudentOnTour(studentOnTourId: number, type: "AA" | "BI" | "VE" | "OP" | null = null) {
    const request_url: string = `${process.env.NEXT_PUBLIC_BASE_API_URL}${process.env.NEXT_PUBLIC_API_ALL_REMARKS}`;
    return await api.get(request_url, {
        params: type ? {
            "student-on-tour": studentOnTourId,
            "type": type
        } : {
            "student-on-tour": studentOnTourId
        }
    });
}
