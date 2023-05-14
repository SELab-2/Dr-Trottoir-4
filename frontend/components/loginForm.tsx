import React, {FormEvent, useState} from "react";
import {useRouter} from "next/router";
import login from "@/lib/login";
import setSessionStorage from "@/lib/storage";
import {getRoleDirection} from "@/lib/reroute";
import {handleError} from "@/lib/error";
import Link from "next/link";
import PasswordInput from "@/components/password/passwordInput";
import ErrorMessageAlert from "@/components/errorMessageAlert";
import {Button, Form, InputGroup} from "react-bootstrap";

function LoginForm() {
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
        <Form onSubmit={handleSubmit}>
            <Form.Label className="title">Login.</Form.Label>
            {router.query.createdAccount && (
                <div className={"visible alert alert-success alert-dismissible fade show"}>
                    <strong>Succes!</strong> Uw account werd met succes aangemaakt!
                    <button type="button" className="btn-close" data-bs-dismiss="alert"/>
                </div>
            )}
            <ErrorMessageAlert errorMessages={errorMessages} setErrorMessages={setErrorMessages}/>
            <div>
                <Form.Label className="normal_text">E-mailadres</Form.Label>
                <InputGroup className="input">
                    <Form.Control
                        className="form_control"
                        type="email"
                        value={username}
                        placeholder="naam@voorbeeld.com"
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
                    />
                </InputGroup>
            </div>

            <PasswordInput
                value={password}
                setPassword={setPassword}
                handlePasswordVisibility={handlePasswordVisibility}
                showPassword={showPassword}
                label={"Wachtwoord"}
                placeholder={"Wachtwoord"}
                showIconButton={true}
            />

            <a href="/forgot-password">
                <label className="small_text">Wachtwoord vergeten?</label>
            </a>
            <div className="padding">
                <Button
                    className="wide_button"
                    size="lg"
                    type="submit">
                    Login
                </Button>
            </div>

            <p className="normal_text">
                Heb je nog geen account?{" "}
                <Link className="link" href="/signup">
                    Registreer je hier!
                </Link>
            </p>
        </Form>
    );
}

export default LoginForm;
