import BaseHeader from "@/components/header/baseHeader";
import Loading from "@/components/loading";
import LoginForm from "@/components/loginForm";
import CarouselComponent from "@/components/imageCarousel";
import {Card, Col, Container, Row} from "react-bootstrap";
import React, {useEffect, useState} from "react";
import {useRouter} from "next/router";
import {getRoleDirection} from "@/lib/reroute";
import setSessionStorage from "@/lib/storage";
import {getCurrentUser} from "@/lib/user";

export default function Login() {
    const router = useRouter();
    const [loading, setLoading] = useState<boolean>(true);

    // try and log in to the application using existing refresh token
    useEffect(() => {
        getCurrentUser().then(
            async (res) => {
                const user = res.data;
                const roleId = user.role;
                setSessionStorage(roleId, user.id);
                const direction = getRoleDirection(roleId, "dashboard");
                await router.push(direction);
            },
            (err) => {
                setLoading(false);
                console.error(err);
            }
        );
    }, [getCurrentUser]);

    return (
        <>
            <BaseHeader/>
            <div>
                {loading ? (
                    <Loading/>
                ) : (
                    <Container id="center_container">
                        <Card>
                            <Row>
                                <Col md={6}>
                                    <CarouselComponent/>
                                </Col>
                                <Col md={6}>
                                    <LoginForm/>
                                </Col>
                            </Row>
                        </Card>
                    </Container>
                )}
            </div>
        </>
    );
}
