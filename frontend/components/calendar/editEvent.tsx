import {useState} from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

function EditEventModal(data: any) {
    const {event, isOpen, onClose, onSave} = data
    const start_time = event.start_time
    const end_time = event.end_time
    const [title, setTitle] = useState(event.title);
    const [student, setStudent] = useState(event.student)

    const handleSave = () => {
        onSave({title, student, start_time, end_time});
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

export default EditEventModal;
