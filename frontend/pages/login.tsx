import BaseHeader from "@/components/header/BaseHeader";
import styles from "styles/Login.module.css"
import Image from "next/image";
import filler_logo from "../public/filler_logo.png"
import Link from "next/link";


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
                    <input className={styles.input} type={"text"}/>
                    <br/>
                    <p className={styles.text}>Wachtwoord:</p>
                    <input className={styles.input} type={"password"}/>
                    <Link href={"/welcome"}>
                        <button className={styles.button}>Login</button>
                    </Link>
                </div>
            </div>
        </>
    )
}

export default Login