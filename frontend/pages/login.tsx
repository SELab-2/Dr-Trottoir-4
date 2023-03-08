import BaseHeader from "@/components/header/BaseHeader";
import styles from "styles/Login.module.css"
import Image from "next/image";
import filler_logo from "../public/filler_logo.png"
import Link from "next/link";
import {Router} from "next/router";

const loginApi = async (username: string, password: string): Promise<void> => {
  const resp = await fetch("/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user, password }),
  });
  if (resp.status !== 200) {
    throw new Error(await resp.text());
  }
  // @ts-ignore
    Router.push("/welcome");
};

function Login() {
    return (
        <>
            <BaseHeader/>
            <div className={styles.main_container}>
                <div className={styles.filler_container}>
                    <Image src={filler_logo} alt="My App Logo" className={styles.filler_image}/>
                </div>
                <div className={styles.login_container}>
                    <p className={styles.title}>Login.</p>
                    <p className={styles.text}>E-mailadres:</p>
                    <input id="user" className={styles.input} type={"text"}/>
                    <br/>
                    <p className={styles.text}>Wachtwoord:</p>
                    <input id="password" className={styles.input} type={"password"}/>
                    <Link href={"/welcome"}>
                        <button className={styles.button}>Login</button>
                    </Link>
                </div>
            </div>
        </>
    )
}

export default Login