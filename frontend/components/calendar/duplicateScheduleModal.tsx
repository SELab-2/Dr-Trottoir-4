import { Button, Form, Modal } from "react-bootstrap";
import React, { useState } from "react";
import { formatDate } from "@/lib/date";

import { handleError } from "@/lib/error";
import ErrorMessageAlert from "@/components/errorMessageAlert";
import { addDays, addWeeks, endOfWeek, startOfWeek } from "date-fns";
import { AxiosResponse } from "axios";

export default function DuplicateScheduleModal({
    show,
    closeModal,
    title,
    onSubmit,
    weekStartsOn, // the start of the week sunday (0), monday (1)
}: {
    show: boolean;
    closeModal: () => void;
    title: string;
    onSubmit: (startDate: string, endDate: string, copyToDate: string) => Promise<AxiosResponse<any, any>>;
    weekStartsOn: 0 | 1;
}) {
    const [errorMessages, setErrorMessages] = useState<string[]>([]);

    const [startDate, setStartDate] = useState<Date>(startOfWeek(new Date(), { weekStartsOn }));
    const [endDate, setEndDate] = useState<Date>(endOfWeek(new Date(), { weekStartsOn }));
    const [copyToDate, setCopyToDate] = useState<Date>(addWeeks(startOfWeek(new Date(), { weekStartsOn }), 1));

    // Submit the duplicate request
    function submit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (endDate < startDate) {
            setErrorMessages(["Einddatum moet na begindatum komen."]);
            return;
        }

        // Add a day for startDate & copyToDate because backend starts week from monday
        const start = weekStartsOn === 0 ? addDays(startDate, 1) : startDate;
        const copy = weekStartsOn === 0 ? addDays(copyToDate, 1) : copyToDate;
        onSubmit(formatDate(start), formatDate(endDate), formatDate(copy)).then(
            (_) => onHide(),
            (err) => setErrorMessages(handleError(err))
        );
    }

    // execute when the modal is hidden
    function onHide() {
        closeModal();
        setStartDate(startOfWeek(new Date(), { weekStartsOn }));
        setEndDate(endOfWeek(new Date(), { weekStartsOn }));
        setCopyToDate(addWeeks(startOfWeek(new Date(), { weekStartsOn }), 1));
        setErrorMessages([]);
    }

    return (
        <Modal show={show} onHide={() => onHide()}>
            <Modal.Header>
                <Modal.Title>{title}</Modal.Title>
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
                                value={formatDate(startDate)}
                                onChange={(event) =>
                                    setStartDate(startOfWeek(new Date(event.target.value), { weekStartsOn }))
                                }
                            />
                        </div>
                        <div className="col">
                            <label>Tot einde van week:</label>
                            <input
                                type="date"
                                className="form-control"
                                value={formatDate(endDate)}
                                onChange={(event) =>
                                    setEndDate(endOfWeek(new Date(event.target.value), { weekStartsOn }))
                                }
                            />
                        </div>
                    </div>
                    <div className="form-outline mb-4">
                        <label className="form-label">Kopieer naar start van week:</label>
                        <input
                            type="date"
                            className="form-control"
                            value={formatDate(copyToDate)}
                            onChange={(event) =>
                                setCopyToDate(startOfWeek(new Date(event.target.value), { weekStartsOn }))
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
