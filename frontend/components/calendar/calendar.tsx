import React, {FC, useEffect, useState} from "react";
import {Calendar, dateFnsLocalizer, Event} from "react-big-calendar";
import withDragAndDrop, {EventInteractionArgs, withDragAndDropProps} from "react-big-calendar/lib/addons/dragAndDrop";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import nlBE from "date-fns/locale/nl-BE";
import {messages} from "@/locales/localizerCalendar";
import {getAllStudentOnTourFromDate, postStudentOnTour, StudentOnTour} from "@/lib/student-on-tour";

import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import "react-big-calendar/lib/css/react-big-calendar.css";
import EditEventModal from "@/components/calendar/editEvent";
import CustomDisplay from "@/components/calendar/customEvent";
import AddEventModal from "@/components/calendar/addEvent";
import {Tour} from "@/lib/tour";
import {User} from "@/lib/user";
import {addDays, endOfWeek} from "date-fns";
import {formatDate} from "@/lib/date";
import {handleError} from "@/lib/error";
import LoadEventsModal from "@/components/calendar/loadEvents";

interface MyEvent extends Event {
    tour: Tour;
    student: User;
    start: Date;
    end: Date;
}

interface Props {
    students: User[];
    tours: Tour[];
}

const MyCalendar: FC<Props> = (props) => {
    const [popupIsOpenEdit, setPopupIsOpenEdit] = useState(false);
    const [popupIsOpenAdd, setPopupIsOpenAdd] = useState(false);
    const [popupIsOpenLoad, setPopupIsOpenLoad] = useState(false);
    const [errorMessages, setErrorMessages] = useState<string[]>([]);
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
    const [events, setEvents] = useState<MyEvent[]>([]);
    const [rendered, setRendered] = useState<string[]>([])
    const [range, setRange] = useState({
        start: startOfWeek(new Date(), {weekStartsOn: 1}),
        end: endOfWeek(new Date(), {weekStartsOn: 1}),
    });

    useEffect(() => {
        if (props.students.length > 0 && props.tours.length > 0) {
            getFromRange({start: startOfWeek(new Date()), end: endOfWeek(new Date())});
        }
    }, [props.students, props.tours]);

    function getFromRange(range: Date[] | { start: Date; end: Date }) {
        // If the range is an array, get the first & last element of the array
        let startDate: Date = Array.isArray(range) ? range[0] : range.start;
        let endDate: Date | null = Array.isArray(range) ? range[range.length - 1] : range.end;
        setRange({start: startDate, end: endDate})
        console.log(startDate)
        console.log(endDate)
        // Set the new range
        if (!rendered.includes(startDate.toISOString())) {
            setRendered([...rendered, startDate.toISOString()])
            onEventsLoad({start_date: startDate, end_date: endDate});
        }
    }

    const onEventsLoad = ({start_date, end_date}: { start_date: Date; end_date: Date }) => {
        getAllStudentOnTourFromDate({startDate: new Date(start_date), endDate: new Date(end_date)}).then(
            (res) => {
                const list: StudentOnTour[] = res.data;
                const tours = groupByKey(list, "tour");
                let data: MyEvent[] = [];
                for (let a in tours) {
                    const t = parseInt(a);
                    const value = tours[t];
                    // @ts-ignore
                    let tour: Tour = props.tours.find((tour: Tour) =>tour.id === t);
                    for (let b in value) {
                        const v = parseInt(b);
                        const item = value[v];
                        // @ts-ignore
                        let student: User = props.students.find((student: User) => student.id === item.student);
                        let start = new Date(item.date);
                        let end = addDays(start, 1);
                        start.setHours(0);
                        end.setHours(0);
                        data.push({tour: tour, student: student, start: start, end: end});
                    }
                    data = data.filter(Boolean);
                }
                onEventsAdd(data);
            },
            (err) => {
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
        let newEvents: MyEvent[] = []
        for (let e of events) {
            if (e.start >= range.start && e.start <= range.end) {
                newEvents.push({
                    tour: e.tour,
                    student: e.student,
                    start: addDays(e.start, diff),
                    end: addDays(e.end, diff)
                })
            }
        }
        onEventsAdd(newEvents);
        setRendered([...rendered, start.toISOString()])
    };

    const onEventSelection = (e: Event) => {
        console.log(e)
        setSelectedEvent(e);
        setPopupIsOpenEdit(true);
    };

    const onEventEdit = ({tour, student}: { tour: Tour; student: User }) => {
        setEvents((currentEvents) => {
            return currentEvents.map((currentEvent) => {
                if (currentEvent === selectedEvent) {
                    return {
                        ...currentEvent,
                        tour: tour,
                        student: student,
                    };
                }
                return currentEvent;
            });
        });
    };

    const onEventAdd = ({tour, student, start, end}: { tour: Tour; student: User; start: Date; end: Date }) => {
        setEvents((currentEvents) => {
            const newEvent: MyEvent = {
                tour: tour,
                student: student,
                start: start,
                end: end,
            };
            return [...currentEvents, newEvent];
        });
    };

    const onEventsAdd = (eventData: MyEvent[]) => {
        setEvents((currentEvents) => {
            const newEvents = eventData.map((event) => ({
                tour: event.tour,
                student: event.student,
                start: event.start,
                end: event.end,
            }));
            return [...currentEvents, ...newEvents];
        });
    };

    // @ts-ignore
    const onEventResize: withDragAndDropProps["onEventResize"] = (data: EventInteractionArgs<MyEvent>) => {
        const {event, start, end} = data;
        let resizedEvents = [];
        let currentDate = new Date(start);
        currentDate.setHours(0);
        while (currentDate < end) {
            let nextDate = addDays(currentDate, 1);
            nextDate.setHours(2);
            resizedEvents.push({tour: event.tour, student: event.student, start: currentDate, end: nextDate});
            currentDate = nextDate;
            currentDate.setHours(0);
        }
        onEventDelete(event)
        onEventsAdd(resizedEvents)
    };

    const onEventDelete = (event: MyEvent) => {
        setEvents((currentEvents) => {
            return currentEvents.filter((currentEvent) => {
                return currentEvent !== event;
            });
        });
    };

    const onEventsDelete = (event: MyEvent) => {
        const removedTours = events.filter((e) => {
            return e.tour.id == event.tour.id && e.start >= range.start && e.start <= range.end;
        })
        const updatedEvents = events.filter(e => !removedTours.includes(e));
        setEvents(updatedEvents)
    };

    const handleScheduleSave = () => {
        const toLoad = events.filter(Boolean);
        for (let e in toLoad) {
            postStudentOnTour(toLoad[e].tour.id, toLoad[e].student.id, formatDate(toLoad[e].start)).then(
                (_) => {
                },
                (err) => {
                    const e = handleError(err);
                    setErrorMessages(e);
                }
            );
        }
    };

    const test = () => {
        setPopupIsOpenAdd(true)
         console.log(range.start)
    }

    return (
        <>
            <button className="btn btn-primary mb-3" onClick={test}>
                Voeg ronde toe
            </button>
            <button className="btn btn-primary mb-3" onClick={handleScheduleSave}>
                Sla planning op
            </button>
            <button className="btn btn-primary mb-3" onClick={() => {
                setPopupIsOpenLoad(true)
            }}>
                Kopieer naar nieuwe week
            </button>
            {errorMessages.length !== 0 && (
                <div className={"visible alert alert-danger alert-dismissible fade show"}>
                    <ul>
                        {errorMessages.map((err, i) => (
                            <li key={i}>{err}</li>
                        ))}
                    </ul>
                    <button type="button" className="btn-close" onClick={() => setErrorMessages([])}/>
                </div>
            )}
            <DnDCalendar
                messages={messages}
                culture={"nl-BE"}
                defaultDate={new Date()}
                defaultView="week"
                views={['week', 'day', 'agenda']}
                events={events}
                components={{event: CustomDisplay}}
                localizer={localizer}
                selectable
                onSelectEvent={onEventSelection}
                style={{height: "100vh"}}
                step={60}
                timeslots={1}
                onEventDrop={onEventResize}
                onEventResize={onEventResize}
                onRangeChange={getFromRange}
                resizable
            />
            {selectedEvent && (
                <EditEventModal
                    event={selectedEvent}
                    allStudents={props.students}
                    allTours={props.tours}
                    isOpen={popupIsOpenEdit}
                    onClose={() => {
                        setSelectedEvent(null);
                        setPopupIsOpenEdit(false);
                    }}
                    onSave={onEventEdit}
                    onDelete={onEventDelete}
                    onDeleteTour={onEventsDelete}
                />
            )}
            <AddEventModal
                first_day={range.start}
                allStudents={props.students}
                allTours={props.tours}
                isOpen={popupIsOpenAdd}
                onClose={() => setPopupIsOpenAdd(false)}
                onSaveMultiple={onEventsAdd}
            />
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
        return startOfWeek(new Date(), {weekStartsOn: 0});
    },
    getDay,
    locales,
});

const DnDCalendar = withDragAndDrop(Calendar);

export default MyCalendar;
