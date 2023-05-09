import React, { useState } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { addDays, startOfWeek } from "date-fns";
import TourAutocomplete from "@/components/autocompleteComponents/tourAutocomplete";
import { formatDate } from "@/lib/date";
import ErrorMessageAlert from "@/components/errorMessageAlert";
import { postStudentOnTour } from "@/lib/student-on-tour";
import { handleError } from "@/lib/error";
import TourUserAutocomplete from "@/components/autocompleteComponents/tourUsersAutocomplete";

function AddScheduleEventModal(
    {
        isOpen,
        onClose
    } : {
        isOpen: boolean;
        onClose: () => void
    }
) {
    const [tourId, setTourId] = useState(-1);
    const [studentId, setStudentId] = useState(-1);
    const [date, setDate] = useState<Date | null>(null);
    const [errorMessages, setErrorMessages] = useState<string[]>([]);

    const handleSave = () => {
        if (tourId === -1 || studentId === -1) {
            setErrorMessages(["Ronde of student is leeg."]);
        } else {
            if (date) {
                postStudentOnTour(tourId, studentId, formatDate(date)).then(
                    (_) => {
                        const start = startOfWeek(date);
                        const end = addDays(start, 6);
                        onClose();
                    },
                    (err) => {
                        const e = handleError(err);
                        setErrorMessages([...errorMessages, ...e]);
                    }
                );
            } else {
                setErrorMessages(["Start datum mag niet leeg zijn."]);
            }
        }
    };

    const handleStartDateChange = (e: { target: { value: string | number | Date } }) => {
        setDate(new Date(e.target.value));
    };

    return (
        <Modal
            show={isOpen}
            onHide={() => {
                setTourId(-1);
                setStudentId(-1);
                setDate(null);
                onClose();
            }}
        >
            <Modal.Header closeButton>
                <Modal.Title>Voeg rondedag toe</Modal.Title>
            </Modal.Header>
            <ErrorMessageAlert errorMessages={errorMessages} setErrorMessages={setErrorMessages} />
            <Modal.Body>
                <form>
                    <div className="form-group">
                        <TourAutocomplete initialId={tourId} setObjectId={setTourId} required={false} />
                    </div>
                    <div className="form-group">
                        <label>Selecteer student</label>
                        <TourUserAutocomplete initialId={studentId} setObjectId={setStudentId} tourId={tourId} />
                    </div>
                    <div className="form-row">
                        <div className="col">
                            <label>Datum:</label>
                            <input
                                type="date"
                                value={date ? formatDate(date) : ""}
                                onChange={handleStartDateChange}
                                className="form-control"
                            />
                        </div>
                    </div>
                </form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onClose}>
                    Sluit
                </Button>
                <Button variant="primary" onClick={handleSave}>
                    Sla op
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default AddScheduleEventModal;
