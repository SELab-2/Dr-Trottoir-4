import BaseHeader from "@/components/header/BaseHeader";
import styles from "styles/Login.module.css"
import Image from "next/image";
import filler_logo from "../public/filler_logo.png"

function Login() {
    return (
        <>
            <BaseHeader/>
            <div className={styles.main_container}>
                <div className={styles.filler}>
                    <Image src={filler_logo} alt="My App Logo" className={styles.filler_image}/>
                </div>
                <div className={styles.login_container}>
                    <p className={styles.login_title}>Login.</p>
                    <p className={styles.login_text}>E-mailadres:</p>
                    <input className={styles.login_input} type={"text"}/>
                    <br/>
                    <p className={styles.login_text}>Wachtwoord:</p>
                    <input className={styles.login_input} type={"password"}/>
                    <button className={styles.login_button}>Login</button>
                </div>
            </div>
        </>
    )
}

export default Login