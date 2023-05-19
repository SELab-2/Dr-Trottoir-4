import { Emailtemplate, patchMailTemplate, postMailTemplate } from "@/lib/emailtemplate";
import React, { useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { handleError } from "@/lib/error";
import ErrorMessageAlert from "@/components/errorMessageAlert";

export default function ({
    show,
    hideModal,
    selectedEmail,
    setEmail,
    edit,
}: {
    show: boolean;
    hideModal: () => void;
    selectedEmail: Emailtemplate | null;
    setEmail: (x: any) => void;
    edit: boolean;
}) {
    const { t } = useTranslation();
    const [errorMessages, setErrorMessages] = useState<string[]>([]);

    /**
     * Edit a mailtemplate
     */
    function editMail() {
        if (!selectedEmail || !selectedEmail.name) {
            setErrorMessages(["De naam van een template mag niet leeg zijn."]);
            return;
        }
        if (!selectedEmail.template) {
            setErrorMessages(["Een template mag niet leeg zijn."]);
            return;
        }
        patchMailTemplate(selectedEmail.id, { name: selectedEmail.name, template: selectedEmail.template }).then(
            (_) => {
                setEmail(null);
                hideModal();
            },
            (error) => {
                const e = handleError(error);
                setErrorMessages(e);
            }
        );
    }

    /**
     * Create a new mailtemplate
     */
    function createMail() {
        if (!selectedEmail || !selectedEmail.name) {
            setErrorMessages(["De naam van een template mag niet leeg zijn."]);
            return;
        }
        if (!selectedEmail.template) {
            setErrorMessages(["Een template mag niet leeg zijn."]);
            return;
        }
        postMailTemplate(selectedEmail.name, selectedEmail.template).then(
            (_) => {
                setEmail(null);
                hideModal();
            },
            (err) => {
                const e = handleError(err);
                setErrorMessages(e);
            }
        );
    }

    return (
        <Modal
            show={show}
            onHide={() => {
                hideModal();
                setErrorMessages([]);
            }}
        >
            <Modal.Header closeButton>{edit ? "Bewerk template" : "Nieuwe template"}</Modal.Header>
            <ErrorMessageAlert errorMessages={errorMessages} setErrorMessages={setErrorMessages} />
            <Modal.Body>
                <Form>
                    <div className="form-outline mb-4">
                        <label className="form-label">Naam email template:</label>
                        <input
                            type="text"
                            className={`form-control form-control-lg`}
                            id="firstName"
                            value={selectedEmail ? selectedEmail.name : ""}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                setEmail((prevState: Emailtemplate | null) =>
                                    prevState
                                        ? {
                                              ...prevState,
                                              name: e.target.value,
                                          }
                                        : { id: 0, name: e.target.value, template: "" }
                                );
                            }}
                            required
                        />
                    </div>
                    <div className="form-outline mb-4">
                        <label className="form-label">Template: </label>
                        <br/>
                        <label className="form-label small">{`*mogelijke variabelen in de template zijn {{name}} en {{address}}`}</label>
                        <textarea
                            rows={12}
                            className={`form-control form-control-lg`}
                            value={selectedEmail ? selectedEmail.template : ""}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                                setEmail((prevState: Emailtemplate | null) =>
                                    prevState
                                        ? {
                                              ...prevState,
                                              template: e.target.value,
                                          }
                                        : { id: 0, name: "", template: e.target.value }
                                );
                            }}
                            required
                        />
                    </div>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button
                    variant="secondary"
                    className="btn-light"
                    onClick={() => {
                        setEmail(null);
                        setErrorMessages([]);
                        hideModal();
                    }}
                >
                    Annuleer
                </Button>
                <Button
                    variant="primary"
                    className="btn-dark"
                    onClick={async () => {
                        setErrorMessages([]);
                        if (edit) {
                            editMail();
                        } else {
                            createMail();
                        }
                    }}
                >
                    {edit ? "Pas aan" : "Maak nieuwe mail template"}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}
