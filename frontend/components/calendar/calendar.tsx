import React, { FC, useEffect, useState } from "react";
import { Calendar, dateFnsLocalizer, Event } from "react-big-calendar";
import withDragAndDrop, { EventInteractionArgs, withDragAndDropProps } from "react-big-calendar/lib/addons/dragAndDrop";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import nlBE from "date-fns/locale/nl-BE";
import { messages } from "@/locales/localizerCalendar";
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
import EditEventModal from "@/components/calendar/editEvent";
import CustomDisplay from "@/components/calendar/customEvent";
import AddEventModal from "@/components/calendar/addEvent";
import { Tour } from "@/lib/tour";
import { getTourUsers, User } from "@/lib/user";
import { addDays, endOfWeek } from "date-fns";
import { formatDate } from "@/lib/date";
import { handleError } from "@/lib/error";
import LoadEventsModal from "@/components/calendar/loadEvents";
import { colors } from "@/components/calendar/colors";
import styles from "./calendar.module.css";
import { MyEvent } from "@/types";
import ErrorMessageAlert from "@/components/errorMessageAlert";
import SuccessMessageAlert from "@/components/successMessageAlert";
import AddTourModal from "@/components/calendar/addTour";

interface Props {
    tourUsers: User[];
    tours: Tour[];
}

const MyCalendar: FC<Props> = (props) => {
    const [popupIsOpenEdit, setPopupIsOpenEdit] = useState(false);
    const [popupIsOpenAdd, setPopupIsOpenAdd] = useState(false);
    const [popupIsOpenAddTour, setPopupIsOpenAddTour] = useState(false);
    const [popupIsOpenLoad, setPopupIsOpenLoad] = useState(false);
    const [errorMessages, setErrorMessages] = useState<string[]>([]);
    const [successMessages, setSuccessMessages] = useState<string[]>([]);
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
    const [tourColors, setTourColors] = useState<{ [key: number]: string }>({});
    const [events, setEvents] = useState<MyEvent[]>([]);
    const [rendered, setRendered] = useState<string[]>([]);
    const [range, setRange] = useState({
        start: startOfWeek(new Date(), { weekStartsOn: 1 }),
        end: endOfWeek(new Date(), { weekStartsOn: 1 }),
    });

    useEffect(() => {
        if (props.tourUsers.length > 0 && props.tours.length > 0) {
            assignColors(props.tours);
            getFromRange({ start: startOfWeek(new Date()), end: endOfWeek(new Date()) });
        }
    }, [props.tourUsers, props.tours]);

    function getFromRange(range: Date[] | { start: Date; end: Date }) {
        let startDate: Date = Array.isArray(range) ? range[0] : range.start;
        let endDate: Date | null = Array.isArray(range) ? range[range.length - 1] : range.end;
        setRange({ start: startDate, end: endDate });
        if (!rendered.includes(startDate.toISOString())) {
            setRendered([...rendered, startDate.toISOString()]);
            onEventsLoad({ start_date: startDate, end_date: endDate });
        }
    }

    function reload(start: Date | null, end: Date | null) {
        if (start === null && end === null) {
            start = range.start;
            end = range.end;
        }
        const remove_for_reload = events.filter((e) => {
            return e.start >= start! && e.start <= end!;
        });
        const updatedEvents: MyEvent[] = events.filter((e) => !remove_for_reload.includes(e));
        setEvents(updatedEvents);
        onEventsLoad({ start_date: start!, end_date: end! });
    }

    function postEvents(start: Date, end: Date, data: StudentOnTourPost[]) {
        postBulkStudentOnTour(data).then(
            (_) => {
                reload(start, end);
            },
            (err) => {
                const e = handleError(err);
                setErrorMessages([...errorMessages, ...e]);
            }
        );
    }

    const onEventsLoad = ({ start_date, end_date }: { start_date: Date; end_date: Date }) => {
        getAllStudentOnTourFromDate({ startDate: new Date(start_date), endDate: new Date(end_date) }).then(
            (res) => {
                const list: StudentOnTour[] = res.data;
                const tours = groupByKey(list, "tour");
                let data: MyEvent[] = [];
                for (let a in tours) {
                    const t = parseInt(a);
                    const value = tours[t];
                    let tour: Tour | undefined = props.tours.find((tour: Tour) => tour.id === t);
                    if (tour !== undefined) {
                        for (let b in value) {
                            const v = parseInt(b);
                            const item = value[v];
                            let student: User | undefined = props.tourUsers.find(
                                (student: User) => student.id === item.student
                            );
                            if (student !== undefined) {
                                let start = new Date(item.date);
                                let end = addDays(start, 1);
                                start.setHours(0);
                                end.setHours(0);
                                data.push({
                                    id: item.id,
                                    tour: tour,
                                    student: student,
                                    start: start,
                                    end: end,
                                });
                            }
                        }
                        data = data.filter(Boolean);
                    }
                }
                onEventsAdd(data);
            },
            (err) => {
                const e = handleError(err);
                setErrorMessages([...errorMessages, ...e]);
                console.error(err);
            }
        );
    };

    function groupByKey(array: any[], key: string) {
        return array.reduce((result, currentValue) => {
            const groupKey = currentValue[key];
            (result[groupKey] = result[groupKey] || []).push(currentValue);
            return result;
        }, {});
    }

    const onEventsCopy = (start: Date, diff: number) => {
        let newEvents: StudentOnTourPost[] = [];
        for (let e of events) {
            if (e.start >= range.start && e.start <= range.end) {
                newEvents.push({
                    tour: e.tour.id,
                    student: e.student.id,
                    date: formatDate(addDays(e.start, diff)),
                });
            }
        }
        const end = addDays(start, 6);
        postEvents(start, end, newEvents);
        setRendered([...rendered, start.toISOString()]);
        reload(start, end);
        setSuccessMessages([...successMessages, `Gekopieerd naar week van ${formatDate(start)}`]);
    };

    const onEventSelection = (e: Event) => {
        setSelectedEvent(e);
        setPopupIsOpenEdit(true);
    };

    const onEventsAdd = (eventData: MyEvent[]) => {
        setEvents((currentEvents) => {
            const newEvents = eventData.map((event) => ({
                id: event.id,
                tour: event.tour,
                student: event.student,
                start: event.start,
                end: event.end,
            }));
            return [...currentEvents, ...newEvents];
        });
    };

    const onEventEdit = (id: number, tour: number, student: number, date: Date) => {
        let end = addDays(date, 1);
        date.setHours(0);
        end.setHours(0);
        const currentTour: Tour | undefined = props.tours.find((t: Tour) => t.id === tour);
        const currentStudent: User | undefined = props.tourUsers.find((s: User) => s.id === student);
        if (currentTour !== undefined && currentStudent !== undefined) {
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
                });
            });
        }
    };

    // @ts-ignore
    const onEventResize: withDragAndDropProps["onEventResize"] = (args: EventInteractionArgs<MyEvent>) => {
        const { event, start, end } = args;
        let resizedEvents: StudentOnTourPost[] = [];
        let currentDate = new Date(start);
        currentDate.setHours(0);
        while (currentDate < end) {
            let nextDate = addDays(currentDate, 1);
            nextDate.setHours(2);
            if (formatDate(currentDate) !== formatDate(event.start)) {
                resizedEvents.push({
                    tour: event.tour.id,
                    student: event.student.id,
                    date: formatDate(currentDate),
                });
            }
            currentDate = nextDate;
            currentDate.setHours(0);
        }
        postEvents(range.start, range.end, resizedEvents);
    };

    // @ts-ignore
    const onEventDragAndDrop: withDragAndDropProps["onEventDrop"] = (args: EventInteractionArgs<MyEvent>) => {
        const { event, start } = args;
        patchStudentOnTour(event.id, event.tour.id, event.student.id, formatDate(new Date(start))).then(
            (res) => {
                onEventEdit(event.id, event.tour.id, event.student.id, new Date(res.data.date));
            },
            (err) => {
                const e = handleError(err);
                setErrorMessages([...errorMessages, ...e]);
            }
        );
    };

    const onEventDelete = (event: MyEvent) => {
        deleteStudentOnTour(event.id).then(
            (_) => {
                setEvents((currentEvents) => {
                    return currentEvents.filter((currentEvent) => {
                        return currentEvent !== event;
                    });
                });
            },
            (err) => {
                const e = handleError(err);
                setErrorMessages([...errorMessages, ...e]);
            }
        );
    };

    const onEventsDelete = (event: MyEvent) => {
        const removedTours: MyEvent[] = events.filter((e) => {
            return e.tour.id == event.tour.id && e.start >= range.start && e.start <= range.end;
        });
        deleteBulkStudentOnTour(
            removedTours.map((event: MyEvent) => {
                return event.id;
            })
        ).then(
            (_) => {
                const updatedEvents: MyEvent[] = events.filter((e) => !removedTours.includes(e));
                setEvents(updatedEvents);
            },
            (err) => {
                const e = handleError(err);
                setErrorMessages([...errorMessages, ...e]);
            }
        );
    };

    const assignColors = (tours: Tour[]) => {
        const col: { [key: number]: string } = {};
        for (let tour in tours) {
            col[tours[tour].id] = colors[tour];
        }
        setTourColors(col);
    };

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
                        Voeg ronde toe
                    </button>
                    <button
                        className={styles.button}
                        onClick={() => {
                            setPopupIsOpenAdd(true);
                        }}
                    >
                        Voeg rondedag toe
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
                <SuccessMessageAlert successmessages={successMessages} setSuccessMessages={setSuccessMessages} />
                <ErrorMessageAlert errorMessages={errorMessages} setErrorMessages={setErrorMessages} />
            </div>
            <DnDCalendar
                messages={messages}
                culture={"nl-BE"}
                defaultDate={new Date()}
                defaultView="week"
                views={["week", "day", "agenda"]}
                events={events}
                components={{ event: CustomDisplay }}
                eventPropGetter={(event: any) => {
                    const backgroundColor = tourColors[event.tour.id];
                    return { style: { backgroundColor, color: "white" } };
                }}
                localizer={localizer}
                drilldownView={null}
                selectable
                onSelectEvent={onEventSelection}
                style={{ height: "100vh" }}
                step={60}
                timeslots={1}
                onEventDrop={onEventDragAndDrop}
                onEventResize={onEventResize}
                onRangeChange={getFromRange}
                resizable
            />
            {selectedEvent && (
                <EditEventModal
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
            <AddTourModal isOpen={popupIsOpenAddTour} onClose={() => setPopupIsOpenAddTour(false)} reload={reload} />
            <AddEventModal isOpen={popupIsOpenAdd} onClose={() => setPopupIsOpenAdd(false)} reload={reload} />
            <LoadEventsModal
                range={range}
                isOpen={popupIsOpenLoad}
                onClose={() => setPopupIsOpenLoad(false)}
                onSave={onEventsCopy}
            />
        </>
    );
};
const locales = {
    "nl-BE": nlBE,
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek: () => {
        return startOfWeek(new Date(), { weekStartsOn: 0 });
    },
    getDay,
    locales,
});

const DnDCalendar = withDragAndDrop(Calendar);

export default MyCalendar;
