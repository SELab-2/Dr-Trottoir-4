import React, {useState} from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import StudentAutocomplete from "@/components/autocompleteComponents/studentAutocomplete";
import TourAutocomplete from "@/components/autocompleteComponents/tourAutocomplete";
import {handleError} from "@/lib/error";
import ErrorMessageAlert from "@/components/errorMessageAlert";
import {patchStudentOnTour} from "@/lib/student-on-tour";
import {formatDate} from "@/lib/date";

function EditEventModal(data: any) {
    const {event, isOpen, onClose, onDelete, onDeleteTour, reload} = data;
    const [tourId, setTourId] = useState(event.tour.id);
    const [studentId, setStudentId] = useState(event.student.id);
    const [errorMessages, setErrorMessages] = useState<string[]>([]);

    const handleSave = () => {
        patchStudentOnTour(event.id, tourId, studentId, formatDate(event.start)).then(
            (_) => {
                reload(null, null);
                setErrorMessages([]);
                onClose();
            },
            (err) => {
                const e = handleError(err);
                setErrorMessages([...errorMessages, ...e]);
            }
        );
    };

    const handleDelete = () => {
        onDelete(event);
        onClose();
    };

    const handleTourDelete = () => {
        onDeleteTour(event)
        onClose();
    }

    return (
        <Modal show={isOpen} onHide={() => {setErrorMessages([]);onClose()}}>
            <Modal.Header closeButton>
                <Modal.Title>Bewerk Ronde</Modal.Title>
            </Modal.Header>
            <ErrorMessageAlert errorMessages={errorMessages} setErrorMessages={setErrorMessages}/>
            <Modal.Body>
                <form>
                    <div className="form-group">
                        <label>Ronde</label>
                        <TourAutocomplete
                            initialId={tourId}
                            setObjectId={setTourId}
                            required={true}
                        />
                    </div>
                    <div className="form-group">
                        <label>Student</label>
                        <StudentAutocomplete
                            initialId={studentId}
                            setObjectId={setStudentId}
                            required={true}
                        />
                    </div>
                </form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="danger" onClick={handleTourDelete}>
                    Delete Ronde
                </Button>
                <Button variant="danger" onClick={handleDelete}>
                    Delete
                </Button>
                <Button variant="primary" onClick={handleSave}>
                    Sla op
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default EditEventModal;
