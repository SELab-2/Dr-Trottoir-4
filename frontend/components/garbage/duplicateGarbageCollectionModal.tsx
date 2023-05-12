import { Button, Form, Modal } from "react-bootstrap";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { formatDate } from "@/lib/date";
import { duplicateGarbageCollectionSchedule } from "@/lib/garbage-collection";
import { handleError } from "@/lib/error";
import ErrorMessageAlert from "@/components/errorMessageAlert";
import {addWeeks, endOfWeek, startOfWeek} from "date-fns";

export default function DuplicateGarbageCollectionModal({
    show,
    closeModal,
    range,
}: {
    show: boolean;
    closeModal: () => void;
    range: { start: Date; end: Date }
}) {
    const { t } = useTranslation();
    const [errorMessages, setErrorMessages] = useState<string[]>([]);
    const [startDate, setStartDate] = useState<string>(formatDate(startOfWeek(new Date(), {weekStartsOn: 1})));
    const [endDate, setEndDate] = useState<string>(formatDate(endOfWeek(new Date(), {weekStartsOn: 1})));
    const [copyToDate, setCopyToDate] = useState<string>(formatDate(startOfWeek(addWeeks(new Date(), 1), {weekStartsOn: 1})));

    // Submit the duplicate request
    function submit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!startDate) {
            setErrorMessages(["Begindatum is niet ingevuld."]);
            return;
        }
        if (!endDate || new Date(endDate) < new Date(startDate)) {
            setErrorMessages(["Einddatum moet na begindatum komen."]);
            return;
        }
        duplicateGarbageCollectionSchedule(startDate, endDate, copyToDate).then(
            (_) => {
                onHide();
            },
            (err) => {
                setErrorMessages(handleError(err));
                console.error(err);
            }
        );
    }

    function onShow() {
        setStartDate(formatDate(startOfWeek(range.start, {weekStartsOn: 1})));
        setEndDate(formatDate(endOfWeek(range.end, {weekStartsOn: 1})));
        setCopyToDate(formatDate(startOfWeek(addWeeks(range.end, 1), {weekStartsOn: 1})));
    }

    // execute when the modal is hidden
    function onHide() {
        closeModal();
        onShow();
        setErrorMessages([]);
    }

    return (
        <Modal show={show} onHide={() => onHide()} onShow={onShow}>
            <Modal.Header>
                <Modal.Title>Dupliceer vuilophaling schema voor geselecteerde gebouwen</Modal.Title>
            </Modal.Header>
            <ErrorMessageAlert errorMessages={errorMessages} setErrorMessages={setErrorMessages} />
            <Form onSubmit={submit}>
                <Modal.Body>
                    <div className="form-row">
                        <div className="col">
                            <label>Van start van week:</label>
                            <input
                                type="date"
                                className="form-control"
                                value={startDate}
                                onChange={(event) =>
                                    setStartDate(
                                        formatDate(startOfWeek(new Date(event.target.value), { weekStartsOn: 1 }))
                                    )
                                }
                            />
                        </div>
                        <div className="col">
                            <label>Tot einde van week:</label>
                            <input
                                type="date"
                                className="form-control"
                                value={endDate}
                                onChange={(event) =>
                                    setEndDate(formatDate(endOfWeek(new Date(event.target.value), { weekStartsOn: 1 })))
                                }
                            />
                        </div>
                    </div>
                    <div className="form-outline mb-4">
                        <label className="form-label">Kopieer naar maandag van week:</label>
                        <input
                            type="date"
                            className="form-control"
                            value={copyToDate}
                            onChange={(event) =>
                                setCopyToDate(
                                    formatDate(startOfWeek(new Date(event.target.value), { weekStartsOn: 1 }))
                                )
                            }
                        />
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        variant="secondary"
                        className="btn-light"
                        onClick={() => {
                            setErrorMessages([]);
                            closeModal();
                        }}
                    >
                        Annuleer
                    </Button>
                    <Button variant="primary" className="btn-dark" type="submit">
                        Dupliceer
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}
