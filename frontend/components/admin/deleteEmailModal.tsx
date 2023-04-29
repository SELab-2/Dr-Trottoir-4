import {Button, Modal} from "react-bootstrap";
import React, {useState} from "react";
import {handleError} from "@/lib/error";
import {useTranslation} from "react-i18next";
import {deleteMailTemplate, Emailtemplate} from "@/lib/emailtemplate";
import ErrorMessageAlert from "@/components/errorMessageAlert";

export function DeleteEmailModal({
    show,
    closeModal,
    selectedMail,
    setMail,
}: {
    show: boolean;
    closeModal: () => void;
    selectedMail: Emailtemplate | null;
    setMail: (x: any) => void;
}) {
    const { t } = useTranslation();
    const [errorMessages, setErrorMessages] = useState<string[]>([]);

    /**
     * Remove a user, show errors if necessary
     */
    function removeMailTemplate() {
        if (!selectedMail) {
            return;
        }
        deleteMailTemplate(selectedMail.id).then(
            () => {
                setErrorMessages([]);
                setMail(null);
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
                <Modal.Title>Verwijder template:</Modal.Title>
            </Modal.Header>
            <ErrorMessageAlert errorMessages={errorMessages} setErrorMessages={setErrorMessages} />
            <Modal.Body>Bent u zeker dat u template {selectedMail?.name} wil verwijderen?</Modal.Body>
            <Modal.Footer>
                <Button
                    variant="secondary"
                    className="btn-light"
                    onClick={() => {
                        setMail(null);
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
                        removeMailTemplate();
                    }}
                >
                    Verwijder
                </Button>
            </Modal.Footer>
        </Modal>
    );
}
