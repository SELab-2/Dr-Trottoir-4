import React, {useEffect, useState} from "react";
import {Calendar, dateFnsLocalizer, Event} from "react-big-calendar";
import withDragAndDrop, {EventInteractionArgs} from "react-big-calendar/lib/addons/dragAndDrop";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import nlBE from "date-fns/locale/nl-BE";
import {messages} from "@/locales/localizerCalendar";
import {
    deleteBulkStudentOnTour,
    deleteStudentOnTour,
    getAllStudentOnTourFromDate,
    patchStudentOnTour,
    postBulkStudentOnTour,
    StudentOnTour,
    StudentOnTourPost,
} from "@/lib/student-on-tour";

import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import "react-big-calendar/lib/css/react-big-calendar.css";
import EditScheduleEventModal from "@/components/calendar/editScheduleEvent";
import CustomDisplay from "@/components/calendar/customEvent";
import AddScheduleEventModal from "@/components/calendar/addScheduleEvent";
import {Tour} from "@/lib/tour";
import {User} from "@/lib/user";
import {addDays, endOfWeek} from "date-fns";
import {formatDate} from "@/lib/date";
import {handleError} from "@/lib/error";
import CopyScheduleEventsModal from "@/components/calendar/loadEvents";
import {colors} from "@/components/calendar/colors";
import styles from "./calendar.module.css";
import {ScheduleEvent} from "@/types";
import ErrorMessageAlert from "@/components/errorMessageAlert";
import SuccessMessageAlert from "@/components/successMessageAlert";
import AddTourScheduleModal from "@/components/calendar/addTourSchedule";

function ScheduleCalendar(
    {
        tourUsers,
        tours
    }: {
        tourUsers: User[];
        tours: Tour[];
    }
) {
    const [popupIsOpenEdit, setPopupIsOpenEdit] = useState(false);
    const [popupIsOpenAdd, setPopupIsOpenAdd] = useState(false);
    const [popupIsOpenAddTour, setPopupIsOpenAddTour] = useState(false);
    const [popupIsOpenLoad, setPopupIsOpenLoad] = useState(false);
    const [errorMessages, setErrorMessages] = useState<string[]>([]);
    const [successMessages, setSuccessMessages] = useState<string[]>([]);
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
    const [tourColors, setTourColors] = useState<{ [key: number]: string }>({});
    const [events, setEvents] = useState<ScheduleEvent[]>([]);
    const [range, setRange] = useState({
        start: startOfWeek(new Date()), // week starts on sunday
        end: endOfWeek(new Date()),
    });

    useEffect(() => {
        if (tourUsers.length > 0 && tours.length > 0) {
            assignColors(tours);
            getFromRange({start: startOfWeek(new Date()), end: endOfWeek(new Date())});
        }
    }, [tourUsers, tours]);

    function getFromRange(range: Date[] | { start: Date; end: Date }) {
        let startDate: Date = Array.isArray(range) ? range[0] : range.start;
        let endDate: Date | null = Array.isArray(range) ? range[range.length - 1] : range.end;
        setRange({start: startDate, end: endDate});
        onEventsLoad({start_date: startDate, end_date: endDate});
    }

    function postEvents(start: Date, end: Date, data: StudentOnTourPost[]) {
        postBulkStudentOnTour(data).then(
            _ => getFromRange({start: range.start, end: range.end}),
            err => setErrorMessages(handleError(err))
        );
    }

    function onEventsLoad({start_date, end_date}: { start_date: Date; end_date: Date }) {
        getAllStudentOnTourFromDate({startDate: new Date(start_date), endDate: new Date(end_date)}).then(
            res => {
                const list: StudentOnTour[] = res.data;
                setEvents(list.filter(s => {
                    return tourUsers.find((u: User) => u.id === s.student) && tours.find((t: Tour) => t.id === s.tour);
                }).map(sot => {
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
                    }
                }).sort(compareScheduleEvents));
            }, err => setErrorMessages(handleError(err))
        );
    }

    function onEventsCopy(start: Date, end: Date) {
        getFromRange({start, end})
        setSuccessMessages([`Gekopieerd naar week van ${formatDate(start)}`]);
    }

    function onEventSelection(e: Event) {
        setSelectedEvent(e);
        setPopupIsOpenEdit(true);
    }

    function onEventsAdd(eventData: ScheduleEvent[]) {
        setEvents((currentEvents) => {
            return [...currentEvents, ...eventData].sort(compareScheduleEvents);
        });
    }

    function onEventEdit(id: number, tour: number, student: number, date: Date) {
        let end = addDays(date, 1);
        date.setHours(0);
        end.setHours(0);
        const currentTour: Tour | undefined = tours.find((t: Tour) => t.id === tour);
        const currentStudent: User | undefined = tourUsers.find((s: User) => s.id === student);
        if (currentTour && currentStudent) {
            setEvents((currentEvents) => {
                return currentEvents.map((currentEvent) => {
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
                }).sort(compareScheduleEvents);
            });
        }
    }

    function onEventResize(args: EventInteractionArgs<object>): void {
        const {event, start, end} = args;
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
        const {event, start} = args;
        const scheduleEvent: ScheduleEvent = event as ScheduleEvent;
        patchStudentOnTour(scheduleEvent.id, scheduleEvent.tour.id, scheduleEvent.student.id, formatDate(new Date(start))).then(
            res => {
                onEventEdit(scheduleEvent.id, scheduleEvent.tour.id, scheduleEvent.student.id, new Date(res.data.date));
            },
            err => setErrorMessages(handleError(err))
        );
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
            _ => {
                setEvents((currentEvents) => {
                    return currentEvents.filter((currentEvent) => {
                        return currentEvent !== event;
                    }).sort(compareScheduleEvents);
                });
            },
            err => setErrorMessages(handleError(err))
        );
    }

    function onEventsDelete(event: ScheduleEvent) {
        const removedTours: ScheduleEvent[] = events.filter((e) => {
            return e.tour.id == event.tour.id && e.start >= range.start && e.start <= range.end;
        });
        deleteBulkStudentOnTour(
            removedTours.map((event: ScheduleEvent) => {
                return event.id;
            })
        ).then(
            _ => {
                const updatedEvents: ScheduleEvent[] = events.filter((e) => !removedTours.includes(e));
                setEvents(updatedEvents);
            },
            err => setErrorMessages(handleError(err))
        );
    }

    function assignColors(tours: Tour[]) {
        const col: { [key: number]: string } = {};
        tours.forEach((t: Tour, index: number) => {
            const cIndex = index % colors.length
            col[t.id] = colors[cIndex];
        });
        setTourColors(col);
    }

    return (
        <>
            <div>
                <div>
                    <button
                        className={styles.button}
                        onClick={() => {
                            setPopupIsOpenAddTour(true);
                        }}
                    >
                        Plan ronde voor hele week
                    </button>
                    <button
                        className={styles.button}
                        onClick={() => {
                            setPopupIsOpenAdd(true);
                        }}
                    >
                        Plan
                    </button>
                    <button
                        className={styles.button}
                        onClick={() => {
                            setPopupIsOpenLoad(true);
                        }}
                    >
                        Kopieer planning
                    </button>
                </div>
                <SuccessMessageAlert successmessages={successMessages} setSuccessMessages={setSuccessMessages}/>
                <ErrorMessageAlert errorMessages={errorMessages} setErrorMessages={setErrorMessages}/>
            </div>
            <DnDCalendar
                messages={messages}
                culture={"nl-BE"}
                defaultDate={new Date()}
                defaultView="week"
                views={["week", "day"]}
                events={events}
                components={{event: CustomDisplay}}
                eventPropGetter={(event: any) => {
                    const backgroundColor = tourColors[event.tour.id];
                    return {style: {backgroundColor, color: "white"}};
                }}
                localizer={localizer}
                drilldownView={null}
                selectable
                onSelectEvent={onEventSelection}
                style={{height: "100vh"}}
                step={60}
                timeslots={1}
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
                    editEvent={onEventEdit}
                />
            )}
            <AddTourScheduleModal isOpen={popupIsOpenAddTour} onClose={() => setPopupIsOpenAddTour(false)}/>
            <AddScheduleEventModal isOpen={popupIsOpenAdd} onClose={() => setPopupIsOpenAdd(false)}/>
            <CopyScheduleEventsModal
                range={range}
                events={events}
                isOpen={popupIsOpenLoad}
                onClose={() => setPopupIsOpenLoad(false)}
                onSave={onEventsCopy}
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
