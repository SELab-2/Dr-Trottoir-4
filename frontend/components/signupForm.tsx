import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import React, {FormEvent, useState} from "react";
import {useRouter} from "next/router";
import signup from "@/lib/signup";
import {handleError} from "@/lib/error";
import PasswordInput from "@/components/password/passwordInput";
import ErrorMessageAlert from "@/components/errorMessageAlert";
import {Button, Col, Form, FormControl, InputGroup, Row} from "react-bootstrap";

function SignupForm() {
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
                            query: {createdAccount: true},
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
        <Form onSubmit={handleSubmit}>
            <div>
                <Form.Label className="title">Sign up.</Form.Label>
            </div>
            <ErrorMessageAlert errorMessages={errorMessages} setErrorMessages={setErrorMessages}/>
            <Row>
                <Col md={6}>
                    <div>
                        <Form.Label className="normal_text">Voornaam</Form.Label>
                        <InputGroup className="input">
                            <FormControl
                                className="form_control"
                                type="text"
                                title="Geef je voornaam in."
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
                        </InputGroup>
                    </div>

                    <div>
                        <Form.Label className="normal_text">Achternaam</Form.Label>
                        <InputGroup className="input">
                            <FormControl
                                className="form_control"
                                type="text"
                                title="Geef je achternaam in."
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
                        </InputGroup>
                    </div>

                    <div>
                        <Form.Label className="normal_text">Gsm-nummer</Form.Label>
                        <InputGroup className="input">
                            <PhoneInput
                                country={"be"}
                                value={phoneNumber}
                                preferredCountries={["be", "nl"]}
                                onChange={(phone) => setPhoneNumber("+" + phone)}
                                inputClass="form_control"
                                inputStyle={{height: '40px', background: '#f8f9fa', fontSize: '15px', width: '100%', maxWidth: '300px'}}
                            />
                        </InputGroup>
                    </div>
                    <div>
                        <Form.Label className="normal_text">Verificatiecode</Form.Label>
                        <InputGroup className="input">
                            <FormControl
                                className="form_control"
                                type="text"
                                title="Geef de verificatiecode die je verkreeg via een platformbeheerder."
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
                        </InputGroup>
                    </div>
                </Col>
                <Col md={6}>
                    <div>
                        <Form.Label className="normal_text">E-mailadres</Form.Label>
                        <InputGroup className="input">
                            <FormControl
                                className="form_control"
                                type="email"
                                title="Geef het e-mailadres die je hebt opgegeven aan een platformbeheerder."
                                value={email}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                    setEmail(e.target.value);
                                }}
                                required
                                placeholder="naam@voorbeeld.com"
                            />
                        </InputGroup>
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
                    <Form.Label className="small_text">
                        Heb je al een account? <a href="/login">Ga naar login</a>
                    </Form.Label>
                    <div className="padding">
                        <Button
                            className="wide_button"
                            size="lg"
                            type="submit">
                            Registreer
                        </Button>
                    </div>
                </Col>
            </Row>
        </Form>
    );
}

export default SignupForm;
