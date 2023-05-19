import React, { useEffect, useState } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import TourAutocomplete from "@/components/autocompleteComponents/tourAutocomplete";
import { formatDate } from "@/lib/date";
import ErrorMessageAlert from "@/components/errorMessageAlert";
import { postStudentOnTour, StudentOnTour } from "@/lib/student-on-tour";
import { handleError } from "@/lib/error";
import TourUserAutocomplete from "@/components/autocompleteComponents/tourUserAutocomplete";
import LocaleDatePicker from "@/components/datepicker/datepicker";

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
    const [tourId, setTourId] = useState<number | null>(null);
    const [studentId, setStudentId] = useState<number | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [errorMessages, setErrorMessages] = useState<string[]>([]);

    useEffect(() => {
        if (date) {
            setSelectedDate(date);
        } else {
            setSelectedDate(new Date());
        }
    }, [date]);

    function handleSave() {
        if (tourId === null || studentId === null) {
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
                setTourId(null);
                setStudentId(null);
                setSelectedDate(new Date());
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
                        <TourAutocomplete initialId={tourId} setObjectId={setTourId} matchId={studentId} />
                    </div>
                    <div className="form-group">
                        <label>Selecteer student</label>
                        <TourUserAutocomplete initialId={studentId} setObjectId={setStudentId} matchId={tourId} />
                    </div>
                    <div className="form-row">
                        <div className="col">
                            <label>Datum:</label>
                            <LocaleDatePicker setSelectedDate={setSelectedDate} selectedDate={selectedDate} />
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
