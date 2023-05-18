import React, { useState } from "react";
import { bulkMoveGarbageCollectionSchedule, garbageTypes } from "@/lib/garbage-collection";
import { handleError } from "@/lib/error";
import { formatDate } from "@/lib/date";
import { Button, Form, Modal } from "react-bootstrap";
import { addDays } from "date-fns";
import { BuildingInterface } from "@/lib/building";
import ErrorMessageAlert from "@/components/errorMessageAlert";
import Select from "react-select";

export default function BulkMoveGarbageModal({
    show,
    buildings,
    closeModal,
}: {
    show: boolean;
    buildings: BuildingInterface[];
    closeModal: () => void;
}) {
    const [errorMessages, setErrorMessages] = useState<string[]>([]);
    const [dateToMove, setDateToMove] = useState<string>(formatDate(new Date()));
    const [moveToDate, setMoveToDate] = useState<string>(formatDate(addDays(new Date(), 1)));
    const [garbageType, setGarbageType] = useState<string>("");

    // Submit the duplicate request
    function submit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!dateToMove) {
            setErrorMessages(["Begindatum is niet ingevuld."]);
            return;
        }
        if (!moveToDate) {
            setErrorMessages(["Einddatum is niet ingevuld."]);
            return;
        }
        if (!garbageType) {
            setErrorMessages(["Er is geen type aangeduid."]);
        }
        // For now duplicate for all the buildings
        bulkMoveGarbageCollectionSchedule(
            garbageType,
            dateToMove,
            moveToDate,
            buildings.map((b) => b.id)
        ).then(
            (_) => onHide(),
            (err) => setErrorMessages(handleError(err))
        );
    }

    // execute when the modal is hidden
    function onHide() {
        closeModal();
        setDateToMove(formatDate(new Date()));
        setMoveToDate(formatDate(addDays(new Date(), 1)));
        setGarbageType("");
        setErrorMessages([]);
    }

    return (
        <Modal show={show} onHide={() => onHide()}>
            <Modal.Header>
                <Modal.Title>Bulk operatie voor geselecteerde gebouwen</Modal.Title>
            </Modal.Header>
            <ErrorMessageAlert errorMessages={errorMessages} setErrorMessages={setErrorMessages} />
            <Form onSubmit={submit}>
                <Modal.Body>
                    <Form.Group>
                        <Form.Label>Verplaats van:</Form.Label>
                        <Form.Control
                            type="date"
                            className="form-control"
                            value={dateToMove}
                            onChange={(event) => setDateToMove(event.target.value)}
                        />
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>naar:</Form.Label>
                        <Form.Control
                            type="date"
                            className="form-control"
                            value={moveToDate}
                            onChange={(event) => setMoveToDate(event.target.value)}
                        />
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>Type:</Form.Label>
                        <Select
                            options={Object.keys(garbageTypes).map((key: string) => {
                                const v = garbageTypes[key];
                                return { value: v, label: v };
                            })}
                            value={garbageType ? { value: garbageType, label: garbageType } : {}}
                            onChange={(s) => {
                                if (s && s.value) {
                                    setGarbageType(s.value);
                                }
                            }}
                        />
                    </Form.Group>
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
                        Verplaats
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}
