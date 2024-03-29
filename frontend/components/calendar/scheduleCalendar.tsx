import React, { useEffect, useRef, useState } from "react";
import { Calendar, dateFnsLocalizer, Event } from "react-big-calendar";
import withDragAndDrop, { EventInteractionArgs } from "react-big-calendar/lib/addons/dragAndDrop";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import nlBE from "date-fns/locale/nl-BE";
import { messages } from "@/locales/localizerCalendar";
import {
    deleteBulkStudentOnTour,
    deleteStudentOnTour,
    duplicateStudentOnTourSchedule,
    getAllStudentOnTourChanges,
    getAllStudentOnTourFromDate,
    patchStudentOnTour,
    postBulkStudentOnTour,
    StudentOnTour,
    StudentOnTourPost,
    StudentOnTourStringDate,
} from "@/lib/student-on-tour";

import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import "react-big-calendar/lib/css/react-big-calendar.css";
import EditScheduleEventModal from "@/components/calendar/editScheduleEvent";
import CustomDisplay from "@/components/calendar/customEvent";
import AddScheduleEventModal from "@/components/calendar/addScheduleEvent";

import { Tour } from "@/lib/tour";
import { User } from "@/lib/user";
import { add, addDays, endOfMonth, endOfWeek, startOfDay, startOfMonth, sub } from "date-fns";
import { formatDate } from "@/lib/date";
import { handleError } from "@/lib/error";
import { colors } from "@/components/calendar/colors";
import styles from "./calendar.module.css";
import { ScheduleEvent, StudentOnTourWebSocketInterface } from "@/types";
import ErrorMessageAlert from "@/components/errorMessageAlert";
import SuccessMessageAlert from "@/components/successMessageAlert";
import AddTourScheduleModal from "@/components/calendar/addTourSchedule";
import { Col, Row } from "react-bootstrap";
import DuplicateScheduleModal from "@/components/calendar/duplicateScheduleModal";

function ScheduleCalendar({ tourUsers, tours }: { tourUsers: User[]; tours: Tour[] }) {
    const [popupIsOpenEdit, setPopupIsOpenEdit] = useState(false);
    const [popupIsOpenAdd, setPopupIsOpenAdd] = useState(false);
    const [popupIsOpenAddTour, setPopupIsOpenAddTour] = useState(false);
    const [popupIsOpenCopy, setPopupIsOpenCopy] = useState(false);
    const [errorMessages, setErrorMessages] = useState<string[]>([]);
    const [successMessages, setSuccessMessages] = useState<string[]>([]);
    const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | null>(null);
    const [tourColors, setTourColors] = useState<{ [key: number]: string }>({});
    const [events, setEvents] = useState<ScheduleEvent[]>([]);
    const [range, setRange] = useState({
        start: sub(startOfMonth(new Date()), { days: 7 }),
        end: add(endOfMonth(new Date()), { days: 7 }),
    });
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    const eventsRef = useRef(events);
    const rangeRef = useRef(range);

    useEffect(() => {
        if (tourUsers.length > 0 && tours.length > 0) {
            assignColors(tours);
            getFromRange(range);
            let ws = setUpWebsocket();
            return () => {
                ws.close();
            };
        }
    }, [tourUsers, tours]);

    useEffect(() => {
        // Update the reference when events changes
        eventsRef.current = events;
    }, [events]);

    useEffect(() => {
        rangeRef.current = range;
    }, [range]);

    function setUpWebsocket() {
        const ws = getAllStudentOnTourChanges();
        ws.addEventListener("message", (event) => {
            const data: StudentOnTourWebSocketInterface = JSON.parse(event.data);
            const sots: StudentOnTourStringDate = data.student_on_tour;
            if (rangeRef.current.start <= new Date(sots.date) && new Date(sots.date) <= rangeRef.current.end) {
                if (data.type === "deleted") {
                    // DELETE
                    setEvents((currentEvents) => {
                        return currentEvents
                            .filter((currentEvent) => {
                                return currentEvent.id !== sots.id;
                            })
                            .sort(compareScheduleEvents);
                    });
                } else {
                    const obj: ScheduleEvent | undefined = eventsRef.current.find((e) => e.id === Number(sots.id));
                    if (obj) {
                        // PATCH
                        onEventEdit(Number(obj.id), Number(sots.tour), Number(sots.student), new Date(sots.date));
                    } else {
                        // POST
                        addSingleEvent({
                            tour: Number(sots.tour),
                            id: Number(sots.id),
                            student: Number(sots.student),
                            date: new Date(sots.date),
                            completed_tour: sots.completed_tour,
                            started_tour: sots.started_tour,
                            current_building_index: sots.current_building_index,
                            max_building_index: sots.max_building_index,
                        });
                    }
                }
            }
        });
        return ws;
    }

    function getFromRange(range: Date[] | { start: Date; end: Date }) {
        let startDate: Date = Array.isArray(range) ? range[0] : range.start;
        let endDate: Date | null = Array.isArray(range) ? range[range.length - 1] : range.end;
        setRange({ start: startDate, end: endDate });
        onEventsLoad({ start_date: startDate, end_date: endDate });
    }

    function postEvents(start: Date, end: Date, data: StudentOnTourPost[]) {
        postBulkStudentOnTour(data).then(
            (_) => getFromRange({ start: range.start, end: range.end }),
            (err) => setErrorMessages(handleError(err))
        );
    }

    function onEventsLoad({ start_date, end_date }: { start_date: Date; end_date: Date }) {
        getAllStudentOnTourFromDate({ startDate: new Date(start_date), endDate: new Date(end_date) }).then(
            (res) => {
                const list: StudentOnTour[] = res.data;
                setEvents(
                    list
                        .filter((s) => {
                            return (
                                tourUsers.find((u: User) => u.id === s.student) &&
                                tours.find((t: Tour) => t.id === s.tour)
                            );
                        })
                        .map((sot) => {
                            const startDate = new Date(sot.date);
                            startDate.setHours(0);
                            const endDate = addDays(new Date(sot.date), 1);
                            endDate.setHours(0);
                            const student: User = tourUsers.find((u: User) => u.id === sot.student)!;
                            const tour: Tour = tours.find((t: Tour) => t.id === sot.tour)!;
                            return {
                                id: sot.id,
                                tour: tour,
                                student: student,
                                start: startDate,
                                end: endDate,
                            };
                        })
                        .sort(compareScheduleEvents)
                );
            },
            (err) => setErrorMessages(handleError(err))
        );
    }

    function onEventSelection(e: ScheduleEvent) {
        setSelectedEvent(e);
        setPopupIsOpenEdit(true);
    }

    function onEventEdit(id: number, tour: number, student: number, date: Date) {
        let end = addDays(date, 1);
        date.setHours(0);
        end.setHours(0);
        const currentTour: Tour | undefined = tours.find((t: Tour) => t.id === tour);
        const currentStudent: User | undefined = tourUsers.find((s: User) => s.id === student);
        if (currentTour && currentStudent) {
            setEvents((currentEvents) => {
                return currentEvents
                    .map((currentEvent) => {
                        if (currentEvent.id === id) {
                            return {
                                ...currentEvent,
                                tour: currentTour,
                                student: currentStudent,
                                start: date,
                                end: end,
                            };
                        }
                        return currentEvent;
                    })
                    .sort(compareScheduleEvents);
            });
        }
    }

    function onEventResize(args: EventInteractionArgs<object>): void {
        const { event, start, end } = args;
        let resizedEvents: StudentOnTourPost[] = [];
        let currentDate = new Date(start);
        currentDate.setHours(0);
        while (currentDate < end) {
            let nextDate = addDays(currentDate, 1);
            nextDate.setHours(2);
            const scheduleEvent: ScheduleEvent = event as ScheduleEvent;
            if (formatDate(currentDate) !== formatDate(scheduleEvent.start)) {
                resizedEvents.push({
                    tour: scheduleEvent.tour.id,
                    student: scheduleEvent.student.id,
                    date: formatDate(currentDate),
                });
            }
            currentDate = nextDate;
            currentDate.setHours(0);
        }
        postEvents(range.start, range.end, resizedEvents);
    }

    function onEventDragAndDrop(args: EventInteractionArgs<object>): void {
        const { event, start } = args;
        const scheduleEvent: ScheduleEvent = event as ScheduleEvent;
        if (scheduleEvent.start >= startOfDay(new Date())) {
            patchStudentOnTour(
                scheduleEvent.id,
                scheduleEvent.tour.id,
                scheduleEvent.student.id,
                formatDate(new Date(start))
            ).then(
                (res) => {
                    onEventEdit(
                        scheduleEvent.id,
                        scheduleEvent.tour.id,
                        scheduleEvent.student.id,
                        new Date(res.data.date)
                    );
                },
                (err) => setErrorMessages(handleError(err))
            );
        }
    }

    function addSingleEvent(sot: StudentOnTour) {
        setEvents((prevState) => {
            const tour: Tour | undefined = tours.find((t: Tour) => sot.tour === t.id);
            const student: User | undefined = tourUsers.find((s: User) => sot.student === s.id);
            const alreadyExists = prevState.some((s) => sot.id === s.id);
            if (!tour || !student || alreadyExists) {
                return [...prevState];
            }
            const startDate = new Date(sot.date);
            startDate.setHours(0);
            const endDate = addDays(startDate, 1);
            endDate.setHours(0);
            return [
                ...prevState,
                {
                    id: sot.id,
                    tour: tour,
                    student: student,
                    start: startDate,
                    end: endDate,
                },
            ].sort(compareScheduleEvents);
        });
    }

    function compareScheduleEvents(a: ScheduleEvent, b: ScheduleEvent) {
        if (a.start < b.start) {
            return -1;
        } else if (a.start > b.start) {
            return 1;
        } else {
            if (a.tour.name < b.tour.name) {
                return -1;
            } else if (a.tour.name > b.tour.name) {
                return 1;
            } else {
                return 0;
            }
        }
    }

    function onEventDelete(event: ScheduleEvent) {
        deleteStudentOnTour(event.id).then(
            (_) => {
                setEvents((currentEvents) => {
                    return currentEvents
                        .filter((currentEvent) => {
                            return currentEvent !== event;
                        })
                        .sort(compareScheduleEvents);
                });
            },
            (err) => setErrorMessages(handleError(err))
        );
    }

    function onEventsDelete(event: ScheduleEvent) {
        const removedTours: ScheduleEvent[] = events.filter((e) => {
            return (
                e.tour.id == event.tour.id && e.start >= startOfWeek(event.start) && e.start <= endOfWeek(event.start)
            );
        });
        deleteBulkStudentOnTour(
            removedTours.map((event: ScheduleEvent) => {
                return event.id;
            })
        ).then(
            (_) => {
                const updatedEvents: ScheduleEvent[] = events.filter((e) => !removedTours.includes(e));
                setEvents(updatedEvents);
            },
            (err) => setErrorMessages(handleError(err))
        );
    }

    function assignColors(tours: Tour[]) {
        const col: { [key: number]: string } = {};
        tours.forEach((t: Tour, index: number) => {
            const cIndex = index % colors.length;
            col[t.id] = colors[cIndex];
        });
        setTourColors(col);
    }

    return (
        <>
            <div>
                <Row>
                    <Col md={6} style={{ display: "flex", alignItems: "center" }}>
                        <div className="padding" style={{ display: "flex", alignItems: "center" }}>
                            <button
                                className="button"
                                style={{ marginRight: "10px" }}
                                onClick={() => {
                                    setPopupIsOpenAddTour(true);
                                }}
                            >
                                Plan ronde voor hele week
                            </button>
                            <button
                                className="button"
                                style={{ marginRight: "10px" }}
                                onClick={() => {
                                    setPopupIsOpenCopy(true);
                                }}
                            >
                                Kopieer planning
                            </button>
                        </div>
                    </Col>
                    <Col md={6}>
                        <SuccessMessageAlert
                            successmessages={successMessages}
                            setSuccessMessages={setSuccessMessages}
                        />
                        <ErrorMessageAlert errorMessages={errorMessages} setErrorMessages={setErrorMessages} />
                    </Col>
                </Row>
            </div>
            <DnDCalendar
                messages={messages}
                culture={"nl-BE"}
                defaultDate={new Date()}
                defaultView="month"
                views={["month", "week"]}
                events={events}
                components={{
                    // @ts-ignore
                    event: CustomDisplay,
                }}
                eventPropGetter={(event: any) => {
                    const backgroundColor = tourColors[event.tour.id];
                    return { style: { backgroundColor, color: "white" } };
                }}
                localizer={localizer}
                drilldownView="week"
                selectable
                onSelectEvent={(e: Event) => {
                    const scheduleEvent: ScheduleEvent = e as ScheduleEvent;
                    onEventSelection(scheduleEvent);
                }}
                onSelectSlot={(info) => {
                    if (info.start >= startOfDay(new Date())) {
                        setSelectedDate(info.start);
                        setPopupIsOpenAdd(true);
                    }
                }}
                step={60}
                timeslots={1}
                style={{ height: "100vh" }}
                onEventDrop={onEventDragAndDrop}
                onEventResize={onEventResize}
                onRangeChange={getFromRange}
                resizable
            />
            {selectedEvent && (
                <EditScheduleEventModal
                    event={selectedEvent}
                    isOpen={popupIsOpenEdit}
                    onClose={() => {
                        setSelectedEvent(null);
                        setPopupIsOpenEdit(false);
                    }}
                    onDelete={onEventDelete}
                    onDeleteTour={onEventsDelete}
                    onEdit={onEventEdit}
                />
            )}
            <AddTourScheduleModal
                isOpen={popupIsOpenAddTour}
                onPost={() => getFromRange({ start: range.start, end: range.end })}
                onClose={() => setPopupIsOpenAddTour(false)}
            />
            <AddScheduleEventModal
                isOpen={popupIsOpenAdd}
                date={selectedDate}
                onPost={addSingleEvent}
                onClose={() => {
                    setSelectedDate(null);
                    setPopupIsOpenAdd(false);
                }}
            />
            <DuplicateScheduleModal
                closeModal={() => {
                    setPopupIsOpenCopy(false);
                    getFromRange({ start: range.start, end: range.end });
                }}
                weekStartsOn={0}
                onSubmit={duplicateStudentOnTourSchedule}
                show={popupIsOpenCopy}
                title="Dupliceer planning"
            />
        </>
    );
}

const locales = {
    "nl-BE": nlBE,
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek: () => {
        return startOfWeek(new Date());
    },
    getDay,
    locales,
});

const DnDCalendar = withDragAndDrop(Calendar);

export default ScheduleCalendar;
