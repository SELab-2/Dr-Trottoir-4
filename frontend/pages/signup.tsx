import React from "react";
import BaseHeader from "@/components/header/baseHeader";
import SignupForm from "@/components/signupForm";
import {Card, Col, Container, Row} from "react-bootstrap";
import CarouselComponent from "@/components/imageCarousel";
import LoginForm from "@/components/loginForm";

export default function Signup() {
    return (
        <>
            <BaseHeader/>
            <div>
                <Container id="wide_center_container">
                    <Card>
                        <Row>
                            <Col md={5} style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                                    <CarouselComponent/>
                                </Col>
                                <Col md={6}>
                                    <SignupForm/>
                                </Col>
                        </Row>
                    </Card>
                </Container>
            </div>
        </>
    );
}
