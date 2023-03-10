import {useRouter} from "next/router";
import {FormEvent} from "react";
import BaseHeader from "@/components/header/BaseHeader";
import styles from "@/styles/Login.module.css";
import Image from "next/image";
import filler_logo from "@/public/filler_logo.png";
import Link from "next/link";

export default function Signup() {
    const router = useRouter();

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();

        const form = event.target as HTMLFormElement;

        const data = {
            firstname: form.firstname.value as string,
            lastname: form.lastname.value as string,
            email: form.email.value as string,
            password1: form.password.value as string,
            password2: form.confirm_password.value as string,
        }

        // check if passwords match
        if (data.password1 !== data.password2) {
            alert("Passwords do not match");
            return;
        }

         const JSONdata = JSON.stringify(data); // Might want to change this, so we hash the password locally

        const endpoint = "http://" + process.env.NEXT_PUBLIC_API_HOST + ":" + process.env.NEXT_PUBLIC_API_PORT + process.env.NEXT_PUBLIC_API_SIGNUP;

        const response = await fetch(endpoint, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSONdata,
        });

        if (response.status != 201) { // authentication failed
            throw Error(await response.text());
            // await response.text() -> contains error message
            // alert("Failed to create account");
        } else {
            // authentication was successful, so go to the welcome page
            alert("Succesfully created account");
            await router.push("/login");
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
                        <label className={styles.text} htmlFor="firstname">Voornaam:</label>
                        <input className={styles.input} type="text" id="firstname" name="firstname" required/>

                        <label className={styles.text} htmlFor="lastname">Naam:</label>
                        <input className={styles.input} type="text" id="lastname" name="lastname" required/>

                        <label className={styles.text} htmlFor="email">E-mailadres:</label>
                        <input className={styles.input} type="email" id="email" name="email" required/>

                        <label className={styles.text} htmlFor="password">Wachtwoord:</label>
                        <input className={styles.input} type="password" id="password" name="password" required/>

                        <label className={styles.text} htmlFor="confirm_password">Bevestig wachtwoord:</label>
                        <input className={styles.input} type="password" id="confirm_password" name="confirm_password" required/>

                        <button className={styles.button} type="submit">Sign up</button>
                    </form>
                    <p className={styles.text}>Already have an account? <Link href="/login"><u>Log in here</u></Link></p>
                </div>
            </div>
        </>
  );
}