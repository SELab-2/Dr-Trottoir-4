import BaseHeader from "@/components/header/baseHeader";
import React, {useState, useEffect} from "react";
import {useRouter} from "next/router";
import Loading from "@/components/loading";
import Image from "next/image";
import filler_image from "@/public/filler_image.png";
import styles from "@/styles/Login.module.css";
import PasswordInput from "@/components/password/passwordInput";
import {changePassword, resetPassword} from "@/lib/authentication";
import {Button} from "react-bootstrap";
import ErrorMessage from "@/components/errorMessage";

export default function ResetPasswordPage() {
    const router = useRouter();
    const [newPassword1, setNewPassword1] = useState<string>("");
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [newPassword2, setNewPassword2] = useState<string>("");
    const [formErrors, setFormErrors] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>("");

    const handlePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };


    const {token, uid} = router.query;


    const handleSubmit = async () => {
        if (newPassword1 !== newPassword2) {
            setFormErrors(true);
            setErrorMessage("De ingevoerde wachtwoorden komen niet overeen.");
            return;
        } else if (!newPassword1 || !newPassword2) {
            setFormErrors(true);
            setErrorMessage("Gelieve alle velden in te vullen");
        } else if (!token || !uid) {
            setFormErrors(true);
            setErrorMessage("Gelieve de link te gebruiken die u heeft onvangen via email om uw wachtwoord opnieuw in te stellen");
        } else {
            try {
                await router.push("/login");
                console.log(uid);
                console.log(token);
                const res = await resetPassword({
                    new_password1: newPassword1,
                    new_password2: newPassword2,
                    uid: uid.toString(),
                    token: token.toString()
                });
            } catch (error: any) {
                //TODO replace this with the new error message component once it's available
                console.error("An error occurred:", error.request.responseText);
                setErrorMessage(error.request.responseText);
                setFormErrors(true);
            }
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
                                    <Image
                                        src={filler_image}
                                        alt="My App Logo"
                                        className={styles.filler_image}
                                    />
                                </div>
                                <div className="col-md-6 col-lg-7 d-flex align-items-center">
                                    <div className="card-body p-4 p-lg-5 text-black">
                                        <h2>Nieuw wachtwoord instellen</h2>
                                        <br/>
                                        <ErrorMessage formErrors={formErrors} errorMessage={errorMessage}
                                                      onClose={setFormErrors}/>
                                        <PasswordInput
                                            value={newPassword1}
                                            setPassword={setNewPassword1}
                                            handlePasswordVisibility={handlePasswordVisibility}
                                            showPassword={showPassword}
                                            label="Nieuw wachtwoord:"
                                            placeholder="Voer uw nieuwe wachtwoord in"
                                            showIconButton={true}
                                        />
                                        <PasswordInput
                                            value={newPassword2}
                                            setPassword={setNewPassword2}
                                            handlePasswordVisibility={() => null}
                                            showPassword={false}
                                            label="Bevestig nieuw wachtwoord:"
                                            placeholder="Voer uw nieuwe wachtwoord opnieuw in"
                                            showIconButton={false}
                                        />
                                        <a className="small text-muted" href="/login">
                                            Terug naar login
                                        </a>
                                        <br/>
                                        <Button variant="primary" className="btn-dark" onClick={handleSubmit}>
                                            Opslaan
                                        </Button>
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
