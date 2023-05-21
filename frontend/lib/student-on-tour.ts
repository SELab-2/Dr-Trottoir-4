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

export async function patchBulkStudentOnTour(data : any) {
    //TODO to right format
    const request_url: string = `${process.env.NEXT_PUBLIC_BASE_API_URL}${process.env.NEXT_PUBLIC_API_BULK_STUDENT_ON_TOUR}`;
    return await api.patch(request_url, JSON.stringify(data),
        {
            headers: {"Content-Type": "application/json"},
        }
    );
}

export async function duplicateStudentOnTourSchedule(startDatePeriod: string, endDatePeriod: string, startDateCopy: string) {
    let data: { [name: string]: string } = {
        start_date_period: startDatePeriod,
        end_date_period: endDatePeriod,
        start_date_copy: startDateCopy
    };
    const post_url: string = `${process.env.NEXT_PUBLIC_BASE_API_URL}${process.env.NEXT_PUBLIC_API_BULK_STUDENT_ON_TOUR_DUPLICATE}`;
    return await api.post(post_url, data,
        {
            headers: {"Content-Type": "application/json"},
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
    () => {}
  );
}

export async function getActualToursOfStudent(
    studentId: number,
    params: DateInterval | null = null
  ): Promise<AxiosResponse<Tour[]>> {
    try {
        // Fetch all StudentOnTour for the given student
        const studentOnToursResponse = await getToursOfStudent(studentId, params);
    
        // Create a Set to store unique tour values
        const uniqueTourIds = new Set(studentOnToursResponse.data.map((studentOnTour: StudentOnTour) => studentOnTour.tour));
    
        // Get actual Tour for each unique tour id
        const toursPromises = Array.from(uniqueTourIds).map((tourId: unknown) =>
          getTour(tourId as number)
        );
    
        // Wait for all Tour fetch Promises to resolve
        const toursResponses = await Promise.all(toursPromises);
    
        // Extract the Tour data from each response
        const tourData = toursResponses.map(tourResponse => tourResponse.data);
    
        // Return a single AxiosResponse with the tour data
        return { 
          data: tourData,
          status: 200,
          statusText: 'OK',
          headers: studentOnToursResponse.headers,
          config: studentOnToursResponse.config,
       };
    
      } catch (err) {
        throw err;
      }
  }


  export function getStudentOnTourIndividualProgressWS(studentOnTourId: number) {
    const url: string = `${process.env.NEXT_PUBLIC_WEBSOCKET_URL}${process.env.NEXT_PUBLIC_WEBSOCKET_STUDENT_ON_TOUR_BASE}${studentOnTourId}/progress/`;
    return new WebSocket(url);
}

export function getStudentOnTourAllProgressWS() {
    const url: string = `${process.env.NEXT_PUBLIC_WEBSOCKET_URL}${process.env.NEXT_PUBLIC_WEBSOCKET_STUDENT_ON_TOUR_PROGRESS_ALL}`;
    return new WebSocket(url);
}

export function getStudentOnTourIndividualRemarkWS(studentOnTourId: number) {
    const url: string = `${process.env.NEXT_PUBLIC_WEBSOCKET_URL}${process.env.NEXT_PUBLIC_WEBSOCKET_STUDENT_ON_TOUR_BASE}${studentOnTourId}/remarks/`;
    return new WebSocket(url);
}




/**
 * When a student-on-tour is posted or patched, this websocket returns the patched/posted object
 */
export function getAllStudentOnTourChanges() : WebSocket {
    const url: string = `${process.env.NEXT_PUBLIC_WEBSOCKET_URL}${process.env.NEXT_PUBLIC_WEBSOCKET_ALL_STUDENT_ON_TOUR}`;
    return new WebSocket(url);
}