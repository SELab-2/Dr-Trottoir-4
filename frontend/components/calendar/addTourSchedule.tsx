import React, { useState } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { addDays, eachDayOfInterval, endOfWeek } from "date-fns";
import TourAutocomplete from "@/components/autocompleteComponents/tourAutocomplete";
import { formatDate } from "@/lib/date";
import ErrorMessageAlert from "@/components/errorMessageAlert";
import { postBulkStudentOnTour, StudentOnTourPost } from "@/lib/student-on-tour";
import { handleError } from "@/lib/error";
import TourUserAutocomplete from "@/components/autocompleteComponents/tourUserAutocomplete";
import { Form } from "react-bootstrap";
import LocaleDateRangePicker from "@/components/datepicker/DateRangePicker";

function AddTourScheduleModal({
    isOpen,
    onClose,
    onPost,
}: {
    isOpen: boolean;
    onClose: () => void;
    onPost: () => void;
}) {
    const [tourId, setTourId] = useState<number | null>(null);
    const [studentId, setStudentId] = useState<number | null>(null);
    const [errorMessages, setErrorMessages] = useState<string[]>([]);
    const [startDate, setStartDate] = useState<Date | null>(
        new Date().getDay() === 6 ? addDays(new Date(), 1) : new Date()
    );
    const [endDate, setEndDate] = useState<Date | null>(endOfWeek(new Date(), { weekStartsOn: 6 })); // Sets to friday of this week

    function handleSave() {
        if (!tourId) {
            setErrorMessages(["Selecteer een ronde"]);
            return;
        }
        if (!studentId) {
            setErrorMessages(["U heeft geen student geselecteerd."]);
            return;
        }
        if (!startDate || !endDate) {
            setErrorMessages(["U heeft geen periode geselecteerd"]);
            return;
        }
        const data: { tour: number; student: number; date: Date }[] = eachDayOfInterval({
            start: startDate,
            end: endDate,
        }).map((d) => {
            return {
                tour: tourId,
                student: studentId,
                date: d,
            };
        });
        handleEventSave(data);
    }

    function handleEventSave(data: { tour: number; student: number; date: Date }[]) {
        const post_data: StudentOnTourPost[] = data.map((planned) => {
            return { tour: planned.tour, student: planned.student, date: formatDate(planned.date) };
        });
        postBulkStudentOnTour(post_data).then(
            (_) => {
                onPost();
                onClose();
            },
            (err) => setErrorMessages(handleError(err))
        );
    }

    const resetStates = () => {
        setStudentId(null);
        setTourId(null);
        setErrorMessages([]);
    };

    function onShow() {
        setStartDate(new Date().getDay() === 6 ? addDays(new Date(), 1) : new Date());
        setEndDate(endOfWeek(new Date(), { weekStartsOn: 6 }));
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
                <Form>
                    <Form.Group>
                        <Form.Label>Selecteer een ronde:</Form.Label>
                        <TourAutocomplete initialId={tourId} setObjectId={setTourId} matchId={studentId} />
                    </Form.Group>

                    <Form.Group>
                        <Form.Label>Selecteer een student:</Form.Label>
                        <TourUserAutocomplete initialId={studentId} setObjectId={setStudentId} matchId={tourId} />
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>Selecteer een periode:</Form.Label>
                        <LocaleDateRangePicker
                            endDate={endDate}
                            setEndDate={setEndDate}
                            startDate={startDate}
                            setStartDate={setStartDate}
                        />
                    </Form.Group>
                </Form>
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
