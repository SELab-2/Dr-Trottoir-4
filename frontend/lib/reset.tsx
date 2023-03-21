import { Reset_Password } from "@/types.d";
import { NextRouter } from "next/router";
import api from "@/pages/api/axios";

const reset = async (email: string, router: NextRouter): Promise<void> => {
    const host = `${process.env.NEXT_PUBLIC_BASE_API_URL}${process.env.NEXT_PUBLIC_API_RESET_PASSWORD}`;
    const reset_data: Reset_Password = {
        email: email,
    };


    api.post(host, reset_data, {
        headers: { "Content-Type": "application/json" },
    })
        .then((response: { status: number }) => {
            if (response.status == 200) {
                alert("A password reset e-mail has been sent to the provided e-mail address");
                router.push("/login");
            }
        })
        .catch((error) => {
            console.error(error);
        });
};

export default reset;
