import { Button, Form, Modal } from "react-bootstrap";
import styles from "@/styles/Login.module.css";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    deleteGarbageCollection,
    GarbageCollectionInterface,
    garbageTypes,
    patchGarbageCollection,
    postGarbageCollection,
} from "@/lib/garbage-collection";
import { BuildingInterface } from "@/lib/building";
import { formatDate } from "@/lib/date";
import { handleError } from "@/lib/error";
import {GarbageCollectionEvent} from "@/types";

export default function GarbageEditModal({
    selectedEvent,
    show,
    closeModal,
    onPost,
    onPatch,
    onDelete,
    clickedDate,
    building,
}: {
    selectedEvent: GarbageCollectionEvent | null;
    show: boolean;
    closeModal: () => void;
    onPost: (g: GarbageCollectionInterface) => void;
    onPatch: (g: GarbageCollectionInterface) => void;
    onDelete: (g: number) => void;
    clickedDate: Date | null;
    building: BuildingInterface | null;
}) {
    const { t } = useTranslation();
    const [errorMessages, setErrorMessages] = useState<string[]>([]);
    const [selectedDate, setSelectedDate] = useState<string>(formatDate(new Date()));
    const [garbageType, setGarbageType] = useState<string>("");

    // Get the selected event garbage type & date or empty if selectedEvent is null
    useEffect(() => {
        if (selectedEvent) {
            setSelectedDate(formatDate(selectedEvent.start));
            setGarbageType(selectedEvent.garbageType);
        } else {
            if (!clickedDate) {
                setGarbageType("");
                return;
            }
            setSelectedDate(formatDate(clickedDate));
        }
    }, [selectedEvent]);

    // Get the date
    useEffect(() => {
        if (!clickedDate) {
            return;
        }
        setSelectedDate(formatDate(clickedDate));
    }, [clickedDate]);

    // Remove an collection
    function remove() {
        if (!selectedEvent) {
            setErrorMessages(["Deze ophaling bestaat niet."]);
            return;
        }
        deleteGarbageCollection(selectedEvent.id).then(
            (_) => {
                onDelete(selectedEvent.id);
                closeModal();
            },
            (err) => {
                setErrorMessages(handleError(err));
            }
        );
    }

    // Submit the form
    function submit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!garbageType) {
            setErrorMessages(["Type mag niet leeg zijn."]);
            return;
        }
        if (!building) {
            setErrorMessages(["Gebouw bestaat niet."]);
            return;
        }
        const t: string | undefined = Object.keys(garbageTypes).find(
            (key: string) => garbageTypes[key] === garbageType
        );
        if (!t) {
            setErrorMessages(["Type bestaat niet."]);
            return;
        }
        if (selectedEvent) { // If it is an existing event, patch
            const patchBody: { [name: string]: string | number | number[] } = {};
            if (garbageType != selectedEvent.title) {
                patchBody["garbage_type"] = t;
            }
            if (formatDate(selectedEvent.start) != selectedDate) {
                patchBody["date"] = selectedDate;
            }
            patchGarbageCollection(selectedEvent.id, patchBody).then(
                (res) => {
                    const g: GarbageCollectionInterface = res.data;
                    onPatch(g);
                    setGarbageType("");
                    closeModal();
                },
                (err) => {
                    setErrorMessages(handleError(err));
                }
            );
        } else { // If it is a new event, post
            postGarbageCollection(building.id, selectedDate, t)
                .then()
                .then(
                    (res) => {
                        const g: GarbageCollectionInterface = res.data;
                        onPost(g);
                        setGarbageType("");
                        closeModal();
                    },
                    (err) => {
                        setErrorMessages(handleError(err));
                    }
                );
        }
    }

    return (
        <Modal show={show} onHide={() => closeModal()}>
            <Modal.Header>
                <Modal.Title>{selectedEvent ? "Pas ophaling aan" : "Voeg ophaling toe"}</Modal.Title>
            </Modal.Header>
            {errorMessages.length !== 0 && (
                <div className={"visible alert alert-danger alert-dismissible fade show"}>
                    <ul>
                        {errorMessages.map((err, i) => (
                            <li key={i}>{t(err)}</li>
                        ))}
                    </ul>
                    <button type="button" className="btn-close" onClick={() => setErrorMessages([])}></button>
                </div>
            )}
            <Form onSubmit={submit}>
                <Modal.Body>
                    <div className="form-outline mb-4">
                        <label className="form-label">Datum:</label>
                        <input
                            type="date"
                            className="form-control"
                            value={selectedDate}
                            onChange={(event) => setSelectedDate(event.target.value)}
                        />
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
                                    <option value={value} key={value}>
                                        {value}
                                    </option>
                                );
                            })}
                        </select>
                    </div>
                    {selectedEvent && (
                        <Button className="btn-danger" onClick={() => remove()}>
                            Verwijder
                        </Button>
                    )}
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
                        {selectedEvent ? "Pas aan" : "Voeg toe"}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}
