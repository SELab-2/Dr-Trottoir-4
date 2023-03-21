import BaseHeader from "@/components/header/BaseHeader";
import styles from "styles/Login.module.css";
import Image from "next/image";
import filler_image from "../public/filler_image.png";
import login from "../lib/login";
import {FormEvent, useState} from "react";
import {useRouter} from "next/router";

export default function Login() {
    const router = useRouter();
    const [username, setUsername] = useState<string>("");
    const [password, setPassword] = useState<string>("");

    const handleSubmit = async (event: FormEvent): Promise<void> => {
        event.preventDefault();
        try {
            await login(username, password, router);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <>
            <BaseHeader/>
            <div className="container py-5 h-100">
                <div className="row d-flex justify-content-center align-items-center h-100">
                    <div className="col col-xl-10">
                        <div className="card">
                            <div className="row g-0">
                                <div className="col-md-6 col-lg-5 d-none d-md-block">
                                    <Image src={filler_image} alt="My App Logo" className={styles.filler_image}/>
                                </div>
                                <div className="col-md-6 col-lg-7 d-flex align-items-center">
                                    <div className="card-body p-4 p-lg-5 text-black">
                                        <form onSubmit={handleSubmit}>

                                            <div className="d-flex align-items-center mb-3 pb-1">
                                                <i className="fas fa-cubes fa-2x me-3"/>
                                                <span className="h1 fw-bold mb-0">Login.</span>
                                            </div>

                                            <div className="form-outline mb-4">
                                                <label className="form-label">E-mailadres</label>
                                                <input type="email"
                                                       className={`form-control form-control-lg ${styles.input}`}
                                                       value={username}
                                                       onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
                                                />
                                            </div>

                                            <div className="form-outline mb-4">
                                                <label className="form-label">Wachtwoord</label>
                                                <input type="password"
                                                       className={`form-control form-control-lg ${styles.input}`}
                                                       value={password}
                                                       onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                                                       required/>
                                            </div>

                                            <div className="pt-1 mb-4">
                                                <button className={`btn btn-dark btn-lg btn-block ${styles.button}`} type="submit">Login
                                                </button>
                                            </div>

                                            <a className="small text-muted" href="/reset-password">Wachtwoord vergeten?</a>
                                            <p className="mb-5 pb-lg-2">Heb je nog geen account? <a href="/signup"
                                            >Registreer je hier!</a></p>
                                        </form>

                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
