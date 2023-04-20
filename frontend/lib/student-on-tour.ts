import {AxiosResponse} from "axios";
import api from "@/lib/api/axios";
import {DateInterval, getFromDate} from "@/lib/date";

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

export async function postStudentOnTour(tour: number, student: number, date: string): Promise<AxiosResponse<any>> {
    const request_url: string = `${process.env.NEXT_PUBLIC_BASE_API_URL}${process.env.NEXT_PUBLIC_API_STUDENT_ON_TOUR}`;
    return await api.post(request_url, JSON.stringify({tour, student, date}),
        {
            headers: {"Content-Type": "application/json"},
        }
    );
}


export async function getStudentOnTour(studentOnTourId: number) {
    const request_url: string = `${process.env.NEXT_PUBLIC_BASE_API_URL}${process.env.NEXT_PUBLIC_API_STUDENT_ON_TOUR}${studentOnTourId}`;
    return await api.get(request_url);
}

/**
 * Get all the studentOnTour-objects from a student with a possible date interval.
 * @param studentId the id of the student
 * @param params the start- & enddate
 */
export async function getToursOfStudent(studentId: number, params: DateInterval | null = null): Promise<AxiosResponse<any>> {
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
