import {useRouter} from "next/router";
import {FormEvent} from "react";
import BaseHeader from "@/components/header/BaseHeader";
import styles from "@/styles/Login.module.css";
import Image from "next/image";
import filler_logo from "@/public/filler_logo.png";
import Link from "next/link";

export default function ResetPassword() {
    const router = useRouter();

    const handleSubmit = async (event:FormEvent) => {
        event.preventDefault();

        const form = event.target as HTMLFormElement;

        const data = {
            email: form.email.value as string,
        }

        const JSONdata = JSON.stringify(data);

        const endpoint = "http://" + process.env.NEXT_PUBLIC_API_HOST + ":" + process.env.NEXT_PUBLIC_API_PORT
            + process.env.NEXT_PUBLIC_API_RESET_PASSWORD;

        const response = await fetch(endpoint, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSONdata,
        });

        if (response.status != 200) {
            throw Error(await response.text());
        } else {
            alert("A password reset e-mail has been sent to the provided e-mail address");
        }
    }

    return (
        <>
            <BaseHeader/>
            <div className={styles.main_container}>
                <div className={styles.filler_container}>
                    <Image src={filler_logo} alt="My App Logo" className={styles.filler_image}/>
                </div>
                <div className={styles.login_container}>
                    <p className={styles.text}>Enter your e-mail in order to find your account</p>
                    <br/>
                    <form onSubmit={handleSubmit}>
                        <label className={styles.text} htmlFor="email">E-mailadres:</label>
                        <input className={styles.input} type="email" id="email" name="email" required/>

                        <button className={styles.button} type="submit">Confirm</button>
                    </form>
                    <p className={styles.text}>Already have an account? <Link href="/login"><u>Log in here</u></Link></p>
                </div>
            </div>
        </>
  );
}