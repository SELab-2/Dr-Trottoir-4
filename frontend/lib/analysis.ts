import {AxiosResponse} from "axios";
import {formatDate} from "@/lib/date";
import api from "@/lib/api/axios";

export async function getWorkedHours(startDate: Date, endDate: Date, region: number | null = null): Promise<AxiosResponse<any>> {
    let params: { [key: string]: string | number } = {start_date: formatDate(startDate), end_date: formatDate(endDate)};
    if (region) {
        params["region_id"] = region;
    }
    const get_url: string = `${process.env.NEXT_PUBLIC_BASE_API_URL}${process.env.NEXT_PUBLIC_API_ANALYSIS_WORKED_HOURS}`;
    return await api.get(get_url, {
        params
    });
}