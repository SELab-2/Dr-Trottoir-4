import {useState} from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

function LoadEventsModal(data: any) {
    const {isOpen, onClose, onSave} = data
    const [start_date, setStartdate] = useState("");
    const [end_date, setEnddate] = useState("");

    const handleSave = () => {
        console.log(start_date)
        console.log(end_date)
        onSave({start_date, end_date});
        onClose();
    };

    return (
        <Modal show={isOpen} onHide={onClose}>
            <Modal.Header closeButton>
                <Modal.Title>Laad vorige planning</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <form>
                    <div className="form-row">
                        <div className="col">
                            <label>Start datum:</label>
                            <input type="date" className="form-control" value={start_date}
                                   onChange={(event) => setStartdate(event.target.value)}/>
                        </div>
                        <div className="col">
                            <label htmlFor="end-time">Eind datum:</label>
                            <input type="date" className="form-control" value={end_date}
                                   onChange={(event) => setEnddate(event.target.value)}/>
                        </div>
                    </div>
                </form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onClose}>
                    Close
                </Button>
                <Button variant="primary" onClick={handleSave}>
                    Laad
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default LoadEventsModal;
