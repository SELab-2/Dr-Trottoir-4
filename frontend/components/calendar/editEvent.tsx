import { useState } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";

function EditEventModal(data: any) {
    const { event, isOpen, onClose, onSave, onDelete } = data;
    const [title, setTitle] = useState(event.title);
    const [student, setStudent] = useState(event.student);
    const [start_time, setStarttime] = useState(event.start_time);
    const [end_time, setEndtime] = useState(event.end_time);

    const handleSave = () => {
        onSave({ title, student, start_time, end_time });
        onClose();
    };

    const handleDelete = () => {
        onDelete({ event });
        onClose();
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
                        <input
                            type="text"
                            className="form-control"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label>Student</label>
                        <input
                            type="text"
                            className="form-control"
                            value={student}
                            onChange={(e) => setStudent(e.target.value)}
                        />
                    </div>
                    <div className="form-row">
                        <div className="col">
                            <label>Start uur:</label>
                            <input
                                type="time"
                                className="form-control"
                                value={start_time}
                                onChange={(event) => setStarttime(event.target.value)}
                            />
                        </div>
                        <div className="col">
                            <label htmlFor="end-time">Eind uur:</label>
                            <input
                                type="time"
                                className="form-control"
                                value={end_time}
                                onChange={(event) => setEndtime(event.target.value)}
                            />
                        </div>
                    </div>
                </form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="danger" onClick={handleDelete}>
                    Delete
                </Button>
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

export default EditEventModal;
