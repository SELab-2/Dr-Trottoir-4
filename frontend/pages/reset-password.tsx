import BaseHeader from "@/components/header/baseHeader";
import React, {useState} from "react";
import {useRouter} from "next/router";
import PasswordInput from "@/components/password/passwordInput";
import {resetPassword} from "@/lib/authentication";
import {Button, Card, Col, Container, Row} from "react-bootstrap";
import {handleError} from "@/lib/error";
import ErrorMessageAlert from "@/components/errorMessageAlert";
import CarouselComponent from "@/components/imageCarousel";

export default function ResetPasswordPage() {
    const router = useRouter();
    const [newPassword1, setNewPassword1] = useState<string>("");
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [newPassword2, setNewPassword2] = useState<string>("");
    const [errorMessages, setErrorMessages] = useState<string[]>([]);

    const handlePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const {token, uid} = router.query;

    const handleSubmit = async () => {
        if (newPassword1 !== newPassword2) {
            setErrorMessages(["De ingevoerde wachtwoorden komen niet overeen."]);
            return;
        } else if (!newPassword1 || !newPassword2) {
            setErrorMessages(["Gelieve alle velden in te vullen"]);
        } else if (!token || !uid) {
            setErrorMessages([
                "Gelieve de link te gebruiken die u heeft onvangen via email om uw wachtwoord opnieuw in te stellen",
            ]);
        } else {
            try {
                await router.push("/login");
                console.log(uid);
                console.log(token);
                const res = await resetPassword({
                    new_password1: newPassword1,
                    new_password2: newPassword2,
                    uid: uid.toString(),
                    token: token.toString(),
                });
            } catch (error: any) {
                setErrorMessages(handleError(error));
            }
        }
    };
    return (
        <>
            <BaseHeader/>
            <Container className="center_container">
                <ErrorMessageAlert setErrorMessages={setErrorMessages} errorMessages={errorMessages}/>
                <Card>
                    <Row>
                        <Col md={6} style={{display: "flex", justifyContent: "center", alignItems: "center"}}>
                            <CarouselComponent/>
                        </Col>
                        <Col md={6} className="column_padding">
                            <p className="title">Nieuw wachtwoord instellen</p>
                            <br/>
                            <ErrorMessageAlert
                                errorMessages={errorMessages}
                                setErrorMessages={setErrorMessages}
                            />
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
                            <a className="link" style={{paddingLeft: '10px'}} href="/login">
                                Terug naar login
                            </a>
                            <div className="padding">
                                <Button variant="primary" className="wide_button" onClick={handleSubmit}>
                                    Opslaan
                                </Button>
                            </div>
                        </Col>
                    </Row>
                </Card>
            </Container>
        </>
    );
}
