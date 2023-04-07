import {AxiosResponse} from "axios";
import api from "@/lib/api/axios";

// The types of remarks
export const remarkTypes = {
    arrival: "AA", // Aankomst
    inside: "BI", // binnen
    leaving: "VE", // vertrek
    remark: "OP" // opmerking
}

export async function getAllRemarksAtBuilding(): Promise<AxiosResponse<any>> {
    const request_url: string = `${process.env.NEXT_PUBLIC_BASE_API_URL}${process.env.NEXT_PUBLIC_API_ALL_REMARKS}`;
    return await api.get(request_url);
}

export async function postRemarkAtBuilding(buildingId: number, studentOnTourId: number, remark: string, time: Date, remarkType: string): Promise<AxiosResponse<any>> {
    const post_url: string = `${process.env.NEXT_PUBLIC_BASE_API_URL}${process.env.NEXT_PUBLIC_API_REMARK_AT_BUILDING}`;
    const data = {
        building: buildingId,
        student_on_tour: studentOnTourId,
        remark: remark,
        timestamp: convertDateToCorrectString(time),
        type: remarkType
    };
    console.log(data);
    return await api.post(post_url, JSON.stringify(data), {
        headers: {"Content-Type": "application/json"},
    });
}

function convertDateToCorrectString(date : Date) : string {

    // Get the ISO string for the date object
    const isoString = date.toISOString();

    // Get the timezone offset in minutes
    const offsetMinutes = date.getTimezoneOffset();

    // Convert the offset to a string in the format +/-HH:MM
    const offsetHours = Math.floor(Math.abs(offsetMinutes) / 60);
    const offsetMinutesStr = ('0' + Math.abs(offsetMinutes) % 60).slice(-2);
    const offsetStr = (offsetMinutes < 0 ? '+' : '-') + offsetHours + ':' + offsetMinutesStr;

    // Combine the ISO string and the offset string, remove the miliseconds part
    return isoString.slice(0, -5) + offsetStr;
}