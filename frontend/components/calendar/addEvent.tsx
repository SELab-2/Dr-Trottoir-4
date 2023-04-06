import {useState} from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

function AddEventModal(data: any) {
    const {isOpen, onClose, onSave} = data
    const [title, setTitle] = useState("");
    const [student, setStudent] = useState("");
    const [start, setStart] = useState(new Date());
    const [end, setEnd] = useState(new Date());
    const [start_time, setStarttime] = useState("");
    const [end_time, setEndtime] = useState("");


    const handleSave = () => {
        onSave({title, student, start, end, start_time, end_time});
        onClose();
    };

    const handleStartDateChange = (e: { target: { value: string | number | Date; }; }) => {
        setStart(new Date(e.target.value));
    };


    const handleEndDateChange = (e: { target: { value: string | number | Date; }; }) => {
        setEnd(new Date(e.target.value));
    };

    return (
        <Modal show={isOpen} onHide={onClose}>
            <Modal.Header closeButton>
                <Modal.Title>Voeg ronde toe</Modal.Title>
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
                            <label htmlFor="start-time">Start datum:</label>
                            <input type="date" value={start.toISOString().substring(0, 10)}
                                   onChange={handleStartDateChange} className="form-control"/>
                        </div>
                        <div className="col">
                            <label htmlFor="end-time">Eind datum:</label>
                            <input type="date" value={end.toISOString().substring(0, 10)} onChange={handleEndDateChange}
                                   className="form-control"/>
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="col">
                            <label>Start uur:</label>
                            <input type="time" className="form-control" value={start_time}
                                   onChange={(event) => setStarttime(event.target.value)}/>
                        </div>
                        <div className="col">
                            <label htmlFor="end-time">Eind uur:</label>
                            <input type="time" className="form-control" value={end_time}
                                   onChange={(event) => setEndtime(event.target.value)}/>
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
