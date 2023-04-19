import {AxiosResponse} from "axios";
import api from "@/lib/api/axios";

export interface PictureOfRemarkInterface {
    id: number;
    picture: string;
    remark_at_building: number;
}

export async function getPictureOfRemarkOfSpecificRemark(remarkId: number): Promise<AxiosResponse<any>> {
    const request_url: string = `${process.env.NEXT_PUBLIC_BASE_API_URL}${process.env.NEXT_PUBLIC_API_PICTURES_OF_A_REMARK}${remarkId}`;
    return await api.get(request_url);
}


export async function postPictureOfRemark(picture: File, remarkId: number): Promise<AxiosResponse<any>> {
    const formdata = new FormData();
    formdata.set("picture", picture);
    formdata.set("remark_at_building", remarkId.toString());
    const post_url: string = `${process.env.NEXT_PUBLIC_BASE_API_URL}${process.env.NEXT_PUBLIC_API_PICTURE_OF_REMARK}`;
    return await api.post(post_url, formdata, {
        headers: {"Content-Type": "multipart/form-data"},
    });
}

