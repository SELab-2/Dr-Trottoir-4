import React, { useState } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { addDays, addWeeks, differenceInDays, isSameWeek, startOfWeek } from "date-fns";
import ErrorMessageAlert from "@/components/errorMessageAlert";
import { postBulkStudentOnTour, StudentOnTourPost } from "@/lib/student-on-tour";
import { formatDate } from "@/lib/date";
import { handleError } from "@/lib/error";
import { ScheduleEvent } from "@/types";

function CopyScheduleEventsModal({
    range,
    events,
    isOpen,
    onClose,
}: {
    range: { start: Date; end: Date };
    events: ScheduleEvent[];
    isOpen: boolean;
    onClose: () => void;
}) {
    const [copyTo, setCopyTo] = useState(startOfWeek(addWeeks(range.start, 1)));
    const [errorMessages, setErrorMessages] = useState<string[]>([]);

    const handleSave = () => {
        const displayedSunday = startOfWeek(range.start);
        if (isSameWeek(copyTo, displayedSunday)) {
            setErrorMessages(["Kan niet kopiëren naar huidige week."]);
            return;
        }
        const start = startOfWeek(copyTo);

        const diff: number = differenceInDays(start, displayedSunday);

        let newEvents: StudentOnTourPost[] = [];

        for (let e of events) {
            newEvents.push({
                tour: e.tour.id,
                student: e.student.id,
                date: formatDate(addDays(e.start, diff)),
            });
        }
        postBulkStudentOnTour(newEvents).then(
            (_) => {
                onClose();
            },
            (err) => setErrorMessages(handleError(err))
        );
    };

    function onShow() {
        setCopyTo(startOfWeek(addWeeks(range.start, 1)));
    }

    return (
        <Modal show={isOpen} onHide={onClose} onShow={onShow}>
            <Modal.Header closeButton>
                <Modal.Title>Kopieer deze week naar</Modal.Title>
            </Modal.Header>
            <ErrorMessageAlert errorMessages={errorMessages} setErrorMessages={setErrorMessages} />
            <Modal.Body>
                <form>
                    <div className="form-row">
                        <div className="col">
                            <label>Kopieer naar week:</label>
                            <input
                                type="date"
                                className="form-control"
                                value={formatDate(copyTo)}
                                onChange={(e) => {
                                    setCopyTo(startOfWeek(new Date(e.target.value)));
                                }}
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

export default CopyScheduleEventsModal;
