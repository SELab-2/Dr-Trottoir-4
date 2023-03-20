import BaseHeader from "@/components/header/BaseHeader";
import styles from "styles/Login.module.css";
import Image from "next/image";
import filler_logo from "../public/filler_logo.png";
import Link from "next/link";
import login from "../lib/login";
import { FormEvent, useContext, useState } from "react";
import { useRouter } from "next/router";
import AuthContext from "@/context/AuthProvider";

export default function Login() {
    let { loginUser } = useContext(AuthContext);

    const router = useRouter();
    const [username, setUsername] = useState<string>("");
    const [password, setPassword] = useState<string>("");

    const handleSubmit = async (event: FormEvent): Promise<void> => {
        event.preventDefault();
        try {
            await login(username, password, router, loginUser);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <>
            <BaseHeader />
            <div className={styles.main_container}>
                <div className={styles.filler_container}>
                    <Image src={filler_logo} alt="My App Logo" className={styles.filler_image} />
                </div>
                <div className={styles.login_container}>
                    <p className={styles.title}>Login.</p>
                    <form onSubmit={handleSubmit}>
                        <label className={styles.text} htmlFor="email">
                            E-mailadres:
                        </label>
                        <input
                            type="text"
                            className={styles.input}
                            value={username}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
                        />
                        <label className={styles.text} htmlFor="password">
                            Wachtwoord:
                        </label>
                        <input
                            type="password"
                            className={styles.input}
                            value={password}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                            required
                        />
                        <button className={styles.button} type="submit">
                            Login
                        </button>
                    </form>
                    <p className={styles.text}>
                        <Link href="/reset-password">
                            <u>Forgot Password</u>
                        </Link>
                    </p>
                    <p className={styles.text}>
                        Don't have an account?{" "}
                        <Link href="/signup">
                            <u>Sign up here</u>
                        </Link>
                    </p>
                </div>
            </div>
        </>
    );
}
