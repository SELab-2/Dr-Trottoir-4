import { useRouter } from "next/router";
import React, { FormEvent, useState } from "react";
import BaseHeader from "@/components/header/BaseHeader";
import styles from "@/styles/Login.module.css";
import Image from "next/image";
import fire from "@/public/fire_image.png";
import signup from "@/lib/signup";
import { useTranslation } from "react-i18next";

export default function Signup() {
    const { t } = useTranslation();
    const router = useRouter();
    const [firstname, setFirstname] = useState<string>("");
    const [lastname, setLastname] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [password1, setPassword1] = useState<string>("");
    const [password2, setPassword2] = useState<string>("");
    const [errorMessages, setErrorMessages] = useState<string[]>([]);

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        signup(firstname, lastname, email, password1, password2).then(
            async (res) => {
                if (res.status == 201) {
                    alert("Successfully created account");
                    await router.push("/login");
                }
            },
            (err) => {
                let errorRes = err.response;
                if (errorRes.status === 400) {
                    let errors = [];
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
            <BaseHeader />
            <div className="container py-5 h-100">
                <div className="row d-flex justify-content-center align-items-center h-100">
                    <div className="col col-xl-10">
                        <div className="card">
                            <div className="row g-0">
                                <div className="col-md-6 col-lg-5 d-none d-md-block">
                                    <Image src={fire} alt="My App Logo" className={styles.filler_image} />
                                </div>
                                <div className="col-md-6 col-lg-7 d-flex align-items-center">
                                    <div className="card-body p-4 p-lg-5 text-black">
                                        <form onSubmit={handleSubmit}>
                                            <div className="d-flex align-items-center mb-3 pb-1">
                                                <i className="fas fa-cubes fa-2x me-3" />
                                                <span className="h1 fw-bold mb-0">Sign up.</span>
                                            </div>

                                            <div className="help-block mb-4">
                                                <ul>
                                                    {errorMessages.map((err, i) => (
                                                        <li className="has-error text-danger" key={i}>
                                                            {t(err)}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>

                                            <div className="form-outline mb-4">
                                                <label className="form-label">Voornaam</label>
                                                <input
                                                    type="text"
                                                    className={`form-control form-control-lg ${styles.input}`}
                                                    value={firstname}
                                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                        setFirstname(e.target.value);
                                                        e.target.setCustomValidity("");
                                                    }}
                                                    onInvalid={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                        e.target.setCustomValidity("Voornaam is verplicht.");
                                                    }}
                                                    required
                                                    placeholder="Voornaam"
                                                />
                                            </div>

                                            <div className="form-outline mb-4">
                                                <label className="form-label">Achternaam</label>
                                                <input
                                                    type="text"
                                                    className={`form-control form-control-lg ${styles.input}`}
                                                    value={lastname}
                                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                        setLastname(e.target.value);
                                                        e.target.setCustomValidity("");
                                                    }}
                                                    onInvalid={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                        e.target.setCustomValidity("Achternaam is verplicht.");
                                                    }}
                                                    required
                                                    placeholder="Achternaam"
                                                />
                                            </div>

                                            <div className="form-outline mb-4">
                                                <label className="form-label">E-mailadres</label>
                                                <input
                                                    type="email"
                                                    className={`form-control form-control-lg ${styles.input}`}
                                                    value={email}
                                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                        setEmail(e.target.value);
                                                    }}
                                                    required
                                                    placeholder="naam@voorbeeld.com"
                                                />
                                            </div>

                                            <div className="form-outline mb-4">
                                                <label className="form-label">Wachtwoord</label>
                                                <input
                                                    type="password"
                                                    className={`form-control form-control-lg ${styles.input}`}
                                                    value={password1}
                                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                        setPassword1(e.target.value);
                                                        e.target.setCustomValidity("");
                                                    }}
                                                    onInvalid={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                        e.target.setCustomValidity("Wachtwoord is verplicht.");
                                                    }}
                                                    required
                                                    placeholder="Wachtwoord"
                                                />
                                            </div>

                                            <div className="form-outline mb-4">
                                                <label className="form-label">Bevestig wachtwoord</label>
                                                <input
                                                    type="password"
                                                    className={`form-control form-control-lg ${styles.input}`}
                                                    value={password2}
                                                    onInput={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                        e.target.setCustomValidity("");
                                                        setPassword2(e.target.value);
                                                        if (password1 !== e.target.value) {
                                                            e.target.setCustomValidity(
                                                                "Wachtwoorden zijn niet gelijk."
                                                            );
                                                        } else {
                                                            e.target.setCustomValidity("");
                                                        }
                                                    }}
                                                    onInvalid={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                        if (password1 !== e.target.value) {
                                                            e.target.setCustomValidity(
                                                                "Wachtwoorden zijn niet gelijk."
                                                            );
                                                        } else {
                                                            e.target.setCustomValidity("");
                                                        }
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
                                                    Sign up
                                                </button>
                                            </div>

                                            <p className="mb-5 pb-lg-2">
                                                Heb je al een account? <a href="/login">Ga naar login</a>
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
