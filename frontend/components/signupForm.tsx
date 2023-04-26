import styles from "@/styles/Login.module.css";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import React, { FormEvent, useState } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/router";
import signup from "@/lib/signup";
import { handleError } from "@/lib/error";
import PasswordInput from "@/components/password/passwordInput";
import ErrorMessageAlert from "@/components/errorMessageAlert";

function SignupForm() {
    const { t } = useTranslation();
    const router = useRouter();
    const [firstname, setFirstname] = useState<string>("");
    const [lastname, setLastname] = useState<string>("");
    const [phoneNumber, setPhoneNumber] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [password1, setPassword1] = useState<string>("");
    const [password2, setPassword2] = useState<string>("");
    const [verificationCode, setVerificationCode] = useState<string>("");
    const [errorMessages, setErrorMessages] = useState<string[]>([]);
    const [showPassword, setShowPassword] = useState<boolean>(false);

    const handlePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        setErrorMessages([]);
        signup(firstname, lastname, phoneNumber, email, password1, password2, verificationCode).then(
            async (res) => {
                if (res.status == 201) {
                    await router.push(
                        {
                            pathname: "/login",
                            query: { createdAccount: true },
                        },
                        "/login"
                    );
                }
            },
            (err) => {
                const e = handleError(err);
                setErrorMessages(e);
            }
        );
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="d-flex align-items-center mb-3 pb-1">
                <i className="fas fa-cubes fa-2x me-3" />
                <span className="h1 fw-bold mb-0">Sign up.</span>
            </div>
            <ErrorMessageAlert errorMessages={errorMessages} setErrorMessages={setErrorMessages}/>
            <div className="form-outline mb-4">
                <label className="form-label">Voornaam</label>
                <input
                    type="text"
                    title="Geef je voornaam in."
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
                    title="Geef je achternaam in."
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
                <label className="form-label">Gsm-nummer</label>
                <PhoneInput
                    country={"be"}
                    value={phoneNumber}
                    preferredCountries={["be", "nl"]}
                    onChange={(phone) => setPhoneNumber("+" + phone)}
                    // TODO: Adapt styling to match other fields?
                    //containerClass={`form-control form-control-lg ${styles.input}`}
                />
            </div>

            <div className="form-outline mb-4">
                <label className="form-label">E-mailadres</label>
                <input
                    type="email"
                    title="Geef het e-mailadres die je hebt opgegeven aan een platformbeheerder."
                    className={`form-control form-control-lg ${styles.input}`}
                    value={email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setEmail(e.target.value);
                    }}
                    required
                    placeholder="naam@voorbeeld.com"
                />
            </div>

            <PasswordInput
                value={password1}
                setPassword={setPassword1}
                handlePasswordVisibility={handlePasswordVisibility}
                showPassword={showPassword}
                label="Wachtwoord"
                placeholder="Wachtwoord"
                showIconButton={true}
                customOnInput={(e: React.ChangeEvent<HTMLInputElement>) => {
                    e.target.setCustomValidity("");
                }}
                customOnInvalid={(e: React.ChangeEvent<HTMLInputElement>) => {
                    e.target.setCustomValidity("Wachtwoord is verplicht.");
                }}
            />

            <PasswordInput
                value={password2}
                setPassword={setPassword2}
                handlePasswordVisibility={() => null}
                showPassword={false}
                label="Bevestig wachtwoord"
                placeholder="Wachtwoord"
                showIconButton={false}
                customOnInput={(e: React.ChangeEvent<HTMLInputElement>) => {
                    e.target.setCustomValidity("");
                    if (password1 !== e.target.value) {
                        e.target.setCustomValidity("Wachtwoorden zijn niet gelijk.");
                    } else {
                        e.target.setCustomValidity("");
                    }
                }}
                customOnInvalid={(e: React.ChangeEvent<HTMLInputElement>) => {
                    if (password1 !== e.target.value) {
                        e.target.setCustomValidity("Wachtwoorden zijn niet gelijk.");
                    } else {
                        e.target.setCustomValidity("");
                    }
                }}
            />

            <div className="form-outline mb-4">
                <label className="form-label">Verificatiecode</label>
                <input
                    type="text"
                    title="Geef de verificatiecode die je verkreeg via een platformbeheerder."
                    className={`form-control form-control-lg ${styles.input}`}
                    value={verificationCode}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setVerificationCode(e.target.value);
                        e.target.setCustomValidity("");
                    }}
                    onInvalid={(e: React.ChangeEvent<HTMLInputElement>) => {
                        e.target.setCustomValidity("Een verificatiecode is verplicht.");
                    }}
                    required
                    placeholder="Verificatiecode"
                />
            </div>

            <div className="pt-1 mb-4">
                <button className={`btn btn-dark btn-lg btn-block ${styles.button}`} type="submit">
                    Sign up
                </button>
            </div>

            <p className="mb-5 pb-lg-2">
                Heb je al een account? <a href="/login">Ga naar login</a>
            </p>
        </form>
    );
}

export default SignupForm;
