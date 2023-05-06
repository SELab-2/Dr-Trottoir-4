import React, {useState} from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import {addDays, startOfWeek} from "date-fns";
import TourAutocomplete from "@/components/autocompleteComponents/tourAutocomplete";
import {formatDate} from "@/lib/date";
import ErrorMessageAlert from "@/components/errorMessageAlert";
import { postStudentOnTour} from "@/lib/student-on-tour";
import {handleError} from "@/lib/error";
import TourUserAutocomplete from "@/components/autocompleteComponents/tourUsersAutocomplete";

function AddEventModal(data: any) {
    const {isOpen, onClose, reload} = data;
    const [tourId, setTourId] = useState(-1);
    const [studentId, setStudentId] = useState(-1);
    const [date, setDate] = useState<Date | null>(null);
    const [errorMessages, setErrorMessages] = useState<string[]>([]);

    const handleSave = () => {
        if (tourId === -1 || studentId === -1) {
            setErrorMessages([...errorMessages, "Ronde of student is leeg."]);
        } else {
            if (date !== null) {
                postStudentOnTour(tourId, studentId, formatDate(date)).then(
                    (_) => {
                            const start = startOfWeek(date)
                            const end = addDays(start, 6)
                            reload(start, end);
                            onClose();

                    },
                    (err) => {
                        const e = handleError(err);
                        setErrorMessages([...errorMessages, ...e]);
                    }
                )
            } else {
                setErrorMessages([...errorMessages, "Start datum mag niet leeg zijn."]);
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
                setDate(null)
                onClose();
            }}
        >
            <Modal.Header closeButton>
                <Modal.Title>Voeg rondedag toe</Modal.Title>
            </Modal.Header>
            <ErrorMessageAlert errorMessages={errorMessages} setErrorMessages={setErrorMessages}/>
            <Modal.Body>
                <form>
                    <div className="form-group">
                        <TourAutocomplete initialId={tourId} setObjectId={setTourId} required={true}/>
                    </div>
                    <div className="form-group">
                        <label>Student*</label>
                        <TourUserAutocomplete initialId={studentId} setObjectId={setStudentId} required={true}/>
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
                    Close
                </Button>
                <Button variant="primary" onClick={handleSave}>
                    Save Changes
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default AddEventModal;
