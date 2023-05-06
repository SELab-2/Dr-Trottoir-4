import React, {useState} from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import {addDays} from "date-fns";
import {User} from "@/lib/user";
import {Tour} from "@/lib/tour";
import StudentAutocomplete from "@/components/autocompleteComponents/studentAutocomplete";
import TourAutocomplete from "@/components/autocompleteComponents/tourAutocomplete";
import {useTranslation} from "react-i18next";
import {formatDate} from "@/lib/date";
import ErrorMessageAlert from "@/components/errorMessageAlert";
import {postBulkStudentOnTour, StudentOnTourPost} from "@/lib/student-on-tour";
import {handleError} from "@/lib/error";

function AddEventModal(data: any) {
    const {allStudents, allTours, isOpen, onClose, reload} = data;
    const [tourId, setTourId] = useState(-1);
    const [studentId, setStudentId] = useState(-1);
    const [start, setStart] = useState<Date | null>(null);
    const [checked, setChecked] = useState(true);
    const [sundayId, setSundayId] = useState(-1);
    const [mondayId, setMondayId] = useState(-1);
    const [tuesdayId, setTuesdayId] = useState(-1);
    const [wednesdayId, setWednesdayId] = useState(-1);
    const [thursdayId, setThursdayId] = useState(-1);
    const [fridayId, setFridayId] = useState(-1);
    const {t} = useTranslation();
    const [errorMessages, setErrorMessages] = useState<string[]>([]);

    const handleSave = () => {
        const currentStudent: User = allStudents.find((student: User) => student.id === studentId);
        const currentTour: Tour = allTours.find((tour: Tour) => tour.id === tourId);
        if (tourId === -1 || studentId === -1) {
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
                        data.push({tour: currentTour, student: currentStudent, start: currentDate, end: nextDate});
                        currentDate = nextDate;
                        currentDate.setHours(0);
                    }
                } else {
                    let dates = getDayTimestamps(start);
                    data.push({
                        tour: currentTour,
                        student: allStudents.find((student: User) => student.id === sundayId),
                        start: dates.current,
                        end: dates.next,
                    });
                    dates = getDayTimestamps(dates.next);
                    data.push({
                        tour: currentTour,
                        student: allStudents.find((student: User) => student.id === mondayId),
                        start: dates.current,
                        end: dates.next,
                    });
                    dates = getDayTimestamps(dates.next);
                    data.push({
                        tour: currentTour,
                        student: allStudents.find((student: User) => student.id === tuesdayId),
                        start: dates.current,
                        end: dates.next,
                    });
                    dates = getDayTimestamps(dates.next);
                    data.push({
                        tour: currentTour,
                        student: allStudents.find((student: User) => student.id === wednesdayId),
                        start: dates.current,
                        end: dates.next,
                    });
                    dates = getDayTimestamps(dates.next);
                    data.push({
                        tour: currentTour,
                        student: allStudents.find((student: User) => student.id === thursdayId),
                        start: dates.current,
                        end: dates.next,
                    });
                    dates = getDayTimestamps(dates.next);
                    data.push({
                        tour: currentTour,
                        student: allStudents.find((student: User) => student.id === fridayId),
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

    const handleEventSave = (data: { tour: Tour, student: User, start: Date, end: Date }[]) => {
        const post_data: StudentOnTourPost[] = data.map((event: { tour: Tour, student: User, start: Date, end: Date }) => {
            return {tour: event.tour.id, student: event.student.id, date: formatDate(event.start)};
        });
        postBulkStudentOnTour(post_data).then(
            (_) => {
                //onSaveMultiple(data);
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
        )
    };

    const getDayTimestamps = (date: Date) => {
        let current = date;
        current.setHours(0);
        let next = addDays(current, 1);
        next.setHours(0);
        return {current, next};
    };

    const resetStates = () => {
        setStart(null);
        setSundayId(-1);
        setMondayId(-1);
        setTuesdayId(-1);
        setWednesdayId(-1);
        setThursdayId(-1);
        setFridayId(-1);
        setChecked(true);
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
        setErrorMessages([]);
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
            <ErrorMessageAlert errorMessages={errorMessages} setErrorMessages={setErrorMessages}/>
            <Modal.Body>
                <form>
                    <div className="form-group">
                        <TourAutocomplete initialId={tourId} setObjectId={setTourId} required={true}/>
                    </div>
                    <div className="form-group">
                        <label>Student*</label>
                        <StudentAutocomplete initialId={studentId} setObjectId={setStudentId} required={true}/>
                    </div>
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
                            <input type="checkbox" checked={checked} onChange={handleCheckChange}/>1 student per week
                        </label>
                        {!checked && (
                            <div>
                                <div>
                                    <label>Zondag</label>
                                    <StudentAutocomplete
                                        initialId={sundayId}
                                        setObjectId={setSundayId}
                                        required={true}
                                    />
                                </div>
                                <div>
                                    <label>Maandag</label>
                                    <StudentAutocomplete
                                        initialId={mondayId}
                                        setObjectId={setMondayId}
                                        required={true}
                                    />
                                </div>
                                <div>
                                    <label>Dinsdag</label>
                                    <StudentAutocomplete
                                        initialId={tuesdayId}
                                        setObjectId={setTuesdayId}
                                        required={true}
                                    />
                                </div>
                                <div>
                                    <label>Woensdag</label>
                                    <StudentAutocomplete
                                        initialId={wednesdayId}
                                        setObjectId={setWednesdayId}
                                        required={true}
                                    />
                                </div>
                                <div>
                                    <label>Donderdag</label>
                                    <StudentAutocomplete
                                        initialId={thursdayId}
                                        setObjectId={setThursdayId}
                                        required={true}
                                    />
                                </div>
                                <div>
                                    <label>Vrijdag</label>
                                    <StudentAutocomplete
                                        initialId={fridayId}
                                        setObjectId={setFridayId}
                                        required={true}
                                    />
                                </div>
                            </div>
                        )}
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
