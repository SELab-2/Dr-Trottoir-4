import { Button, Modal } from "react-bootstrap";
import React, { useState } from "react";
import { UserView } from "@/types";
import { deleteUser } from "@/lib/user";
import { handleError } from "@/lib/error";
import { useTranslation } from "react-i18next";

export function UserDeleteModal({
    show,
    closeModal,
    selectedUser,
    setSelectedUser,
}: {
    show: boolean;
    closeModal: () => void;
    selectedUser: UserView | null;
    setSelectedUser: (x: any) => void;
}) {
    const { t } = useTranslation();
    const [errorMessages, setErrorMessages] = useState<string[]>([]);

    /**
     * Remove a user, show errors if necessary
     */
    function removeUser() {
        if (!selectedUser) {
            return;
        }
        deleteUser(selectedUser?.userId).then(
            () => {
                setErrorMessages([]);
                closeModal();
            },
            (err) => {
                const e = handleError(err);
                setErrorMessages(e);
            }
        );
    }

    return (
        <Modal show={show} onHide={closeModal}>
            <Modal.Header>
                <Modal.Title>Verwijder gebruiker</Modal.Title>
            </Modal.Header>
            {errorMessages.length !== 0 && (
                <div className={"visible alert alert-danger alert-dismissible fade show"}>
                    <ul>
                        {errorMessages.map((err, i) => (
                            <li key={i}>{t(err)}</li>
                        ))}
                    </ul>
                    <button type="button" className="btn-close" onClick={() => setErrorMessages([])}></button>
                </div>
            )}
            <Modal.Body>
                Bent u zeker dat u gebruiker {selectedUser?.first_name} {selectedUser?.last_name} ({selectedUser?.email}
                ) wil verwijderen?
            </Modal.Body>
            <Modal.Footer>
                <Button
                    variant="secondary"
                    className="btn-light"
                    onClick={() => {
                        setSelectedUser(null);
                        setErrorMessages([]);
                        closeModal();
                    }}
                >
                    Annuleer
                </Button>
                <Button
                    variant="primary"
                    className="btn-dark"
                    onClick={async () => {
                        removeUser();
                    }}
                >
                    Verwijder
                </Button>
            </Modal.Footer>
        </Modal>
    );
}
