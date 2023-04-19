import api from "@/lib/api/axios";

export interface DateInterval {
    startDate: Date;
    endDate: Date;
}

export async function getFromDate(request_url: string, params: DateInterval | null = null) {
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

/**
 * Returns true if the dates are equal, so year, month & day is equal.
 */
export function datesEqual(date1: Date, date2: Date) {
    const yearsEqual: boolean = date1.getFullYear() === date2.getFullYear();
    const monthsEqual: boolean = date1.getMonth() === date2.getMonth();
    const daysEqual: boolean = date1.getDate() === date2.getDate();
    return yearsEqual && monthsEqual && daysEqual;
}