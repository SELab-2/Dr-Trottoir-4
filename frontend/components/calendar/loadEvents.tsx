import {useEffect, useState} from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import {addDays, startOfWeek} from "date-fns";

function LoadEventsModal(data: any) {
    const {range, isOpen, onClose, onSave} = data;
    const [start_date, setStart] = useState(new Date(
        startOfWeek(new Date(), {weekStartsOn: 1}).toLocaleString("en", {
            timeZone: "America/New_York",
        })));
    const [end_date, setEnd] = useState(addDays(start_date, 6));

    useEffect(() => {
        setEnd(addDays(start_date, 6))
    }, [start_date]);

    const handleSave = () => {
        const diffTime = Math.abs(start_date.getTime() - range.start.getTime()); // get the time difference in milliseconds
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // convert the time difference to days
        onSave(start_date, diffDays - 1);
        onClose();
    };

    const handleStartDateChange = (e: { target: { value: string | number | Date } }) => {
        setStart(new Date(e.target.value));
    };

    const handleEndDateChange = (e: { target: { value: string | number | Date } }) => {
        setEnd(new Date(e.target.value));
    };

    return (
        <Modal show={isOpen} onHide={onClose}>
            <Modal.Header closeButton>
                <Modal.Title>Kopieer naar deze week</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <form>
                    <div className="form-row">
                        <div className="col">
                            <label>Start datum:</label>
                            <input
                                type="date"
                                className="form-control"
                                value={start_date.toISOString().substring(0, 10)}
                                onChange={handleStartDateChange}
                            />
                        </div>
                        <div className="col">
                            <label htmlFor="end-time">Eind datum:</label>
                            <input
                                type="date"
                                className="form-control"
                                value={end_date.toISOString().substring(0, 10)}
                                onChange={handleEndDateChange}
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
                    Kopieer
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default LoadEventsModal;
