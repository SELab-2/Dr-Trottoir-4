import React from "react";
import BaseHeader from "@/components/header/baseHeader";
import SignupForm from "@/components/signupForm";
import {Card, Col, Container, Row} from "react-bootstrap";
import CarouselComponent from "@/components/imageCarousel";

export default function Signup() {
    return (
        <>
            <BaseHeader/>
            <div>
                <Container className="center_container">
                    <Card style={{paddingBottom: '20px'}}>
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
