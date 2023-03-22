import {useRouter} from "next/router";
import React, {FormEvent, useState} from "react";
import BaseHeader from "@/components/header/BaseHeader";
import styles from "@/styles/Login.module.css";
import Image from "next/image";
import fire from "@/public/fire_image.png";
import signup from "@/lib/signup";

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
                                    <Image src={fire} alt="My App Logo" className={styles.filler_image}/>
                                </div>
                                <div className="col-md-6 col-lg-7 d-flex align-items-center">
                                    <div className="card-body p-4 p-lg-5 text-black">
                                        <form onSubmit={handleSubmit}>

                                            <div className="d-flex align-items-center mb-3 pb-1">
                                                <i className="fas fa-cubes fa-2x me-3"/>
                                                <span className="h1 fw-bold mb-0">Sign up.</span>
                                            </div>

                                            <div className="form-outline mb-4">
                                                <label className="form-label">Voornaam</label>
                                                <input type="text"
                                                       className={`form-control form-control-lg ${styles.input}`}
                                                       value={firstname}
                                                       onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFirstname(e.target.value)}
                                                       required
                                                />
                                            </div>

                                            <div className="form-outline mb-4">
                                                <label className="form-label">Achternaam</label>
                                                <input type="text"
                                                       className={`form-control form-control-lg ${styles.input}`}
                                                       value={lastname}
                                                       onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLastname(e.target.value)}
                                                       required
                                                />
                                            </div>

                                            <div className="form-outline mb-4">
                                                <label className="form-label">E-mailadres</label>
                                                <input type="email"
                                                       className={`form-control form-control-lg ${styles.input}`}
                                                       value={email}
                                                       onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                                                       required
                                                />
                                            </div>

                                            <div className="form-outline mb-4">
                                                <label className="form-label">Wachtwoord</label>
                                                <input type="password"
                                                       className={`form-control form-control-lg ${styles.input}`}
                                                       value={password1}
                                                       onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword1(e.target.value)}
                                                       required/>
                                            </div>

                                            <div className="form-outline mb-4">
                                                <label className="form-label">Bevestig wachtwoord</label>
                                                <input type="password"
                                                       className={`form-control form-control-lg ${styles.input}`}
                                                       value={password2}
                                                       onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword2(e.target.value)}
                                                       required/>
                                            </div>

                                            <div className="pt-1 mb-4">
                                                <button className={`btn btn-dark btn-lg btn-block ${styles.button}`}
                                                        type="submit">Sign up
                                                </button>
                                            </div>

                                            <p className="mb-5 pb-lg-2">Heb je al een account? <a href="/login"
                                            >Ga naar login</a></p>
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
