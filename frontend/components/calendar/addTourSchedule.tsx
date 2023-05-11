import React, { useState } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { addDays, startOfWeek } from "date-fns";
import TourAutocomplete from "@/components/autocompleteComponents/tourAutocomplete";
import { formatDate } from "@/lib/date";
import ErrorMessageAlert from "@/components/errorMessageAlert";
import { postBulkStudentOnTour, StudentOnTourPost } from "@/lib/student-on-tour";
import { handleError } from "@/lib/error";
import TourUserAutocomplete from "@/components/autocompleteComponents/tourUsersAutocomplete";

function AddTourScheduleModal({
    isOpen,
    onClose,
    onPost,
    range,
}: {
    isOpen: boolean;
    onClose: () => void;
    onPost: () => void;
    range: { start: Date; end: Date };
}) {
    const [tourId, setTourId] = useState<number | null>(null);
    const [studentId, setStudentId] = useState<number | null>(null);
    const [start, setStart] = useState<Date | null>(null);
    const [checked, setChecked] = useState(true);
    const [sundayId, setSundayId] = useState<number | null>(null);
    const [mondayId, setMondayId] = useState<number | null>(null);
    const [tuesdayId, setTuesdayId] = useState<number | null>(null);
    const [wednesdayId, setWednesdayId] = useState<number | null>(null);
    const [thursdayId, setThursdayId] = useState<number | null>(null);
    const [fridayId, setFridayId] = useState<number | null>(null);
    const [errorMessages, setErrorMessages] = useState<string[]>([]);

    function handleSave() {
        if (tourId === null || studentId === null) {
            setErrorMessages(["Ronde of student is leeg."]);
        } else {
            if (start && studentId) {
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
                } else if (sundayId && mondayId && tuesdayId && wednesdayId && thursdayId && fridayId) {
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
                setErrorMessages(["Start datum mag niet leeg zijn."]);
            }
        }
    }

    function handleEventSave(data: { tour: number; student: number; start: Date; end: Date }[]) {
        const post_data: StudentOnTourPost[] = data.map(
            (event: { tour: number; student: number; start: Date; end: Date }) => {
                return { tour: event.tour, student: event.student, date: formatDate(event.start) };
            }
        );
        postBulkStudentOnTour(post_data).then(
            (_) => {
                onPost();
                onClose();
            },
            (err) => setErrorMessages(handleError(err))
        );
    }

    const getDayTimestamps = (date: Date) => {
        let current = date;
        current.setHours(0);
        let next = addDays(current, 1);
        next.setHours(0);
        return { current, next };
    };

    const resetStates = () => {
        setStart(null);
        setSundayId(null);
        setMondayId(null);
        setTuesdayId(null);
        setWednesdayId(null);
        setThursdayId(null);
        setFridayId(null);
        setStudentId(null);
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

    function onShow() {
        setStart(startOfWeek(range.start));
    }

    return (
        <Modal
            show={isOpen}
            onHide={() => {
                resetStates();
                onClose();
            }}
            onShow={onShow}
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

export default AddTourScheduleModal;
