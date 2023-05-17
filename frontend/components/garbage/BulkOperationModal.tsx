import React, { useState } from "react";
import { bulkMoveGarbageCollectionSchedule, garbageTypes } from "@/lib/garbage-collection";
import { handleError } from "@/lib/error";
import { formatDate } from "@/lib/date";
import { Button, Form, Modal } from "react-bootstrap";
import { addDays } from "date-fns";
import { BuildingInterface } from "@/lib/building";
import styles from "@/styles/Login.module.css";
import ErrorMessageAlert from "@/components/errorMessageAlert";
import LocaleDatePicker from "@/components/datepicker/datepicker";

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
    const [dateToMove, setDateToMove] = useState<Date>(new Date());
    const [moveToDate, setMoveToDate] = useState<Date>(addDays(new Date(), 1));
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
            formatDate(dateToMove),
            formatDate(moveToDate),
            buildings.map((b) => b.id)
        ).then(
            (_) => onHide(),
            (err) => setErrorMessages(handleError(err))
        );
    }

    // execute when the modal is hidden
    function onHide() {
        closeModal();
        setDateToMove(new Date());
        setMoveToDate(addDays(new Date(), 1));
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
                            <label>Verplaats van:</label>
                            <LocaleDatePicker setSelectedDate={setDateToMove} selectedDate={dateToMove}/>
                        </div>
                        <div className="col">
                            <label>naar:</label>
                            <LocaleDatePicker setSelectedDate={setMoveToDate} selectedDate={moveToDate}/>
                        </div>
                    </div>
                    <div className="form-outline mb-4">
                        <label className="form-label">Type:</label>
                        <select
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
