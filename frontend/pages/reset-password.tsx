import {useRouter} from "next/router";
import React, {FormEvent, useState} from "react";
import BaseHeader from "@/components/header/BaseHeader";
import styles from "@/styles/Login.module.css";
import Image from "next/image";
import filler_logo from "@/public/filler_logo.png";
import Link from "next/link";
import reset from "@/lib/reset";

export default function ResetPassword() {
    const router = useRouter();
    const [email, setEmail] = useState<string>("");

    const handleSubmit = async (event:FormEvent) => {
        event.preventDefault();
        try {
          await reset(email, router);
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
                    <p className={styles.text}>Enter your e-mail in order to find your account</p>
                    <br/>
                    <form onSubmit={handleSubmit}>
                        <label className={styles.text} htmlFor="email">E-mailadres:</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            className={styles.input}
                            value={email}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                            required/>

                        <button className={styles.button} type="submit">Confirm</button>
                    </form>
                    <p className={styles.text}>Already have an account? <Link href="/login"><u>Log in here</u></Link></p>
                </div>
            </div>
        </>
  );
}