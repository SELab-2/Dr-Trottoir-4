import { AxiosResponse } from "axios";
import api from "@/lib/api/axios";
import { DateInterval, getFromDate } from "@/lib/date";
import { stringify } from "querystring";
import { getTour, Tour } from "./tour";

export interface StudentOnTour {
  id: number;
  tour: number;
  date: Date;
  student: number;
  completed_tour: string | null;
  started_tour: string | null;
  max_building_index: number;
  current_building_index: number;
}

export interface StudentOnTourStringDate {
  id: number;
  tour: number;
  date: string;
  student: number;
  completed_tour: string | null;
  started_tour: string | null;
  max_building_index: number;
  current_building_index: number;
}

export interface StudentOnTourPost {
  tour: number;
  student: number;
  date: string;
}

export async function postStudentOnTour(
  tour: number,
  student: number,
  date: string
): Promise<AxiosResponse<any>> {
  const request_url: string = `${process.env.NEXT_PUBLIC_BASE_API_URL}${process.env.NEXT_PUBLIC_API_STUDENT_ON_TOUR}`;
  return await api.post(request_url, JSON.stringify({ tour, student, date }), {
    headers: { "Content-Type": "application/json" },
  });
}

export async function patchStudentOnTour(
  id: number,
  tour: number,
  student: number,
  date: string
) {
  const request_url: string = `${process.env.NEXT_PUBLIC_BASE_API_URL}${process.env.NEXT_PUBLIC_API_STUDENT_ON_TOUR}${id}`;
  return await api.patch(request_url, JSON.stringify({ tour, student, date }), {
    headers: { "Content-Type": "application/json" },
  });
}

export async function deleteStudentOnTour(id: number) {
  const request_url: string = `${process.env.NEXT_PUBLIC_BASE_API_URL}${process.env.NEXT_PUBLIC_API_STUDENT_ON_TOUR}${id}`;
  return await api.delete(request_url);
}

export async function postBulkStudentOnTour(data: StudentOnTourPost[]) {
  const request_url: string = `${process.env.NEXT_PUBLIC_BASE_API_URL}${process.env.NEXT_PUBLIC_API_BULK_STUDENT_ON_TOUR}`;
  return await api.post(request_url, JSON.stringify({ data: data }), {
    headers: { "Content-Type": "application/json" },
  });
}

export async function patchBulkStudentOnTour(data: any) {
  //TODO to right format
  const request_url: string = `${process.env.NEXT_PUBLIC_BASE_API_URL}${process.env.NEXT_PUBLIC_API_BULK_STUDENT_ON_TOUR}`;
  return await api.patch(request_url, JSON.stringify(data), {
    headers: { "Content-Type": "application/json" },
  });
}

export async function deleteBulkStudentOnTour(data: number[]) {
  const request_url: string = `${process.env.NEXT_PUBLIC_BASE_API_URL}${process.env.NEXT_PUBLIC_API_BULK_STUDENT_ON_TOUR}`;
  return await api.delete(request_url, { data: { ids: data } });
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
export async function getToursOfStudent(
  studentId: number,
  params: DateInterval | null = null
): Promise<AxiosResponse<any>> {
  const request_url: string = `${process.env.NEXT_PUBLIC_BASE_API_URL}${process.env.NEXT_PUBLIC_API_TOURS_OF_STUDENT}${studentId}`;
  return getFromDate(request_url, params);
}

export async function getAllStudentOnTourFromDate(
  params: DateInterval | null = null
): Promise<AxiosResponse<any>> {
  const request_url: string = `${process.env.NEXT_PUBLIC_BASE_API_URL}${process.env.NEXT_PUBLIC_API_ALL_STUDENT_ON_TOURS}`;
  return getFromDate(request_url, params);
}

export async function getAllStudentOnTourFromToday() {
  const date = new Date();
  return getAllStudentOnTourFromDate({ startDate: date, endDate: date });
}

export async function getStudentOnTourProgress(studentOnTourId: number) {
  const request_url: string = `${process.env.NEXT_PUBLIC_BASE_API_URL}${process.env.NEXT_PUBLIC_API_STUDENT_ON_TOUR}${studentOnTourId}/progress/`;
  return await api.get(request_url);
}

export async function startStudentOnTour(studentOnTourId: number) {
  const post_url: string = `${process.env.NEXT_PUBLIC_BASE_API_URL}${process.env.NEXT_PUBLIC_API_STUDENT_ON_TOUR}${studentOnTourId}/start/`;
  return await api.post(post_url);
}

export async function endStudentOnTour(studentOnTourId: number) {
  const post_url: string = `${process.env.NEXT_PUBLIC_BASE_API_URL}${process.env.NEXT_PUBLIC_API_STUDENT_ON_TOUR}${studentOnTourId}/end/`;
  return await api.post(post_url);
}

export function studentOnTourSearchString(studentOnTour: StudentOnTour) {
  getTour(studentOnTour.tour).then(
    (res) => {
      const tour: Tour = res.data;
      return `${tour.name} (${studentOnTour.date})`;
    },
    (err) => {
      console.error(err);
    }
  );
}

// export async function getToursOfStudent(studentId: number, params: DateInterval | null = null): Promise<AxiosResponse<any>> {
//     await getToursOfStudent(studentId, params).then(
//         async (res) => {
//             const tourDates: Record<number, string[]> = {};
//             const data: StudentOnTourStringDate[] = res.data;
//             for (const sot of data) {
//                 if (!tourDates[sot.tour]) {
//                     tourDates[sot.tour] = [];
//                 }
//                 tourDates[sot.tour].push(sot.date);
//             }
//         },
//         (err) => {
//             console.error(err);
//         }
//     )
// }

