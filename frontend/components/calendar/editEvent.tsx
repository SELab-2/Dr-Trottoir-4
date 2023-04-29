import { ChangeEvent, useState } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import {User, userSearchString} from "@/lib/user";
import { Tour } from "@/lib/tour";
import StudentAutocomplete from "@/components/autocompleteComponents/studentAutocomplete";
import TourAutocomplete from "@/components/autocompleteComponents/tourAutocomplete";

function EditEventModal(data: any) {
    const { event, allStudents, allTours, isOpen, onClose, onSave, onDelete, onDeleteTour} = data;
    const [tour, setTour] = useState(event.tour.name);
    const [tourId, setTourId] = useState(event.tour.id);
    const [student, setStudent] = useState(userSearchString(event.student));
    const [studentId, setStudentId] = useState(event.student.id);

    const handleSave = () => {
        const currentStudent: User = allStudents.find((student: User) => student.id === studentId);
        const currentTour: Tour = allTours.find((tour: Tour) => tour.id === tourId);
        let data = { tour: currentTour, student: currentStudent };
        onSave(data);
        onClose();
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
        <Modal show={isOpen} onHide={onClose}>
            <Modal.Header closeButton>
                <Modal.Title>Bewerk Ronde</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <form>
                    <div className="form-group">
                        <label>Ronde</label>
                        <TourAutocomplete
                            value={tour}
                            onChange={setTour}
                            setObjectId={setTourId}
                            required={true}
                        />
                    </div>
                    <div className="form-group">
                        <label>Student</label>
                        <StudentAutocomplete
                            value={student}
                            onChange={setStudent}
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
