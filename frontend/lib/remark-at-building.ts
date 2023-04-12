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

export function translateRemartAtBuildingType(type: RemarkAtBuildingInterface["type"]) {
    switch (type) {
        case "AA":
            return "Aankomst";
        case "BI":
            return "Binnen";
        case "VE":
            return "Vertrek";
        case "OP":
            return "Opmerking";
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








