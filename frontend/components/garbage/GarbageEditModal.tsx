import {Button, Form, Modal} from "react-bootstrap";
import React, {useEffect, useState} from "react";
import {
    deleteGarbageCollection,
    GarbageCollectionInterface,
    garbageTypes,
    patchGarbageCollection,
    postGarbageCollection,
} from "@/lib/garbage-collection";
import {BuildingInterface, getAddress} from "@/lib/building";
import {formatDate} from "@/lib/date";
import {handleError} from "@/lib/error";
import {GarbageCollectionEvent} from "@/types";
import ErrorMessageAlert from "@/components/errorMessageAlert";
import Select from "react-select";

interface OptionType {
    value: number;
    label: string;
}

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
    onPost: (g: GarbageCollectionInterface[]) => void;
    onPatch: (g: GarbageCollectionInterface) => void;
    onDelete: (g: number) => void;
    clickedDate: Date | null;
    buildings: BuildingInterface[];
}) {
    const [errorMessages, setErrorMessages] = useState<string[]>([]);
    const [selectedDate, setSelectedDate] = useState<string>(formatDate(new Date()));
    const [garbageType, setGarbageType] = useState<string>("");
    const [selectedBuildings, setSelectedBuildings] = useState<OptionType[]>([]);
    const [selectedAll, setSelectedAll] = useState<boolean>(false);

    useEffect(() => {
        if (buildings.length > 0 && selectedBuildings.length === buildings.length) {
            setSelectedAll(true);
        } else {
            setSelectedAll(false);
        }
    }, [selectedBuildings]);

    // Get the selected event garbage type & date or empty if selectedEvent is null
    useEffect(() => {
        if (selectedEvent) {
            setSelectedDate(formatDate(selectedEvent.start));
            setGarbageType(selectedEvent.garbageType);
            setSelectedBuildings([{ value: selectedEvent.building.id, label: getAddress(selectedEvent.building) }]);
        } else {
            if (!clickedDate) {
                setGarbageType("");
                return;
            }
            setSelectedDate(formatDate(clickedDate));
            setSelectedBuildings([]);
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
        if (selectedBuildings.length <= 0) {
            setErrorMessages(["Geen gebouw geselecteerd."]);
            return;
        }
        if (selectedEvent) {
            // If it is an existing event, patch
            const selectedBuildingId: number = selectedBuildings[0].value;
            const patchBody: { [name: string]: string | number | number[] } = {};
            if (garbageType != selectedEvent.garbageType) {
                patchBody["garbage_type"] = t;
            }
            if (formatDate(selectedEvent.start) != selectedDate) {
                patchBody["date"] = selectedDate;
            }
            if (selectedBuildingId != selectedEvent.building.id) {
                patchBody["building"] = selectedBuildingId;
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
            // Do a post for all the selected buildings
            Promise.all(selectedBuildings.map((bId) => postGarbageCollection(bId.value, selectedDate, t))).then(
                (res) => {
                    const g: any[] = res;
                    const data: GarbageCollectionInterface[] = g.map((el) => el.data).flat();
                    onPost(data);
                    close();
                },
                (err) => {
                    setErrorMessages(handleError(err));
                }
            );
        }
    }

    function close() {
        setSelectedBuildings([]);
        setGarbageType("");
        setSelectedAll(false);
        closeModal();
    }

    function changeSelectAll() {
        if (selectedAll) {
            setSelectedBuildings([]);
        } else {
            setSelectedBuildings(
                buildings.map((b) => {
                    return { value: b.id, label: getAddress(b) };
                })
            );
        }
        setSelectedAll(!selectedAll);
    }

    return (
        <Modal show={show} onHide={() => close()}>
            <Modal.Header>
                <Modal.Title>{selectedEvent ? "Pas ophaling aan" : "Voeg ophaling(en) toe"}</Modal.Title>
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
                    {selectedEvent && (
                        <div className="form-outline mb-4">
                            <label className="form-label">Gebouw:</label>
                            <Select
                                options={buildings.map((b) => {
                                    return { value: b.id, label: getAddress(b) };
                                })}
                                value={selectedBuildings}
                                onChange={(s) => {
                                    if (s && s.value) {
                                        setSelectedBuildings([s]);
                                    }
                                }}
                                placeholder={"Selecteer gebouw"}
                            />
                        </div>
                    )}
                    {!selectedEvent && (
                        <>
                            <div className="form-outline mb-4">
                                <label className="form-label">Gebouw(en):</label>
                                <Select
                                    options={buildings.map((b) => {
                                        return { value: b.id, label: getAddress(b) };
                                    })}
                                    value={selectedBuildings}
                                    onChange={(selects) => {
                                        setSelectedBuildings(selects.map((s) => s));
                                    }}
                                    isMulti={true}
                                    placeholder={"Selecteer gebouw(en)"}
                                />
                            </div>
                            <div className="form-outline mb-4">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    checked={selectedAll}
                                    onChange={() => changeSelectAll()}
                                    id="selectAllCheck"
                                />
                                <label className="form-check-label" htmlFor="selectAllCheck">
                                    Selecteer alle gebouwen
                                </label>
                            </div>
                        </>
                    )}
                    <div className="form-outline mb-4">
                        <label className="form-label">Type:</label>
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
