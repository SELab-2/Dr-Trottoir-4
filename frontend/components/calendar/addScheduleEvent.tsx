import React, { useEffect, useState } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import TourAutocomplete from "@/components/autocompleteComponents/tourAutocomplete";
import { formatDate } from "@/lib/date";
import ErrorMessageAlert from "@/components/errorMessageAlert";
import { postStudentOnTour, StudentOnTour } from "@/lib/student-on-tour";
import { handleError } from "@/lib/error";
import TourUserAutocomplete from "@/components/autocompleteComponents/tourUsersAutocomplete";

function AddScheduleEventModal({
    isOpen,
    onClose,
    date,
    onPost,
}: {
    isOpen: boolean;
    onClose: () => void;
    date: Date | null;
    onPost: (sot: StudentOnTour) => void;
}) {
    const [tourId, setTourId] = useState(-1);
    const [studentId, setStudentId] = useState(-1);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [errorMessages, setErrorMessages] = useState<string[]>([]);

    useEffect(() => {
        if (date) {
            setSelectedDate(date);
        } else {
            setSelectedDate(new Date());
        }
    }, [date]);

    function handleSave() {
        if (tourId === -1 || studentId === -1) {
            setErrorMessages(["Ronde of student is leeg."]);
        } else {
            if (selectedDate) {
                postStudentOnTour(tourId, studentId, formatDate(selectedDate)).then(
                    (res) => {
                        const sot: StudentOnTour = res.data;
                        onPost(sot);
                        onClose();
                    },
                    (err) => setErrorMessages(handleError(err))
                );
            } else {
                setErrorMessages(["Start datum mag niet leeg zijn."]);
            }
        }
    }

    function handleStartDateChange(e: { target: { value: string | number | Date } }) {
        setSelectedDate(new Date(e.target.value));
    }

    return (
        <Modal
            show={isOpen}
            onHide={() => {
                setTourId(-1);
                setStudentId(-1);
                setSelectedDate(null);
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
                                value={selectedDate ? formatDate(selectedDate) : ""}
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
