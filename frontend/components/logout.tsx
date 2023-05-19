import React, { useState } from "react";
import { logout } from "@/lib/logout";
import { useRouter } from "next/router";
import { Button, Modal } from "react-bootstrap";
import { handleError } from "@/lib/error";
import ErrorMessageAlert from "@/components/errorMessageAlert";

function Logout() {
    const router = useRouter();
    const [showModal, setShowModal] = useState(false);
    const [errorMessages, setErrorMessages] = useState<string[]>([]);

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
                setErrorMessages(handleError(err));
            }
        );
        setShowModal(false);
    };

    return (
        <>
            <label
                style={{ cursor: "clickable" }}
                onClick={() => {
                    setShowModal(true);
                }}
            >
                Log uit
            </label>

            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Uitloggen</Modal.Title>
                </Modal.Header>
                <ErrorMessageAlert setErrorMessages={setErrorMessages} errorMessages={errorMessages} />
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
