import {useRouter} from "next/router";
import React, {FormEvent, useState} from "react";
import BaseHeader from "@/components/header/baseHeader";
import reset from "@/lib/reset";
import {Button, Card, Col, Container, Form, InputGroup, Row} from "react-bootstrap";
import CarouselComponent from "@/components/imageCarousel";

export default function ForgotPassword() {
    const router = useRouter();
    const [email, setEmail] = useState<string>("");

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        reset(email).then(
            async (res) => {
                if (res.status == 200) {
                    alert("A password reset e-mail has been sent to the provided e-mail address");
                    await router.push("/login");
                }
            },
            (err) => {
                console.error(err);
            }
        );
    };

    return (
        <>
            <BaseHeader/>
            <Container className="center_container">
                <Card>
                    <Row>
                        <Col md={6} style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                            <CarouselComponent/>
                        </Col>
                        <Col md={6}>
                            <Form onSubmit={handleSubmit}>
                                <Form.Label className="title">Wachtwoord vergeten.</Form.Label>

                                <p className="normal_text">Vul je e-mailadres is om je account terug te vinden</p>
                                <Form.Label className="normal_text">E-mailadres</Form.Label>
                                <InputGroup className="input">
                                    <Form.Control
                                        className="form_control"
                                        type="email"
                                        value={email}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                            setEmail(e.target.value)
                                        }
                                        required
                                        placeholder="naam@voorbeeld.com"
                                    />
                                </InputGroup>
                                <div className="padding">
                                    <Button
                                        className="wide_button"
                                        size="lg"
                                        type="submit">
                                        Reset
                                    </Button>
                                </div>
                                <p className="normal_text">
                                    Geheugen opgefrist? <a className="link" href="/login">Ga naar login</a>
                                </p>
                            </Form>
                        </Col>
                    </Row>
                </Card>
            </Container>
        </>
    );
}
