import BaseHeader from "@/components/header/BaseHeader";
import styles from "styles/Login.module.css";
import Image from "next/image";
import filler_image from "../public/filler_image.png";
import {login, verifyToken} from "@/lib/login";
import React, {FormEvent, useEffect, useState} from "react";
import {useRouter} from "next/router";
import {useTranslation} from 'react-i18next';

export default function Login() {
    const {t} = useTranslation();
    const router = useRouter();
    const [username, setUsername] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [errorMessages, setErrorMessages] = useState<string[]>([]);

    // try and log in to the application using existing refresh token
    useEffect(() => {
        verifyToken().then(
            async () => {
                await router.push("/welcome");
            },
            (err) => {
                console.error(err);
            }
        );
    }, [verifyToken]);

    const handleSubmit = async (event: FormEvent): Promise<void> => {
        event.preventDefault();
        login(username, password).then(
            async () => {
                await router.push("/welcome");
            },
            (err) => {
                let errors = [];
                let errorRes = err.response;
                if (errorRes.status === 400) {
                    let data: [any, string[]][] = Object.entries(errorRes.data);
                    for (const [_, errorValues] of data) {
                        errors.push(...errorValues);
                    }
                    setErrorMessages(errors);
                } else {
                    console.error(err);
                }
            }
        );
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

                                            <div className={router.query.createdAccount ?
                                                "visible alert alert-success alert-dismissible fade show" :
                                                "invisible"}>
                                                <strong>Succes!</strong> Uw account werd met succes aangemaakt!
                                                <button type="button" className="btn-close"
                                                        data-bs-dismiss="alert"></button>
                                            </div>

                                            <div className={errorMessages.length !== 0 ?
                                                "visible alert alert-danger alert-dismissible fade show" :
                                                "invisible"}>
                                                <ul>
                                                    {errorMessages.map((err, i) => (
                                                        <li key={i}>
                                                            {t(err)}
                                                        </li>
                                                    ))}
                                                </ul>
                                                <button type="button" className="btn-close"
                                                        data-bs-dismiss="alert"></button>
                                            </div>

                                            <div className="form-outline mb-4">
                                                <label className="form-label">E-mailadres</label>
                                                <input
                                                    type="email"
                                                    className={`form-control form-control-lg ${styles.input}`}
                                                    value={username}
                                                    placeholder="naam@voorbeeld.com"
                                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                                        setUsername(e.target.value)
                                                    }
                                                />
                                            </div>

                                            <div className="form-outline mb-4">
                                                <label className="form-label">Wachtwoord</label>
                                                <input
                                                    type="password"
                                                    className={`form-control form-control-lg ${styles.input}`}
                                                    value={password}
                                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                        setPassword(e.target.value);
                                                        e.target.setCustomValidity("");
                                                    }}
                                                    onInvalid={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                        e.target.setCustomValidity("Wachtwoord is verplicht.");
                                                    }}
                                                    required
                                                    placeholder="Wachtwoord"
                                                />
                                            </div>

                                            <div className="pt-1 mb-4">
                                                <button
                                                    className={`btn btn-dark btn-lg btn-block ${styles.button}`}
                                                    type="submit"
                                                >
                                                    Login
                                                </button>
                                            </div>

                                            <a className="small text-muted" href="/reset-password">
                                                Wachtwoord vergeten?
                                            </a>
                                            <p className="mb-5 pb-lg-2">
                                                Heb je nog geen account? <a href="/signup">Registreer je hier!</a>
                                            </p>
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
