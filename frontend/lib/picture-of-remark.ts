import api from "@/lib/api/axios";
import {AxiosResponse} from "axios";


export async function postPictureOfRemark(picture: File, remarkId: number): Promise<AxiosResponse<any>> {
    const formdata = new FormData();
    formdata.set("picture", picture);
    formdata.set("remark_at_building", remarkId.toString());
    const post_url: string = `${process.env.NEXT_PUBLIC_BASE_API_URL}${process.env.NEXT_PUBLIC_API_PICTURE_OF_REMARK}`;
    return await api.post(post_url, formdata, {
        headers: {"Content-Type": "multipart/form-data"},
    });
}