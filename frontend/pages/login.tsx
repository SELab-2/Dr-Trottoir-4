import BaseHeader from "@/components/header/BaseHeader";
import styles from "styles/Login.module.css"
import Image from "next/image";
import filler_logo from "../public/filler_logo.png"
import Link from "next/link";
import login from "lib/auth";
import {Router} from "next/router";

// const loginApi = async (username: string, password: string): Promise<void> => {
//   const resp = await fetch("/api/login", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ user, password }),
//   });
//   if (resp.status !== 200) {
//     throw new Error(await resp.text());
//   }
//   // @ts-ignore
//     Router.push("/welcome");
// };

function Login() {
    const API_BASE = "http://localhost:2002/user/login/";
    return (
        <>
            <BaseHeader/>
            <div className={styles.main_container}>
                <div className={styles.filler_container}>
                    <Image src={filler_logo} alt="My App Logo" className={styles.filler_image}/>
                </div>
                <div className={styles.login_container}>
                    <form action={API_BASE} method="post">
                        <label htmlFor="email">E-mailadres:</label>
                        <input type="text" id="email" name="email"/>
                        <label htmlFor="password">Wachtwoord:</label>
                        <input type="text" id="password" name="password"/>
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

export default Login