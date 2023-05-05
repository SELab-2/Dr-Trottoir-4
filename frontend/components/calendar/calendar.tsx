import React, {FC, useEffect, useState} from "react";
import {Calendar, dateFnsLocalizer, Event} from "react-big-calendar";
import withDragAndDrop, {EventInteractionArgs, withDragAndDropProps} from "react-big-calendar/lib/addons/dragAndDrop";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import nlBE from "date-fns/locale/nl-BE";
import {messages} from "@/locales/localizerCalendar";
import {
    deleteBulkStudentOnTour,
    getAllStudentOnTourFromDate, patchBulkStudentOnTour,
    postBulkStudentOnTour,
    postStudentOnTour,
    StudentOnTour
} from "@/lib/student-on-tour";

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
import {colors} from "@/components/calendar/colors";
import {MyEvent} from "@/types";

interface Props {
    students: User[];
    tours: Tour[];
}

const MyCalendar: FC<Props> = (props) => {
    const [popupIsOpenEdit, setPopupIsOpenEdit] = useState(false);
    const [popupIsOpenAdd, setPopupIsOpenAdd] = useState(false);
    const [popupIsOpenLoad, setPopupIsOpenLoad] = useState(false);
    const [errorMessages, setErrorMessages] = useState<string[]>([]);
    const [successMessage, setSuccessMessage] = useState<string>("");
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
    const [tourColors, setTourColors] = useState<{ [key: number]: string }>({});
    const [events, setEvents] = useState<MyEvent[]>([]);
    const [deletedEvents, setDeletedEvents] = useState<number[]>([]);
    const [rendered, setRendered] = useState<string[]>([]);
    const [range, setRange] = useState({
        start: startOfWeek(new Date(), {weekStartsOn: 1}),
        end: endOfWeek(new Date(), {weekStartsOn: 1}),
    });

    useEffect(() => {
        if (props.students.length > 0 && props.tours.length > 0) {
            assignColors(props.tours);
            getFromRange({start: startOfWeek(new Date()), end: endOfWeek(new Date())});
        }
    }, [props.students, props.tours]);

    function getFromRange(range: Date[] | { start: Date; end: Date }) {
        let startDate: Date = Array.isArray(range) ? range[0] : range.start;
        let endDate: Date | null = Array.isArray(range) ? range[range.length - 1] : range.end;
        setRange({start: startDate, end: endDate})
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
                    let tour: Tour = props.tours.find((tour: Tour) => tour.id === t);
                    for (let b in value) {
                        const v = parseInt(b);
                        const item = value[v];
                        // @ts-ignore
                        let student: User = props.students.find((student: User) => student.id === item.student);
                        let start = new Date(item.date);
                        let end = addDays(start, 1);
                        start.setHours(0);
                        end.setHours(0);
                        data.push({id: item.id, tour: tour, student: student, start: start, end: end, edit: false});
                    }
                    data = data.filter(Boolean);
                }
                onEventsAdd(data);
            },
            (err) => {
                const e = handleError(err);
                setErrorMessages(e);
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
                    id: null,
                    tour: e.tour,
                    student: e.student,
                    start: addDays(e.start, diff),
                    end: addDays(e.end, diff),
                    edit: false
                })
            }
        }
        onEventsAdd(newEvents);
        setRendered([...rendered, start.toISOString()])
    };

    const onEventSelection = (e: Event) => {
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
                        edit: true
                    };
                }
                return currentEvent;
            });
        });
    };


    const onEventsAdd = (eventData: MyEvent[]) => {
        setEvents((currentEvents) => {
            const newEvents = eventData.map((event) => ({
                id: event.id,
                tour: event.tour,
                student: event.student,
                start: event.start,
                end: event.end,
                edit: false
            }));
            return [...currentEvents, ...newEvents];
        });
    };

    const onEventResize: withDragAndDropProps["onEventResize"] = (args: EventInteractionArgs<MyEvent>) => {
        const {event, start, end} = args;
        let resizedEvents = [];
        let currentDate = new Date(start);
        currentDate.setHours(0);
        while (currentDate < end) {
            let nextDate = addDays(currentDate, 1);
            nextDate.setHours(2);
            if (formatDate(currentDate) !== formatDate(event.start)) {
                resizedEvents.push({id: null, tour: event.tour, student: event.student, start: currentDate, end: nextDate, edit: false});
            }
            currentDate = nextDate;
            currentDate.setHours(0);
        }
        onEventsAdd(resizedEvents)
        console.log(event)
        console.log(resizedEvents)
    };

    const onEventDelete = (event: MyEvent) => {
        const deleted : MyEvent | undefined = events.find((currentEvent : MyEvent) => {
            if (currentEvent == event) {
                return currentEvent.id
            }
        });
        if (deleted != undefined && deleted.id != null) {
             setDeletedEvents([...deletedEvents, deleted.id]);
        }
        setEvents((currentEvents) => {
            return currentEvents.filter((currentEvent) => {
                return currentEvent !== event;
            });
        });
    };

    const onEventsDelete = (event: MyEvent) => {
        const removedTours = events.filter((e) => {
            return e.tour.id == event.tour.id && e.start >= range.start && e.start <= range.end;
        });
        const updatedEvents : MyEvent[] = events.filter(e => !removedTours.includes(e));
        const deletedIDs : (number| undefined)[] = removedTours.map((event) => {
            if (event != undefined && event.id != null) {
                return event.id
            }
        });
        // @ts-ignore
        const newIDs : number[] = deletedIDs.filter(Boolean);
        setEvents(updatedEvents);
        setDeletedEvents([...deletedEvents, ...newIDs]);
    };

    const handleScheduleSave = () => {
        const toLoad = events.filter(Boolean);
        const post = toLoad.filter((event: MyEvent) => {
            return event.id == null;
        });
        const patch = toLoad.filter((event : MyEvent) => {
            return event.id !== null && event.edit;
        })
        const post_data = post.map((myEvent : MyEvent) => {
           return {tour: myEvent.tour.id, student: myEvent.student.id, date: formatDate(myEvent.start)}
        });

        const patch_data = patch.map((myEvent : MyEvent) => {
            if (myEvent.id !== null) {
                let id : string = (myEvent.id).toString()
                return {[id]: {tour: myEvent.tour.id, student: myEvent.student.id, date: formatDate(myEvent.start)}}
            }
        });
        const right_patch_format = patch_data.reduce((acc, curr) => ({ ...acc, ...curr }), {});

        postBulkStudentOnTour(post_data).then(
            (_) => {
                setSuccessMessage("Nieuwe planning opgeslagen.")
            },
            (err) => {
                const e = handleError(err);
                setErrorMessages([...errorMessages, ...e]);
            }
        );
        patchBulkStudentOnTour(right_patch_format).then(
            (_) => {
                setSuccessMessage("Aanpassingen aan planning opgeslagen.")
            },
            (err) => {
                const e = handleError(err);
                setErrorMessages([...errorMessages, ...e]);
                console.log([...errorMessages, ...e])
            }
        );
        deleteBulkStudentOnTour(deletedEvents).then(
            (_) => {
                setSuccessMessage("Verwijderingen zijn doorgevoerd.")
            },
            (err) => {
                const e = handleError(err);
                setErrorMessages([...errorMessages, ...e]);
            }
        );
    };

    const assignColors = (tours: Tour[]) => {
        const col : { [key: number]: string } = {}
        for (let tour in tours) {
            col[tours[tour].id] = colors[tour]
        }
        setTourColors(col);
    }

    return (
        <>
            <div>
                <button className="btn btn-primary mb-3" onClick={() => {
                    setPopupIsOpenAdd(true)
                }}>
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
                <button className="btn btn-primary mb-3" onClick={() => {console.log(events); console.log(deletedEvents)}}>Events</button>
                {successMessage && (
                    <div className={"visible alert alert-success alert-dismissible fade show"}>
                        <p>{successMessage}</p>
                        <button type="button" className="btn-close" data-bs-dismiss="alert"
                                onClick={() => setSuccessMessage("")}/>
                    </div>
                )}
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
            </div>
            <DnDCalendar
                messages={messages}
                culture={"nl-BE"}
                defaultDate={new Date()}
                defaultView="week"
                views={['week', 'day', 'agenda']}
                events={events}
                components={{event: CustomDisplay}}
                eventPropGetter={(event : any) => {
                    const backgroundColor = tourColors[event.tour.id];
                    return {style: {backgroundColor, color: "white"}};
                }}
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
