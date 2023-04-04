import {Button, Modal} from "react-bootstrap";
import React, {useState} from "react";
import {UserView} from "@/types";
import {getAndSetErrors} from "@/lib/error";
import {useTranslation} from "react-i18next";
import {deleteMailTemplate, Emailtemplate} from "@/lib/emailtemplate";

export function DeleteEmailModal(
    {
        show,
        closeModal,
        selectedMail,
        setMail
    }: {
        show: boolean,
        closeModal: () => void,
        selectedMail: Emailtemplate | null,
        setMail: (x: |any) => void
    }
) {
    const {t} = useTranslation();
    const [errorMessages, setErrorMessages] = useState<string[]>([]);

    /**
     * Remove a user, show errors if necessary
     */
    function removeMailTemplate() {
        if (!selectedMail) {
            return;
        }
        deleteMailTemplate(selectedMail.id).then(() => {
            setErrorMessages([]);
            setMail(null);
            closeModal();
        }, err => {
            let errorRes = err.response;
            if (errorRes && errorRes.status === 400) {
                getAndSetErrors(Object.entries(errorRes.data), setErrorMessages);
            } else if (errorRes && errorRes.status === 403) {
                const errorData: [any, string][] = Object.entries(errorRes.data);
                setErrorMessages(errorData.map(val => val[1]));
            } else {
                console.error(err);
            }
        });
    }

    return (
        <Modal show={show} onHide={closeModal}>
            <Modal.Header>
                <Modal.Title>Verwijder template:</Modal.Title>
            </Modal.Header>
            {
                (errorMessages.length !== 0) && (
                    <div className={"visible alert alert-danger alert-dismissible fade show"}>
                        <ul>
                            {errorMessages.map((err, i) => (
                                <li key={i}>{t(err)}</li>
                            ))}
                        </ul>
                        <button
                            type="button"
                            className="btn-close"
                            onClick={() => setErrorMessages([])}
                        ></button>
                    </div>
                )
            }
            <Modal.Body>Bent u zeker dat u
                template {selectedMail?.name} wil
                verwijderen?</Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" className="btn-light" onClick={() => {
                    setMail(null);
                    setErrorMessages([]);
                    closeModal();
                }}>
                    Annuleer
                </Button>
                <Button variant="primary" className="btn-dark" onClick={async () => {
                    removeMailTemplate();
                }}>
                    Verwijder
                </Button>
            </Modal.Footer>
        </Modal>
    );
}