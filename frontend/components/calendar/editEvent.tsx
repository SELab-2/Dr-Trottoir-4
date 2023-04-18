import {ChangeEvent, useState} from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import {User} from "@/lib/user";
import {Tour} from "@/lib/tour";

function EditEventModal(data: any) {
    const {event, allStudents, allTours, isOpen, onClose, onSave, onDelete} = data
    console.log(event)
    const [tour, setTour] = useState<Tour | null>(event.tour);
    const [week, setWeek] = useState<User[]>(event.students); // Week starts on Sunday (index 0)
    console.log(week)

    const handleSave = () => {
        let data = {tour: tour, students: week}
        onSave(data);
        onClose();
    };

    const handleDelete = () => {
        onDelete({event});
        onClose();
    }

    const handleTourChange = (e: ChangeEvent<HTMLSelectElement>) => {
        const tourID = Number(e.target.value);
        const selectedTour = allTours.find((tour: Tour) => tour.id === tourID);
        setTour(selectedTour);
    }

    const updateWeekdayStudent = (e: ChangeEvent<HTMLSelectElement>, index: number) => {
        const studentID = Number(e.target.value);
        const updatedWeek = [...week];
        updatedWeek[index] = allStudents.find((student: User) => student.id === studentID);
        setWeek(updatedWeek);
    }


    return (
        <Modal show={isOpen} onHide={onClose}>
            <Modal.Header closeButton>
                <Modal.Title>Bewerk Ronde</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <form>
                    <div className="form-group">
                        <label>Ronde</label>
                        <select className="form-control" value={tour?.id} onChange={handleTourChange}>
                            <option value="">-- Selecteer Ronde --</option>
                            {allTours.map((tour: Tour) => (
                                <option key={tour.id} value={tour.id}>{tour.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Studenten</label>
                        <div>
                            <div>
                                <label>Zondag:</label>
                                <select className="form-control" value={week[0].id}
                                        onChange={e => updateWeekdayStudent(e, 0)}>
                                    <option value="">-- Selecteer student(e) --</option>
                                    {allStudents.map((student: User) => (
                                        <option key={student.id}
                                                value={student.id}>{student.first_name} {student.last_name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label>Maandag:</label>
                                <select className="form-control" value={week[1].id}
                                        onChange={e => updateWeekdayStudent(e, 1)}>
                                    <option value="">-- Selecteer student(e) --</option>
                                    {allStudents.map((student: User) => (
                                        <option key={student.id}
                                                value={student.id}>{student.first_name} {student.last_name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label>Dinsdag:</label>
                                <select className="form-control" value={week[2].id}
                                        onChange={e => updateWeekdayStudent(e, 2)}>
                                    <option value="">-- Selecteer student(e) --</option>
                                    {allStudents.map((student: User) => (
                                        <option key={student.id}
                                                value={student.id}>{student.first_name} {student.last_name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label>Woensdag:</label>
                                <select className="form-control" value={week[3].id}
                                        onChange={e => updateWeekdayStudent(e, 3)}>
                                    <option value="">-- Selecteer student(e) --</option>
                                    {allStudents.map((student: User) => (
                                        <option key={student.id}
                                                value={student.id}>{student.first_name} {student.last_name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label>Donderdag:</label>
                                <select className="form-control" value={week[4].id}
                                        onChange={e => updateWeekdayStudent(e, 4)}>
                                    <option value="">-- Selecteer student(e) --</option>
                                    {allStudents.map((student: User) => (
                                        <option key={student.id}
                                                value={student.id}>{student.first_name} {student.last_name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label>Vrijdag:</label>
                                <select className="form-control" value={week[5].id}
                                        onChange={e => updateWeekdayStudent(e, 5)}>
                                    <option value="">-- Selecteer student(e) --</option>
                                    {allStudents.map((student: User) => (
                                        <option key={student.id}
                                                value={student.id}>{student.first_name} {student.last_name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="danger" onClick={handleDelete}>
                    Delete
                </Button>
                <Button variant="primary" onClick={handleSave}>
                    Sla op
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default EditEventModal;
