import {ChangeEvent, useState} from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import {User} from "@/lib/user";
import {Tour} from "@/lib/tour";

function EditEventModal(data: any) {
    const { event, allStudents, allTours, isOpen, onClose, onSave, onDelete } = data;
    const [tour, setTour] = useState<Tour | null>(event.tour);
    const [student, setStudent] = useState(event.student);

    const handleSave = () => {
        let data = { tour: tour, student: student };
        onSave(data);
        onClose();
    };

    const handleDelete = () => {
        onDelete({ event });
        onClose();
    };

    const handleTourChange = (e: ChangeEvent<HTMLSelectElement>) => {
        const tourID = Number(e.target.value);
        const selectedTour = allTours.find((tour: Tour) => tour.id === tourID);
        setTour(selectedTour);
    };

    const handleStudentChange = (e: ChangeEvent<HTMLSelectElement>) => {
        const studentID = Number(e.target.value);
        const selectedStudent = allStudents.find((user: User) => user.id === studentID);
        setStudent(selectedStudent);
    };

    return (
        <Modal show={isOpen} onHide={onClose}>
            <Modal.Header closeButton>
                <Modal.Title>Bewerk Ronde</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <form>
                    <div className="form-group">
                        <label>Ronde</label>
                        <select className="form-control" value={tour?.id} onChange={handleTourChange}>
                            <option value="">-- Selecteer Ronde --</option>
                            {allTours.map((tour: Tour) => (
                                <option key={tour.id} value={tour.id}>
                                    {tour.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Student</label>
                        <select className="form-control" value={student?.id} onChange={handleStudentChange}>
                            {allStudents.map((user: User) => (
                                <option key={user.id} value={user.id}>
                                    {user.first_name} {user.last_name}
                                </option>
                            ))}
                        </select>
                    </div>
                </form>
            </Modal.Body>
            <Modal.Footer>
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
