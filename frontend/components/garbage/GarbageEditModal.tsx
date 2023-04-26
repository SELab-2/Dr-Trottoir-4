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
import { BuildingInterface, getAddress } from "@/lib/building";
import { formatDate } from "@/lib/date";
import { handleError } from "@/lib/error";
import { GarbageCollectionEvent } from "@/types";
import ErrorMessageAlert from "@/components/errorMessageAlert";

export default function GarbageEditModal({
    selectedEvent,
    show,
    closeModal,
    onPost,
    onPatch,
    onDelete,
    clickedDate,
    buildings,
}: {
    selectedEvent: GarbageCollectionEvent | null;
    show: boolean;
    closeModal: () => void;
    onPost: (g: GarbageCollectionInterface) => void;
    onPatch: (g: GarbageCollectionInterface) => void;
    onDelete: (g: number) => void;
    clickedDate: Date | null;
    buildings: BuildingInterface[];
}) {
    const { t } = useTranslation();
    const [errorMessages, setErrorMessages] = useState<string[]>([]);
    const [selectedDate, setSelectedDate] = useState<string>(formatDate(new Date()));
    const [garbageType, setGarbageType] = useState<string>("");
    const [selectedBuilding, setSelectedBuilding] = useState<BuildingInterface | null>(null);

    // Get the selected event garbage type & date or empty if selectedEvent is null
    useEffect(() => {
        if (selectedEvent) {
            setSelectedDate(formatDate(selectedEvent.start));
            setGarbageType(selectedEvent.garbageType);
            setSelectedBuilding(selectedEvent.building);
        } else {
            if (!clickedDate) {
                setGarbageType("");
                return;
            }
            setSelectedDate(formatDate(clickedDate));
            setSelectedBuilding(null);
        }
    }, [selectedEvent]);

    // Get the date
    useEffect(() => {
        if (!clickedDate) {
            return;
        }
        setSelectedDate(formatDate(clickedDate));
    }, [clickedDate]);

    // Remove a garbage collection
    function remove() {
        if (!selectedEvent) {
            setErrorMessages(["Deze ophaling bestaat niet."]);
            return;
        }
        deleteGarbageCollection(selectedEvent.id).then(
            (_) => {
                onDelete(selectedEvent.id);
                close();
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
        const t: string | undefined = Object.keys(garbageTypes).find(
            (key: string) => garbageTypes[key] === garbageType
        );
        if (!t) {
            setErrorMessages(["Type bestaat niet."]);
            return;
        }
        if (!selectedBuilding) {
            setErrorMessages(["Geen gebouw geselecteerd."]);
            return;
        }
        if (selectedEvent) {
            // If it is an existing event, patch
            const patchBody: { [name: string]: string | number | number[] } = {};
            if (garbageType != selectedEvent.title) {
                patchBody["garbage_type"] = t;
            }
            if (formatDate(selectedEvent.start) != selectedDate) {
                patchBody["date"] = selectedDate;
            }
            if (selectedBuilding.id != selectedEvent.building.id) {
                patchBody["building"] = selectedBuilding.id;
            }
            patchGarbageCollection(selectedEvent.id, patchBody).then(
                (res) => {
                    const g: GarbageCollectionInterface = res.data;
                    onPatch(g);
                    close();
                },
                (err) => {
                    setErrorMessages(handleError(err));
                }
            );
        } else {
            // If it is a new event, post
            postGarbageCollection(selectedBuilding.id, selectedDate, t).then(
                (res) => {
                    const g: GarbageCollectionInterface = res.data;
                    onPost(g);
                    close();
                },
                (err) => {
                    setErrorMessages(handleError(err));
                }
            );
        }
    }

    function close() {
        setSelectedBuilding(null);
        setGarbageType("");
        closeModal();
    }

    function onShow() {
        if (buildings.length === 1 && !selectedEvent) {
            setSelectedBuilding(buildings[0]);
        }
    }

    return (
        <Modal show={show} onHide={() => close()} onShow={onShow}>
            <Modal.Header>
                <Modal.Title>{selectedEvent ? "Pas ophaling aan" : "Voeg ophaling toe"}</Modal.Title>
            </Modal.Header>
            <ErrorMessageAlert errorMessages={errorMessages} setErrorMessages={setErrorMessages} />
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
                        <label className="form-label">Gebouw:</label>
                        <select
                            className={`form-select form-control form-control-lg ${styles.input}`}
                            value={selectedBuilding ? selectedBuilding.id.toString() : ""}
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                                const foundBuilding: BuildingInterface | undefined = buildings.find(
                                    (b) => b.id.toString() === e.target.value
                                );
                                if (!foundBuilding) {
                                    return;
                                }
                                setSelectedBuilding(foundBuilding);
                            }}
                        >
                            <option disabled value="" key="" />
                            {buildings.map((b: BuildingInterface) => (
                                <option value={b.id.toString()} key={b.id.toString()}>
                                    {getAddress(b)}
                                </option>
                            ))}
                        </select>
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
                            close();
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
