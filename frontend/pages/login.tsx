import BaseHeader from "@/components/header/BaseHeader";
import styles from "styles/Login.module.css"
import Image from "next/image";
import filler_logo from "../public/filler_logo.png"
import Link from "next/link";
import {useRouter} from "next/router";
import {FormEvent} from "react";

export default function Login() {

    const router = useRouter();

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();

        const form = event.target as HTMLFormElement;

        const data = {
            email: form.email.value as string,
            password: form.password.value as string,
        }

        const JSONdata = JSON.stringify(data); // Might want to change this, so we hash the password locally
        const endpoint = "http://" + process.env.NEXT_PUBLIC_API_HOST + ":" + process.env.NEXT_PUBLIC_API_PORT + process.env.NEXT_PUBLIC_API_LOGIN;

        // try and authenticate
        const response = await fetch(endpoint, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSONdata,
        });

        if (response.status != 200) { // authentication failed
            // await response.text() -> contains error message
            alert("Invalid credentials. Please try again.");
        } else {
            // authentication was successful, so go to the welcome page
            await router.push("/welcome");
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
                    <form onSubmit={handleSubmit}>
                        <label className={styles.text} htmlFor="email">E-mailadres:</label>
                        <input className={styles.input} type="email" id="email" name="email" required/>
                        <label className={styles.text} htmlFor="password">Wachtwoord:</label>
                        <input className={styles.input} type="password" id="password" name="password" required/>
                        <button className={styles.button} type="submit">Login</button>
                    </form>
                    <p className={styles.text}><Link href="/reset-password"><u>Forgot Password</u></Link></p>
                    <p className={styles.text}>Don't have an account? <Link href="/signup"><u>Sign up here</u></Link></p>
                </div>
            </div>
        </>
    )
}