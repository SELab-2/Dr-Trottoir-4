import { useRouter } from "next/router";
import React, { FormEvent, useState } from "react";
import BaseHeader from "@/components/header/baseHeader";
import styles from "@/styles/Login.module.css";
import Image from "next/image";
import filler_image from "@/public/filler_image.png";
import reset from "@/lib/reset";
import { handleError } from "@/lib/error";
import ErrorMessageAlert from "@/components/errorMessageAlert";
import SuccessMessageAlert from "@/components/successMessageAlert";

export default function ForgotPassword() {
    const router = useRouter();
    const [email, setEmail] = useState<string>("");
    const [errorMessages, setErrorMessages] = useState<string[]>([]);
    const [succesMessages, setSuccessMessages] = useState<string[]>([]);

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        reset(email).then(
            async (res) => {
                if (res.status == 200) {
                    setSuccessMessages([
                        "Er is een email verstuurd naar het gegeven e-mailadres om uw wachtwoord te wijzigen.",
                    ]);
                    await router.push("/login");
                }
            },
            (err) => {
                setErrorMessages(handleError(err));
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
                                    <Image src={filler_image} alt="My App Logo" className={styles.filler_image} />
                                </div>
                                <div className="col-md-6 col-lg-7 d-flex align-items-center">
                                    <div className="card-body p-4 p-lg-5 text-black">
                                        <form>
                                            <SuccessMessageAlert
                                                setSuccessMessages={setSuccessMessages}
                                                successmessages={succesMessages}
                                            />
                                            <ErrorMessageAlert
                                                setErrorMessages={setErrorMessages}
                                                errorMessages={errorMessages}
                                            />
                                            <div className="d-flex align-items-center mb-3 pb-1">
                                                <i className="fas fa-cubes fa-2x me-3" />
                                                <span className="h1 fw-bold mb-0">Wachtwoord vergeten.</span>
                                            </div>

                                            <p>Vul je e-mailadres is om je account terug te vinden</p>

                                            <div className="form-outline mb-4">
                                                <label className="form-label">E-mailadres</label>
                                                <input
                                                    type="email"
                                                    className={`form-control form-control-lg ${styles.input}`}
                                                    value={email}
                                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                                        setEmail(e.target.value)
                                                    }
                                                    required
                                                    placeholder="naam@voorbeeld.com"
                                                />
                                            </div>
                                            <button onClick={handleSubmit}>Reset</button>
                                            <p className="mb-5 pb-lg-2">
                                                Geheugen opgefrist? <a href="/login">Ga naar login</a>
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
