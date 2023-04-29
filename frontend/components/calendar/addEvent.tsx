import React, {useState} from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import {addDays} from "date-fns";
import {User} from "@/lib/user";
import {Tour} from "@/lib/tour";
import StudentAutocomplete from "@/components/autocompleteComponents/studentAutocomplete";
import TourAutocomplete from "@/components/autocompleteComponents/tourAutocomplete";
import {useTranslation} from "react-i18next";

function AddEventModal(data: any) {
    const {allStudents, allTours, isOpen, onClose, onSaveMultiple} = data;
    const [tour, setTour] = useState<Tour | null>(null);
    const [tourId, setTourId] = useState(-1);
    const [student, setStudent] = useState<User | null>(null);
    const [studentId, setStudentId] = useState(-1);
    const [start, setStart] = useState<Date | null>(null);
    const [checked, setChecked] = useState(true);
    const [sunday, setSunday] = useState<User | null>(null);
    const [sundayId, setSundayId] = useState(-1);
    const [monday, setMonday] = useState<User | null>(null);
    const [mondayId, setMondayId] = useState(-1);
    const [tuesday, setTuesday] = useState<User | null>(null);
    const [tuesdayId, setTuesdayId] = useState(-1);
    const [wednesday, setWednesday] = useState<User | null>(null);
    const [wednesdayId, setWednesdayId] = useState(-1);
    const [thursday, setThursday] = useState<User | null>(null);
    const [thursdayId, setThursdayId] = useState(-1);
    const [friday, setFriday] = useState<User | null>(null);
    const [fridayId, setFridayId] = useState(-1);
    const { t } = useTranslation();
    const [errorMessages, setErrorMessages] = useState<string[]>([]);

    const handleSave = () => {
        const currentStudent: User = allStudents.find((student: User) => student.id === studentId);
        const currentTour: Tour = allTours.find((tour: Tour) => tour.id === tourId);
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
                let dates = getDayTimestamps(start)
                data.push({
                    tour: currentTour,
                    student: allStudents.find((student: User) => student.id === sundayId),
                    start: dates.current,
                    end: dates.next
                })
                dates = getDayTimestamps(dates.next)
                data.push({
                    tour: currentTour,
                    student: allStudents.find((student: User) => student.id === mondayId),
                    start: dates.current,
                    end: dates.next
                })
                dates = getDayTimestamps(dates.next)
                data.push({
                    tour: currentTour,
                    student: allStudents.find((student: User) => student.id === tuesdayId),
                    start: dates.current,
                    end: dates.next
                })
                dates = getDayTimestamps(dates.next)
                data.push({
                    tour: currentTour,
                    student: allStudents.find((student: User) => student.id === wednesdayId),
                    start: dates.current,
                    end: dates.next
                })
                dates = getDayTimestamps(dates.next)
                data.push({
                    tour: currentTour,
                    student: allStudents.find((student: User) => student.id === thursdayId),
                    start: dates.current,
                    end: dates.next
                })
                dates = getDayTimestamps(dates.next)
                data.push({
                    tour: currentTour,
                    student: allStudents.find((student: User) => student.id === fridayId),
                    start: dates.current,
                    end: dates.next
                })
            }
            onSaveMultiple(data);
            resetStates();
            onClose();
        } else {
            setErrorMessages(["Start datum mag niet leeg zijn."]);
        }
    };

    const getDayTimestamps = (date: Date) => {
        let current = date;
        current.setHours(0);
        let next = addDays(current, 1);
        next.setHours(0);
        return {current, next}
    }

    const resetStates = () => {
        setTour(null);
        setStudent(null);
        setStart(null);
        setSunday(null);
        setSundayId(-1);
        setMonday(null);
        setMondayId(-1);
        setTuesday(null);
        setTuesdayId(-1);
        setWednesday(null);
        setWednesdayId(-1);
        setThursday(null);
        setThursdayId(-1);
        setFriday(null);
        setFridayId(-1);
        setChecked(true);
    }

    const handleStartDateChange = (e: { target: { value: string | number | Date } }) => {
        setStart(new Date(e.target.value));
    };

    const handleCheckChange = () => {
        setSunday(student);
        setSundayId(studentId);
        setMonday(student);
        setMondayId(studentId);
        setTuesday(student);
        setTuesdayId(studentId);
        setWednesday(student);
        setWednesdayId(studentId);
        setThursday(student);
        setThursdayId(studentId);
        setFriday(student);
        setFridayId(studentId);
        setChecked(!checked);
    };


    return (
        <Modal show={isOpen} onHide={() => {
                onClose();
                setErrorMessages([]);
            }}>
            <Modal.Header closeButton>
                <Modal.Title>Voeg ronde toe</Modal.Title>
            </Modal.Header>
            {errorMessages.length !== 0 && (
                <div className={"visible alert alert-danger alert-dismissible fade show"}>
                    <ul>
                        {errorMessages.map((err, i) => (
                            <li key={i}>{t(err)}</li>
                        ))}
                    </ul>
                    <button type="button" className="btn-close" onClick={() => setErrorMessages([])}></button>
                </div>
            )}
            <Modal.Body>
                <form>
                    <div className="form-group">
                        <TourAutocomplete
                            value={tour}
                            onChange={setTour}
                            setObjectId={setTourId}
                            required={true}
                        />
                    </div>
                    <div className="form-group">
                        <label>Student*</label>
                        <StudentAutocomplete
                            value={student}
                            onChange={setStudent}
                            setObjectId={setStudentId}
                            required={true}
                        />
                    </div>
                    <div className="form-row">
                        <div className="col">
                            <label>Start datum:</label>
                            <input
                                type="date"
                                value={start ? start.toISOString().substring(0, 10) : ""}
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
                                        value={sunday}
                                        onChange={setSunday}
                                        setObjectId={setSundayId}
                                        required={false}
                                    />
                                </div>
                                <div>
                                    <label>Maandag</label>
                                    <StudentAutocomplete
                                        value={monday}
                                        onChange={setMonday}
                                        setObjectId={setMondayId}
                                        required={false}
                                    />
                                </div>
                                <div>
                                    <label>Dinsdag</label>
                                    <StudentAutocomplete
                                        value={tuesday}
                                        onChange={setTuesday}
                                        setObjectId={setTuesdayId}
                                        required={false}
                                    />
                                </div>
                                <div>
                                    <label>Woensdag</label>
                                    <StudentAutocomplete
                                        value={wednesday}
                                        onChange={setWednesday}
                                        setObjectId={setWednesdayId}
                                        required={false}
                                    />
                                </div>
                                <div>
                                    <label>Donderdag</label>
                                    <StudentAutocomplete
                                        value={thursday}
                                        onChange={setThursday}
                                        setObjectId={setThursdayId}
                                        required={false}
                                    />
                                </div>
                                <div>
                                    <label>Vrijdag</label>
                                    <StudentAutocomplete
                                        value={friday}
                                        onChange={setFriday}
                                        setObjectId={setFridayId}
                                        required={false}
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
