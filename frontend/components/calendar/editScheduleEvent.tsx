import React, { useEffect, useState } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import TourAutocomplete from "@/components/autocompleteComponents/tourAutocomplete";
import { handleError } from "@/lib/error";
import ErrorMessageAlert from "@/components/errorMessageAlert";
import { patchStudentOnTour } from "@/lib/student-on-tour";
import { formatDate } from "@/lib/date";
import TourUserAutocomplete from "@/components/autocompleteComponents/tourUserAutocomplete";
import { ScheduleEvent } from "@/types";
import LocaleDatePicker from "@/components/datepicker/datepicker";
import { Form } from "react-bootstrap";
import Link from "next/link";
import { startOfDay } from "date-fns";

function EditScheduleEventModal({
    event,
    isOpen,
    onClose,
    onDelete,
    onDeleteTour,
    onEdit,
}: {
    event: ScheduleEvent | null;
    isOpen: boolean;
    onClose: () => void;
    onDelete: (e: ScheduleEvent) => void;
    onDeleteTour: (e: ScheduleEvent) => void;
    onEdit: (id: number, tour: number, student: number, date: Date) => void;
}) {
    const [tourId, setTourId] = useState<number | null>(null);
    const [studentId, setStudentId] = useState<number | null>(null);
    const [date, setDate] = useState<Date>(new Date());
    const [errorMessages, setErrorMessages] = useState<string[]>([]);

    useEffect(() => {
        if (event) {
            setTourId(event.tour.id);
            setStudentId(event.student.id);
            setDate(event.start);
        } else {
            setTourId(null);
            setStudentId(null);
            setDate(new Date());
        }
    }, [event]);

    const handleSave = () => {
        if (!event || !tourId || !studentId) {
            return;
        }
        patchStudentOnTour(event.id, tourId, studentId, formatDate(date)).then(
            (res) => {
                onEdit(event.id, res.data.tour, res.data.student, date);
                setErrorMessages([]);
                onClose();
            },
            (err) => setErrorMessages(handleError(err))
        );
    };

    const handleDelete = () => {
        if (!event) {
            return;
        }
        onDelete(event);
        onClose();
    };

    const handleTourDelete = () => {
        if (!event) {
            return;
        }
        onDeleteTour(event);
        onClose();
    };

    function isEditable() {
        if (!event) {
            return true;
        }
        return new Date(event.start) >= startOfDay(new Date());
    }

    return (
        <Modal
            show={isOpen}
            onHide={() => {
                setErrorMessages([]);
                onClose();
            }}
        >
            <Modal.Header closeButton>
                <Modal.Title>Bewerk ronde dag</Modal.Title>
            </Modal.Header>
            <ErrorMessageAlert errorMessages={errorMessages} setErrorMessages={setErrorMessages} />
            <Modal.Body>
                {!isEditable() && (
                    <>
                        <div className="m-2">U kunt planningen in het verleden niet meer bewerken.</div>
                        <label>Bekijk de </label>
                        <Link
                            style={{
                                textDecoration: "underline",
                                color: "royalblue",
                            }}
                            href={{
                                pathname: "/admin/analysis/student-on-tour",
                                query: {
                                    studentOnTour: event?.id,
                                },
                            }}
                        >
                            {" "}
                            analyse{" "}
                        </Link>
                        <label> van deze student.</label>
                    </>
                )}
                <Form style={isEditable() ? undefined : { pointerEvents: "none", opacity: 0.6 }}>
                    <Form.Group className="form-outline mb-4">
                        <Form.Label className="form-label">Datum:</Form.Label>
                        <LocaleDatePicker setSelectedDate={setDate} selectedDate={date} />
                    </Form.Group>
                    <Form.Group className="form-group">
                        <TourAutocomplete initialId={tourId} setObjectId={setTourId} matchId={studentId} />
                    </Form.Group>
                    <Form.Group className="form-group">
                        <Form.Label>Selecteer student</Form.Label>
                        <TourUserAutocomplete initialId={studentId} setObjectId={setStudentId} matchId={tourId}/>
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                {isEditable() && (
                    <>
                        <Button variant="danger" onClick={handleTourDelete}>
                            Verwijder ronde (voor hele week)
                        </Button>
                        <Button variant="danger" onClick={handleDelete}>
                            Verwijder
                        </Button>
                        <Button variant="primary" onClick={handleSave}>
                            Sla op
                        </Button>
                    </>
                )}
            </Modal.Footer>
        </Modal>
    );
}

export default EditScheduleEventModal;
