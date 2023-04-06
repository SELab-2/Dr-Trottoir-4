import {ChangeEvent, useState} from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import {addDays, startOfMonth, startOfWeek} from 'date-fns';

function AddEventModal(data: any) {
    const {isOpen, onClose, onSave, onSaveMultiple} = data
    const [title, setTitle] = useState("");
    const [student, setStudent] = useState("");
    const [start, setStart] = useState(new Date(addDays(startOfWeek(startOfMonth(new Date()), {weekStartsOn: 0}), 8).toLocaleString('en', {timeZone: 'America/New_York'})));
    const [start_time, setStarttime] = useState("17:00");
    const [end_time, setEndtime] = useState("20:00");
    const [checked, setChecked] = useState(true);
    const [week, setWeek] = useState(Array(7).fill("")); // Week starts on Sunday (index 0)

    function splitOnValueChange(arr: string[]): string[][] {
        return arr.reduce((result: string[][], currentValue: string, index: number, array: string[]) => {
            if (index === 0 || currentValue !== array[index - 1]) {
                result.push([currentValue]); // start a new group
            } else {
                result[result.length - 1].push(currentValue); // add to the current group
            }
            return result;
        }, []);
    }


    const handleSave = () => {
        if (checked) {
            start.setHours(0);
            const end = addDays(start, 6);
            onSave({title, student, start, end, start_time, end_time});
            onClose();
        } else {
            week.pop();
            let data: { student: string, start: Date, end: Date }[] = [];
            let new_start = start;
            new_start.setHours(0);
            const split = splitOnValueChange(week);
            for (let s in split) {
                let new_end = addDays(new_start, split[s].length);
                new_end.setHours(0);
                data[s] = {student: split[s][0], start: new_start, end: new_end};
                new_start = new_end;
            }
            onSaveMultiple({
                title: title,
                data: data,
                start_time: start_time,
                end_time: end_time,
            })
            onClose();
        }
    }


    const handleStartDateChange = (e: { target: { value: string | number | Date; }; }) => {
        setStart(new Date(e.target.value));
    };

    const handleCheckChange = () => {
        setWeek(Array(7).fill(student))
        setChecked(!checked);
    }

    const updateWeekdayStudent = (e: ChangeEvent<HTMLInputElement>, index: number) => {
        const updatedWeek = [...week];
        updatedWeek[index] = e.target.value;
        setWeek(updatedWeek);
    }


    return (
        <Modal show={isOpen} onHide={onClose}>
            <Modal.Header closeButton>
                <Modal.Title>Voeg ronde toe</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <form>
                    <div className="form-group">
                        <label>Ronde</label>
                        <input
                            type="text"
                            className="form-control"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label>Student</label>
                        <input
                            type="text"
                            className="form-control"
                            value={student}
                            onChange={(e) => setStudent(e.target.value)}
                        />
                    </div>
                    <div className="form-row">
                        <div className="col">
                            <label htmlFor="start-time">Start datum:</label>
                            <input type="date" value={start.toISOString().substring(0, 10)}
                                   onChange={handleStartDateChange} className="form-control"/>
                        </div>
                        <label>
                            <input type="checkbox" checked={checked} onChange={handleCheckChange}/>
                            1 student per week
                        </label>
                        {!checked && (
                            <div>
                                <div>
                                    <label>Zondag:</label>
                                    <input type="text" className="form-control" value={week[0]}
                                           onChange={e => updateWeekdayStudent(e, 0)}/>
                                </div>
                                <div>
                                    <label>Maandag:</label>
                                    <input type="text" className="form-control" value={week[1]}
                                           onChange={e => updateWeekdayStudent(e, 1)}/>
                                </div>
                                <div>
                                    <label>Dinsdag:</label>
                                    <input type="text" className="form-control" value={week[2]}
                                           onChange={e => updateWeekdayStudent(e, 2)}/>
                                </div>
                                <div>
                                    <label>Woensdag:</label>
                                    <input type="text" className="form-control" value={week[3]}
                                           onChange={e => updateWeekdayStudent(e, 3)}/>
                                </div>
                                <div>
                                    <label>Donderdag:</label>
                                    <input type="text" className="form-control" value={week[4]}
                                           onChange={e => updateWeekdayStudent(e, 4)}/>
                                </div>
                                <div>
                                    <label>Vrijdag:</label>
                                    <input type="text" className="form-control" value={week[5]}
                                           onChange={e => updateWeekdayStudent(e, 5)}/>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="form-row">
                        <div className="col">
                            <label>Start uur:</label>
                            <input type="time" className="form-control" value={start_time}
                                   onChange={(event) => setStarttime(event.target.value)}/>
                        </div>
                        <div className="col">
                            <label>Eind uur:</label>
                            <input type="time" className="form-control" value={end_time}
                                   onChange={(event) => setEndtime(event.target.value)}/>
                        </div>
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
