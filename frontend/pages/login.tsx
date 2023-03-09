import BaseHeader from "@/components/header/BaseHeader";
import styles from "styles/Login.module.css"
import Image from "next/image";
import filler_logo from "../public/filler_logo.png"
import Link from "next/link";
import login from "lib/auth";
import {Router} from "next/router";
import {FormEvent} from "react";

export default function Login() {
    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();

        const form = event.target as HTMLFormElement;

        const data = {
            email: form.email.value as string,
            password: form.password.value as string,
        }

        const JSONdata = JSON.stringify(data); // Might want to change this so we hash the password locally
        //"http://" + process.env.NEXT_PUBLIC_HOST_API + ":" + process.env.NEXT_PUBLIC_HOST_PORT + "/user/login/";
        const endpoint = "http://localhost:2002/user/login/";

        // try and authenticate
        const response = await fetch(endpoint, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSONdata,
        });

        if (response.status != 200) { // authentication failed
            throw new Error(await response.text());
        }

        // authentication was successful
        const result = await response.json();
        alert(`Is this your username and password: ${result.data}`);
        // await Router.push("/welcome");
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
                        <label htmlFor="email">E-mailadres:</label>
                        <input type="text" id="email" name="email" required/>
                        <label htmlFor="password">Wachtwoord:</label>
                        <input type="text" id="password" name="password" required/>
                        <button type="submit">Login</button>
                    </form>

                    {/*<p className={styles.title}>Login.</p>*/}
                    {/*<p className={styles.text}>E-mailadres:</p>*/}
                    {/*<input id="user" className={styles.input} type={"text"}/>*/}
                    {/*<br/>*/}
                    {/*<p className={styles.text}>Wachtwoord:</p>*/}
                    {/*<input id="password" className={styles.input} type={"password"}/>*/}
                    {/*<Link href={"/welcome"}>*/}
                    {/*    <button onClick={(e) => login()} className={styles.button}>Login</button>*/}
                    {/*</Link>*/}
                </div>
            </div>
        </>
    )
}