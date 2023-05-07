import React, { useEffect, useState } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { addDays, endOfWeek, startOfWeek } from "date-fns";
import ErrorMessageAlert from "@/components/errorMessageAlert";
import {postBulkStudentOnTour, StudentOnTourPost} from "@/lib/student-on-tour";
import {formatDate} from "@/lib/date";
import {handleError} from "@/lib/error";

function LoadEventsModal(data: any) {
    const { range, events, isOpen, onClose, onSave } = data;
    const [start_date, setStart] = useState(
        new Date(
            startOfWeek(new Date(), { weekStartsOn: 1 }).toLocaleString("en", {
                timeZone: "America/New_York",
            })
        )
    );
    const [end_date, setEnd] = useState(endOfWeek(start_date));
    const [errorMessages, setErrorMessages] = useState<string[]>([]);

    useEffect(() => {
        setEnd(endOfWeek(start_date));
    }, [start_date]);

    const handleSave = () => {
        start_date.setHours(0);
        const diffTime = Math.abs(start_date.getTime() - range.start.getTime()); // get the time difference in milliseconds
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // convert the time difference to days
        let newEvents: StudentOnTourPost[] = [];
        for (let e of events) {
            if (e.start >= range.start && e.start <= range.end) {
                newEvents.push({
                    tour: e.tour.id,
                    student: e.student.id,
                    date: formatDate(addDays(e.start, diffDays)),
                });
            }
        }
        postBulkStudentOnTour(newEvents).then(
            (_) => {
                if (start_date !== null) {
                    onSave(start_date, end_date);
                    setStart(
                        new Date(
                            startOfWeek(new Date(), { weekStartsOn: 1 }).toLocaleString("en", {
                                timeZone: "America/New_York",
                            })
                        )
                    );
                    setEnd(addDays(start_date, 6));
                    onClose();
                }
            },
            (err) => {
                const e = handleError(err);
                setErrorMessages([...errorMessages, ...e]);
            }
        );
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
                <Modal.Title>Kopieer deze week naar</Modal.Title>
            </Modal.Header>
            <ErrorMessageAlert errorMessages={errorMessages} setErrorMessages={setErrorMessages} />
            <Modal.Body>
                <form>
                    <div className="form-row">
                        <div className="col">
                            <label>Start datum:</label>
                            <input
                                type="date"
                                className="form-control"
                                value={formatDate(start_date)}
                                onChange={handleStartDateChange}
                            />
                        </div>
                        <div className="col">
                            <label htmlFor="end-time">Eind datum:</label>
                            <input
                                type="date"
                                className="form-control"
                                value={formatDate(end_date)}
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
