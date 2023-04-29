import styles from "@/styles/Login.module.css";
import React, {FormEvent, useState} from "react";
import {useTranslation} from "react-i18next";
import {useRouter} from "next/router";
import login from "@/lib/login";
import setSessionStorage from "@/lib/storage";
import {getRoleDirection} from "@/lib/reroute";
import {handleError} from "@/lib/error";
import Link from "next/link";
import PasswordInput from "@/components/password/passwordInput";
import ErrorMessageAlert from "@/components/errorMessageAlert";

function LoginForm() {
    const { t } = useTranslation();
    const router = useRouter();
    const [username, setUsername] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [errorMessages, setErrorMessages] = useState<string[]>([]);
    const [showPassword, setShowPassword] = useState(false);

    const handlePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleSubmit = async (event: FormEvent): Promise<void> => {
        event.preventDefault();
        login(username, password).then(
            async (res) => {
                const roleId = res.data.user.role;
                setSessionStorage(roleId, res.data.user.id);
                const direction = getRoleDirection(roleId, "dashboard");
                await router.push(direction);
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
                <span className="h1 fw-bold mb-0">Login.</span>
            </div>
            {router.query.createdAccount && (
                <div className={"visible alert alert-success alert-dismissible fade show"}>
                    <strong>Succes!</strong> Uw account werd met succes aangemaakt!
                    <button type="button" className="btn-close" data-bs-dismiss="alert"></button>
                </div>
            )}
            <ErrorMessageAlert errorMessages={errorMessages} setErrorMessages={setErrorMessages} />
            <div className="form-outline mb-4">
                <label className="form-label">E-mailadres</label>
                <input
                    type="email"
                    className={`form-control form-control-lg ${styles.input}`}
                    value={username}
                    placeholder="naam@voorbeeld.com"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
                />
            </div>

            <PasswordInput
                value={password}
                setPassword={setPassword}
                handlePasswordVisibility={handlePasswordVisibility}
                showPassword={showPassword}
                label={"Wachtwoord"}
                placeholder={"Wachtwoord"}
                showIconButton={true}
            ></PasswordInput>

            <div className="pt-1 mb-4">
                <button className={`btn btn-dark btn-lg btn-block ${styles.button}`} type="submit">
                    Login
                </button>
            </div>

            <a className="small text-muted" href="/forgot-password">
                Wachtwoord vergeten?
            </a>
            <p className="mb-5 pb-lg-2">
                Heb je nog geen account?{" "}
                <Link href="/signup" style={{ textDecoration: "underline" }}>
                    Registreer je hier!
                </Link>
            </p>
        </form>
    );
}

export default LoginForm;
