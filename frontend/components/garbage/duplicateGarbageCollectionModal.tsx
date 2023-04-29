import {Button, Form, Modal} from "react-bootstrap";
import React, {useState} from "react";
import {useTranslation} from "react-i18next";
import {formatDate} from "@/lib/date";
import {BuildingInterface} from "@/lib/building";
import {duplicateGarbageCollectionSchedule} from "@/lib/garbage-collection";
import {handleError} from "@/lib/error";
import ErrorMessageAlert from "@/components/errorMessageAlert";

export default function DuplicateGarbageCollectionModal({
    show,
    closeModal,
    buildings,
}: {
    show: boolean;
    closeModal: () => void;
    buildings: BuildingInterface[];
}) {
    const { t } = useTranslation();
    const [errorMessages, setErrorMessages] = useState<string[]>([]);
    const [startDate, setStartDate] = useState<string>("");
    const [endDate, setEndDate] = useState<string>("");
    const [copyToDate, setCopyToDate] = useState<string>(formatDate(new Date()));

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
        // For now duplicate for all the buildings
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

    // execute when the modal is hidden
    function onHide() {
        closeModal();
        setCopyToDate(formatDate(new Date()));
        setStartDate("");
        setEndDate("");
        setErrorMessages([]);
    }

    return (
        <Modal show={show} onHide={() => onHide()}>
            <Modal.Header>
                <Modal.Title>Dupliceer vuilophaling schema voor geselecteerde gebouwen</Modal.Title>
            </Modal.Header>
            <ErrorMessageAlert errorMessages={errorMessages} setErrorMessages={setErrorMessages} />
            <Form onSubmit={submit}>
                <Modal.Body>
                    <div className="form-row">
                        <div className="col">
                            <label>Van:</label>
                            <input
                                type="date"
                                className="form-control"
                                value={startDate}
                                onChange={(event) => setStartDate(event.target.value)}
                            />
                        </div>
                        <div className="col">
                            <label>Tot:</label>
                            <input
                                type="date"
                                className="form-control"
                                value={endDate}
                                onChange={(event) => setEndDate(event.target.value)}
                            />
                        </div>
                    </div>
                    <div className="form-outline mb-4">
                        <label className="form-label">Kopieer naar datum:</label>
                        <input
                            type="date"
                            className="form-control"
                            value={copyToDate}
                            onChange={(event) => setCopyToDate(event.target.value)}
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
