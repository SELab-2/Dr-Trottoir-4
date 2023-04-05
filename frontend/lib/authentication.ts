import api from "@/lib/api/axios";

export async function verifyToken() {
    const post_url : string = `${process.env.NEXT_PUBLIC_BASE_API_URL}${process.env.NEXT_PUBLIC_API_VERIFY_TOKEN}`;
    return await api.post(post_url);
}