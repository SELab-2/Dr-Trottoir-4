import React, { useState } from "react";
import { logout } from "@/lib/logout";
import { useRouter } from "next/router";
import { Button, Modal } from "react-bootstrap";

function Logout() {
    const router = useRouter();
    const [showModal, setShowModal] = useState(false);

    const handleLogout = () => {
        logout().then(
            async (res) => {
                if (res.status === 200) {
                    sessionStorage.removeItem("id");
                    sessionStorage.removeItem("role");
                    await router.push("/login");
                }
            },
            (err) => {
                console.error(err);
            }
        );
        setShowModal(false);
    };

    return (
        <>
            <a
                onClick={(e) => {
                    e.preventDefault();
                    setShowModal(true);
                }}
            >
                Log uit
            </a>

            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Uitloggen</Modal.Title>
                </Modal.Header>
                <Modal.Body>Zeker dat je wil uitloggen?</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" className="btn-light" onClick={() => setShowModal(false)}>
                        Annuleer
                    </Button>
                    <Button variant="primary" className="btn-dark" onClick={handleLogout}>
                        Log uit
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default Logout;
