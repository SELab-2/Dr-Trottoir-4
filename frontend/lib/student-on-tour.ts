import {AxiosResponse} from "axios";
import api from "@/lib/api/axios";

export interface StudentOnTour {
    id: number;
    tour: number;
    date: Date;
    student: number;
}

export interface StudentOnTourStringDate {
    id: number;
    tour: number;
    date: string;
    student: number;
}

export interface DateInterval {
    startDate: Date;
    endDate: Date;
}

async function getFromDate(request_url: string, params: DateInterval | null = null) {
    if (!params) {
        return await api.get(request_url);
    }
    return await api.get(request_url, {
        params: {
            "start-date": formatDate(params.startDate),
            "end-date": formatDate(params.endDate)
        }
    })
}

export default async function getStudentOnTour(studentId: number, params: DateInterval | null = null): Promise<AxiosResponse<any>> {
    const request_url: string = `${process.env.NEXT_PUBLIC_BASE_API_URL}${process.env.NEXT_PUBLIC_API_TOURS_OF_STUDENT}${studentId}`;
    return getFromDate(request_url, params);
}

export async function getAllStudentOnTourFromDate(params: DateInterval | null = null): Promise<AxiosResponse<any>> {
    const request_url: string = `${process.env.NEXT_PUBLIC_BASE_API_URL}${process.env.NEXT_PUBLIC_API_ALL_STUDENT_ON_TOURS}`;
    return getFromDate(request_url, params);
}

export async function getAllStudentOnTourFromToday() {
    const date = new Date();
    return getAllStudentOnTourFromDate({startDate: date, endDate: date});
}

// TODO this will be fully implemented once the required endpoint for it exists
export async function getProgress(studentOnTourId: number){
    const request_url = "";
    return 0.5;
}

export function formatDate(date: Date): string {
    const y = date.getFullYear();
    const m = (date.getMonth() + 1).toString().padStart(2, "0");
    const d = date.getDate().toString().padStart(2, "0");
    return `${y}-${m}-${d}`;
}

/**
 * Returns true if the dates are equal, so year, month & day is equal.
 */
export function datesEqual(date1: Date, date2: Date) {
    const yearsEqual: boolean = date1.getFullYear() === date2.getFullYear();
    const monthsEqual: boolean = date1.getMonth() === date2.getMonth();
    const daysEqual: boolean = date1.getDate() === date2.getDate();
    return yearsEqual && monthsEqual && daysEqual;
}