import React, {FC, useState} from "react";
import {Calendar, dateFnsLocalizer, Event} from "react-big-calendar";
import withDragAndDrop, {withDragAndDropProps} from "react-big-calendar/lib/addons/dragAndDrop";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import nlBE from "date-fns/locale/nl-BE";
import {messages} from "@/locales/localizerCalendar";

import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import "react-big-calendar/lib/css/react-big-calendar.css";
import EditEventModal from "@/components/calendar/editEvent";
import CustomDisplay from "@/components/calendar/customEvent";
import AddEventModal from "@/components/calendar/addEvent";
import {User} from "@/lib/user";
import {Tour} from "@/lib/tour";
import {getALlStudentOnTourFromDate, postStudentOnTour, StudentOnTour} from "@/lib/student-on-tour";
import {handleError} from "@/lib/error";
import LoadEventsModal from "@/components/calendar/loadEvents";
import {addDays} from "date-fns";
import {formatDate} from "@/lib/date";

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

    const onEventsLoad = ({start_date, end_date}: { start_date: Date; end_date: Date }) => {
        getALlStudentOnTourFromDate({startDate: new Date(start_date), endDate: new Date(end_date)}).then(
            (res) => {
                const list: StudentOnTour[] = res.data;
                const tours = groupByKey(list, "tour");
                let data: MyEvent[] = [];
                for (let a in tours) {
                    const t = parseInt(a);
                    const value = tours[t];
                    let tour: Tour = props.tours.filter(function (tour: Tour) {
                        return tour.id == t;
                    })[0];
                    for (let b in value) {
                        const v = parseInt(b);
                        const item = value[v];
                        let student: User = props.students.filter(function (user: User) {
                            return user.id == item.student;
                        })[0];
                        let start = new Date(item.date);
                        let end = addDays(start, 1);
                        start.setHours(0);
                        end.setHours(0);
                        data[t] = {tour: tour, student: student, start: start, end: end};
                    }
                    data = data.filter(Boolean);
                    onEventsAdd(data);
                }
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

    const onEventSelection = (e: Event) => {
        console.log(e);
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

    const onEventResize: withDragAndDropProps["onEventResize"] = (data) => {
        const {event, start, end} = data;
        setEvents((currentEvents) => {
            return currentEvents.map((currentEvent) => {
                if (currentEvent === event) {
                    return {
                        ...currentEvent,
                        start: new Date(start),
                        startDate: new Date(start),
                        endDate: new Date(end),
                        end: new Date(end),
                    };
                }
                return currentEvent;
            });
        });
    };

    const onEventDelete = ({event}: { event: MyEvent }) => {
        setEvents((currentEvents) => {
            return currentEvents.filter((currentEvent) => {
                return currentEvent !== event;
            });
        });
    };

    const getDaysArray = function (start: Date, end: Date) {
        let arr = [];
        let dt = new Date(start);
        for (; dt <= new Date(end); dt.setDate(dt.getDate() + 1)) {
            arr.push(new Date(dt));
        }
        return arr;
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

    return (
        <>
            <button className="btn btn-primary mb-3" onClick={() => setPopupIsOpenAdd(true)}>
                Voeg ronde toe
            </button>
            <button className="btn btn-primary mb-3" onClick={() => setPopupIsOpenLoad(true)}>
                Kies vorige planning
            </button>
            <button className="btn btn-primary mb-3" onClick={handleScheduleSave}>
                Sla planning op
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
                defaultView="week"
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
                />
            )}
            <AddEventModal
                allStudents={props.students}
                allTours={props.tours}
                isOpen={popupIsOpenAdd}
                onClose={() => setPopupIsOpenAdd(false)}
                onSave={onEventAdd}
                onSaveMultiple={onEventsAdd}
            />
            <LoadEventsModal isOpen={popupIsOpenLoad} onClose={() => setPopupIsOpenLoad(false)} onSave={onEventsLoad}/>
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
