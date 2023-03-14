import {useRouter} from "next/router";
import React, {FormEvent, useState} from "react";
import BaseHeader from "@/components/header/BaseHeader";
import styles from "@/styles/Login.module.css";
import Image from "next/image";
import filler_logo from "@/public/filler_logo.png";
import Link from "next/link";
import {SignUp} from "@/types.d";
import signup from "@/lib/signup";
import login from "@/lib/login";


export default function Signup() {
    const router = useRouter();
    const [firstname, setFirstname] = useState<string>("");
    const [lastname, setLastname] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [password1, setPassword1] = useState<string>("");
    const [password2, setPassword2] = useState<string>("");


    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        try {
            await signup(firstname, lastname, email, password1, password2, router);
        } catch (error) {
            console.error(error);
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
                        <input
                            type="text"
                            id="firstname"
                            name="firstname"
                            className={styles.input}
                            value={firstname}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFirstname(e.target.value)}
                            required/>

                        <label className={styles.text} htmlFor="lastname">Naam:</label>
                        <input
                            type="text"
                            id="lastname"
                            name="lastname"
                            className={styles.input}
                            value={lastname}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLastname(e.target.value)}
                            required/>

                        <label className={styles.text} htmlFor="email">E-mailadres:</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            className={styles.input}
                            value={email}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                            required/>

                        <label className={styles.text} htmlFor="password">Wachtwoord:</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            className={styles.input}
                            value={password1}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword1(e.target.value)}
                            required/>

                        <label className={styles.text} htmlFor="confirm_password">Bevestig wachtwoord:</label>
                        <input
                            type="password"
                            id="confirm_password"
                            name="confirm_password"
                            className={styles.input}
                            value={password2}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword2(e.target.value)}
                            required/>

                        <button className={styles.button} type="submit">Sign up</button>
                    </form>
                    <p className={styles.text}>Already have an account? <Link href="/login"><u>Log in here</u></Link></p>
                </div>
            </div>
        </>
  );
}