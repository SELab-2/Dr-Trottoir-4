import {AxiosResponse} from "axios";
import api from "@/lib/api/axios";

export default async function getStudentOnTour(studentId: number, params: { startDate: Date, endDate: Date } | null = null): Promise<AxiosResponse<any>> {
    const request_url: string = `${process.env.NEXT_PUBLIC_BASE_API_URL}${process.env.NEXT_PUBLIC_API_TOURS_OF_STUDENT}${studentId}`;
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

export function formatDate(date: Date): string {
    const y = date.getFullYear();
    const m = (date.getMonth() + 1).toString().padStart(2, "0");
    const d = date.getDate().toString().padStart(2, "0");
    return `${y}-${m}-${d}`;
}