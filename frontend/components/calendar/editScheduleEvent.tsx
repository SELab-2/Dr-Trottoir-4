import React, { useEffect, useState } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import TourAutocomplete from "@/components/autocompleteComponents/tourAutocomplete";
import { handleError } from "@/lib/error";
import ErrorMessageAlert from "@/components/errorMessageAlert";
import { patchStudentOnTour } from "@/lib/student-on-tour";
import { formatDate } from "@/lib/date";
import TourUserAutocomplete from "@/components/autocompleteComponents/tourUsersAutocomplete";
import { ScheduleEvent } from "@/types";

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
                <form>
                    <div className="form-outline mb-4">
                        <label className="form-label">Datum:</label>
                        <input
                            type="date"
                            className="form-control"
                            value={formatDate(date)}
                            onChange={(event) => setDate(new Date(event.target.value))}
                        />
                    </div>
                    <div className="form-group">
                        <TourAutocomplete initialId={tourId} setObjectId={setTourId} required={false} />
                    </div>
                    <div className="form-group">
                        <label>Selecteer student</label>
                        <TourUserAutocomplete initialId={studentId} setObjectId={setStudentId} tourId={tourId} />
                    </div>
                </form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="danger" onClick={handleTourDelete}>
                    Verwijder ronde (voor hele week)
                </Button>
                <Button variant="danger" onClick={handleDelete}>
                    Verwijder
                </Button>
                <Button variant="primary" onClick={handleSave}>
                    Sla op
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default EditScheduleEventModal;
