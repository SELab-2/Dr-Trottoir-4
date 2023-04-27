import { ChangeEvent, useState } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { addDays, startOfMonth, startOfWeek } from "date-fns";
import { User } from "@/lib/user";
import { Tour } from "@/lib/tour";

function AddEventModal(data: any) {
    const { allStudents, allTours, isOpen, onClose, onSave, onSaveMultiple } = data;
    const [tour, setTour] = useState<Tour | null>(null);
    const [student, setStudent] = useState<User | null>(null);
    const [start, setStart] = useState(
        new Date(
            startOfWeek(new Date(), { weekStartsOn: 1 }).toLocaleString("en", {
                timeZone: "America/New_York",
            })
        )
    );
    const [checked, setChecked] = useState(true);
    const [week, setWeek] = useState<User[]>(Array(6).fill(null)); // Week starts on Sunday (index 0)

    const handleSave = () => {
        const end = addDays(start, 5);
        let data = [];
        let currentDate = new Date(start);
        currentDate.setHours(0);
        if (checked) {
            while (currentDate <= end) {
                let nextDate = addDays(currentDate, 1);
                nextDate.setHours(2);
                data.push({ tour: tour, student: student, start: currentDate, end: nextDate });
                currentDate = nextDate;
                currentDate.setHours(0);
            }
        } else {
            while (currentDate <= end) {
                let s = week.pop();
                let nextDate = addDays(currentDate, 1);
                nextDate.setHours(2);
                data.push({ tour: tour, student: s, start: currentDate, end: nextDate });
                currentDate = nextDate;
                currentDate.setHours(0);
            }
        }
        onSaveMultiple(data);
        setTour(null);
        setStudent(null);
        setStart(
            new Date(
                addDays(startOfWeek(startOfMonth(new Date()), { weekStartsOn: 0 }), 8).toLocaleString("en", {
                    timeZone: "America/New_York",
                })
            )
        );
        setWeek(Array(6).fill(null));
        setChecked(true);
        onClose();
    };

    const handleStartDateChange = (e: { target: { value: string | number | Date } }) => {
        setStart(new Date(e.target.value));
    };

    const handleCheckChange = () => {
        setWeek(Array(6).fill(student));
        setChecked(!checked);
    };

    const handleStudentChange = (e: ChangeEvent<HTMLSelectElement>) => {
        const studentID = Number(e.target.value);
        const selectedStudent = allStudents.find((student: User) => student.id === studentID);
        setStudent(selectedStudent);
    };

    const handleTourChange = (e: ChangeEvent<HTMLSelectElement>) => {
        const tourID = Number(e.target.value);
        const selectedTour = allTours.find((tour: Tour) => tour.id === tourID);
        setTour(selectedTour);
    };

    const updateWeekdayStudent = (e: ChangeEvent<HTMLSelectElement>, index: number) => {
        const studentID = Number(e.target.value);
        const updatedWeek = [...week];
        updatedWeek[index] = allStudents.find((student: User) => student.id === studentID);
        setWeek(updatedWeek);
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
                        <select className="form-control" value={tour?.id} onChange={handleTourChange}>
                            <option value="">-- Selecteer Ronde --</option>
                            {allTours.map((tour: Tour) => (
                                <option key={tour.id} value={tour.id}>
                                    {tour.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Student</label>
                        <select className="form-control" value={student?.id} onChange={handleStudentChange}>
                            <option value="">-- Selecteer student(e) --</option>
                            {allStudents.map((student: User) => (
                                <option key={student.id} value={student.id}>
                                    {student.first_name} {student.last_name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="form-row">
                        <div className="col">
                            <label htmlFor="start-time">Start datum:</label>
                            <input
                                type="date"
                                value={start.toISOString().substring(0, 10)}
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
                                    <label>Zondag:</label>
                                    <select
                                        className="form-control"
                                        value={week[0]?.id || ""}
                                        onChange={(e) => updateWeekdayStudent(e, 0)}
                                    >
                                        <option value="">-- Selecteer student(e) --</option>
                                        {allStudents.map((student: User) => (
                                            <option key={student.id} value={student.id}>
                                                {student.first_name} {student.last_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label>Maandag:</label>
                                    <select
                                        className="form-control"
                                        value={week[1]?.id || ""}
                                        onChange={(e) => updateWeekdayStudent(e, 1)}
                                    >
                                        <option value="">-- Selecteer student(e) --</option>
                                        {allStudents.map((student: User) => (
                                            <option key={student.id} value={student.id}>
                                                {student.first_name} {student.last_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label>Dinsdag:</label>
                                    <select
                                        className="form-control"
                                        value={week[2]?.id || ""}
                                        onChange={(e) => updateWeekdayStudent(e, 2)}
                                    >
                                        <option value="">-- Selecteer student(e) --</option>
                                        {allStudents.map((student: User) => (
                                            <option key={student.id} value={student.id}>
                                                {student.first_name} {student.last_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label>Woensdag:</label>
                                    <select
                                        className="form-control"
                                        value={week[3]?.id || ""}
                                        onChange={(e) => updateWeekdayStudent(e, 3)}
                                    >
                                        <option value="">-- Selecteer student(e) --</option>
                                        {allStudents.map((student: User) => (
                                            <option key={student.id} value={student.id}>
                                                {student.first_name} {student.last_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label>Donderdag:</label>
                                    <select
                                        className="form-control"
                                        value={week[4]?.id || ""}
                                        onChange={(e) => updateWeekdayStudent(e, 4)}
                                    >
                                        <option value="">-- Selecteer student(e) --</option>
                                        {allStudents.map((student: User) => (
                                            <option key={student.id} value={student.id}>
                                                {student.first_name} {student.last_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label>Vrijdag:</label>
                                    <select
                                        className="form-control"
                                        value={week[5]?.id || ""}
                                        onChange={(e) => updateWeekdayStudent(e, 5)}
                                    >
                                        <option value="">-- Selecteer student(e) --</option>
                                        {allStudents.map((student: User) => (
                                            <option key={student.id} value={student.id}>
                                                {student.first_name} {student.last_name}
                                            </option>
                                        ))}
                                    </select>
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
