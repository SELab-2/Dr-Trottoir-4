import {Reset_Password} from "@/types.d";

const reset = async (email: string, router: any): Promise<void> => {

    const host = `${process.env.NEXT_PUBLIC_BASE_API_URL}${process.env.NEXT_PUBLIC_API_RESET_PASSWORD}`
    const reset_data: Reset_Password = {
        email: email,
    }

    try {
        // Request without axios because no authentication is needed for this POST request
        const response = await fetch(host, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(reset_data),
        });

        if (response.status == 200) {
            alert("A password reset e-mail has been sent to the provided e-mail address");
            await router.push('/login');
        }
    } catch (error) {
        console.error(error);
    }
}

export default reset;