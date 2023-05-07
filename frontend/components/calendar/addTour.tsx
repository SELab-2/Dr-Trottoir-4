import React, { useState } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { addDays } from "date-fns";
import TourAutocomplete from "@/components/autocompleteComponents/tourAutocomplete";
import { formatDate } from "@/lib/date";
import ErrorMessageAlert from "@/components/errorMessageAlert";
import { postBulkStudentOnTour, StudentOnTourPost } from "@/lib/student-on-tour";
import { handleError } from "@/lib/error";
import TourUserAutocomplete from "@/components/autocompleteComponents/tourUsersAutocomplete";

function AddTourModal(data: any) {
    const { isOpen, onClose, reload } = data;
    const [tourId, setTourId] = useState(null);
    const [studentId, setStudentId] = useState(-1);
    const [start, setStart] = useState<Date | null>(null);
    const [checked, setChecked] = useState(true);
    const [sundayId, setSundayId] = useState(-1);
    const [mondayId, setMondayId] = useState(-1);
    const [tuesdayId, setTuesdayId] = useState(-1);
    const [wednesdayId, setWednesdayId] = useState(-1);
    const [thursdayId, setThursdayId] = useState(-1);
    const [fridayId, setFridayId] = useState(-1);
    const [errorMessages, setErrorMessages] = useState<string[]>([]);

    const handleSave = () => {
        if (tourId === null || studentId === -1) {
            setErrorMessages([...errorMessages, "Ronde of student is leeg."]);
        } else {
            if (start !== null) {
                const end = addDays(start, 5);
                let data = [];
                let currentDate = start;
                currentDate.setHours(0);
                if (checked) {
                    while (currentDate <= end) {
                        let nextDate = addDays(currentDate, 1);
                        nextDate.setHours(0);
                        data.push({ tour: tourId, student: studentId, start: currentDate, end: nextDate });
                        currentDate = nextDate;
                        currentDate.setHours(0);
                    }
                } else {
                    let dates = getDayTimestamps(start);
                    data.push({
                        tour: tourId,
                        student: sundayId,
                        start: dates.current,
                        end: dates.next,
                    });
                    dates = getDayTimestamps(dates.next);
                    data.push({
                        tour: tourId,
                        student: mondayId,
                        start: dates.current,
                        end: dates.next,
                    });
                    dates = getDayTimestamps(dates.next);
                    data.push({
                        tour: tourId,
                        student: tuesdayId,
                        start: dates.current,
                        end: dates.next,
                    });
                    dates = getDayTimestamps(dates.next);
                    data.push({
                        tour: tourId,
                        student: wednesdayId,
                        start: dates.current,
                        end: dates.next,
                    });
                    dates = getDayTimestamps(dates.next);
                    data.push({
                        tour: tourId,
                        student: thursdayId,
                        start: dates.current,
                        end: dates.next,
                    });
                    dates = getDayTimestamps(dates.next);
                    data.push({
                        tour: tourId,
                        student: fridayId,
                        start: dates.current,
                        end: dates.next,
                    });
                }
                handleEventSave(data);
            } else {
                setErrorMessages([...errorMessages, "Start datum mag niet leeg zijn."]);
            }
        }
    };

    const handleEventSave = (data: { tour: number; student: number; start: Date; end: Date }[]) => {
        const post_data: StudentOnTourPost[] = data.map(
            (event: { tour: number; student: number; start: Date; end: Date }) => {
                return { tour: event.tour, student: event.student, date: formatDate(event.start) };
            }
        );
        postBulkStudentOnTour(post_data).then(
            (_) => {
                if (start !== null) {
                    const end = addDays(start, 5);
                    resetStates();
                    reload(start, end);
                    onClose();
                }
            },
            (err) => {
                const e = handleError(err);
                setErrorMessages([...errorMessages, ...e]);
            }
        );
    };

    const getDayTimestamps = (date: Date) => {
        let current = date;
        current.setHours(0);
        let next = addDays(current, 1);
        next.setHours(0);
        return { current, next };
    };

    const resetStates = () => {
        setStart(null);
        setSundayId(-1);
        setMondayId(-1);
        setTuesdayId(-1);
        setWednesdayId(-1);
        setThursdayId(-1);
        setFridayId(-1);
        setStudentId(-1);
        setTourId(null);
        setChecked(true);
        setErrorMessages([]);
    };

    const handleStartDateChange = (e: { target: { value: string | number | Date } }) => {
        setStart(new Date(e.target.value));
    };

    const handleCheckChange = () => {
        setSundayId(studentId);
        setMondayId(studentId);
        setTuesdayId(studentId);
        setWednesdayId(studentId);
        setThursdayId(studentId);
        setFridayId(studentId);
        setChecked(!checked);
    };

    return (
        <Modal
            show={isOpen}
            onHide={() => {
                resetStates();
                onClose();
            }}
        >
            <Modal.Header closeButton>
                <Modal.Title>Voeg ronde toe</Modal.Title>
            </Modal.Header>
            <ErrorMessageAlert errorMessages={errorMessages} setErrorMessages={setErrorMessages} />
            <Modal.Body>
                <form>
                    <div className="form-group">
                        <TourAutocomplete initialId={tourId} setObjectId={setTourId} required={false} />
                    </div>
                    {checked && (
                        <div className="form-group">
                        <label>Selecteer student</label>
                        <TourUserAutocomplete initialId={studentId} setObjectId={setStudentId} tourId={tourId} />
                    </div>
                    )}
                    <div className="form-row">
                        <div className="col">
                            <label>Start datum:</label>
                            <input
                                type="date"
                                value={start ? formatDate(start) : ""}
                                onChange={handleStartDateChange}
                                className="form-control"
                            />
                        </div>
                        <label>
                            <input type="checkbox" checked={checked} onChange={handleCheckChange} />1 student per week
                        </label>
                        {!checked && (
                            <div>
                                <div>
                                    <label>Zondag</label>
                                    <TourUserAutocomplete
                                        initialId={sundayId}
                                        setObjectId={setSundayId}
                                        tourId={tourId}
                                    />
                                </div>
                                <div>
                                    <label>Maandag</label>
                                    <TourUserAutocomplete
                                        initialId={mondayId}
                                        setObjectId={setMondayId}
                                        tourId={tourId}
                                    />
                                </div>
                                <div>
                                    <label>Dinsdag</label>
                                    <TourUserAutocomplete
                                        initialId={tuesdayId}
                                        setObjectId={setTuesdayId}
                                        tourId={tourId}
                                    />
                                </div>
                                <div>
                                    <label>Woensdag</label>
                                    <TourUserAutocomplete
                                        initialId={wednesdayId}
                                        setObjectId={setWednesdayId}
                                        tourId={tourId}
                                    />
                                </div>
                                <div>
                                    <label>Donderdag</label>
                                    <TourUserAutocomplete
                                        initialId={thursdayId}
                                        setObjectId={setThursdayId}
                                        tourId={tourId}
                                    />
                                </div>
                                <div>
                                    <label>Vrijdag</label>
                                    <TourUserAutocomplete
                                        initialId={fridayId}
                                        setObjectId={setFridayId}
                                        tourId={tourId}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onClose}>
                    Sluit
                </Button>
                <Button variant="primary" onClick={handleSave}>
                    Sla op
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default AddTourModal;