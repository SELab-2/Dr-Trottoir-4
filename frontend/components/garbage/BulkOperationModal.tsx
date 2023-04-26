import React, {useState} from "react";
import {duplicateGarbageCollectionSchedule, garbageTypes} from "@/lib/garbage-collection";
import {handleError} from "@/lib/error";
import {formatDate} from "@/lib/date";
import {Button, Form, Modal} from "react-bootstrap";
import {addDays} from "date-fns";
import {BuildingInterface} from "@/lib/building";
import styles from "@/styles/Login.module.css";

export default function BulkOperationModal(
    {
        show,
        buildings,
        closeModal
    } : {
        show : boolean,
        buildings : BuildingInterface[],
        closeModal : () => void
    }
) {

    const [errorMessages, setErrorMessages] = useState<string[]>([]);
    const [dateToMove, setDateToMove] = useState<string>(formatDate(new Date()))
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
        if (! garbageType) {
            setErrorMessages(["Er is geen type aangeduid."]);
        }
        // For now duplicate for all the buildings
        console.log(dateToMove, moveToDate, garbageType);
        onHide();
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
            {errorMessages.length !== 0 && (
                <div className={"visible alert alert-danger alert-dismissible fade show"}>
                    <ul>
                        {errorMessages.map((err, i) => (
                            <li key={i}>{err}</li>
                        ))}
                    </ul>
                    <button type="button" className="btn-close" onClick={() => setErrorMessages([])}></button>
                </div>
            )}
            <Form onSubmit={submit}>
                <Modal.Body>
                    <div className="form-row">
                        <div className="col">
                            <label>Verplaats van:</label>
                            <input
                                type="date"
                                className="form-control"
                                value={dateToMove}
                                onChange={(event) => setDateToMove(event.target.value)}
                            />
                        </div>
                        <div className="col">
                            <label>naar:</label>
                            <input
                                type="date"
                                className="form-control"
                                value={moveToDate}
                                onChange={(event) => setMoveToDate(event.target.value)}
                            />
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
                            <option disabled value="" key=""/>
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