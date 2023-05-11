import React, { useState } from "react";
import {
    bulkMoveGarbageCollectionSchedule,
    duplicateGarbageCollectionSchedule,
    garbageTypes,
} from "@/lib/garbage-collection";
import { handleError } from "@/lib/error";
import { formatDate } from "@/lib/date";
import { Button, Form, Modal } from "react-bootstrap";
import { addDays } from "date-fns";
import { BuildingInterface } from "@/lib/building";
import styles from "@/styles/Login.module.css";
import ErrorMessageAlert from "@/components/errorMessageAlert";

export default function BulkOperationModal({
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
                    <div className="form-row">
                        <div className="col">
                            <label htmlFor={"verplaats-van"}>Verplaats van:</label>
                            <input
                                id={"verplaats-van"}
                                type="date"
                                className="form-control"
                                value={dateToMove}
                                onChange={(event) => setDateToMove(event.target.value)}
                            />
                        </div>
                        <div className="col">
                            <label htmlFor={"naar"}>naar:</label>
                            <input
                                id={"naar"}
                                type="date"
                                className="form-control"
                                value={moveToDate}
                                onChange={(event) => setMoveToDate(event.target.value)}
                            />
                        </div>
                    </div>
                    <div className="form-outline mb-4">
                        <label htmlFor={"garbage-select"} className="form-label">Type:</label>
                        <select
                            id={"garbage-select"}
                            className={`form-select form-control form-control-lg ${styles.input}`}
                            value={garbageType ? garbageType : ""}
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                                setGarbageType(e.target.value);
                            }}
                        >
                            <option disabled value="" key="" />
                            {Object.keys(garbageTypes).map((key: string) => {
                                const value = garbageTypes[key];
                                return (
                                    <option value={key} key={key}>
                                        {value}
                                    </option>
                                );
                            })}
                        </select>
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
                        Verplaats
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}
