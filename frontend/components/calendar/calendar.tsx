import React, { FC, useState } from "react";
import { Calendar, dateFnsLocalizer, Event } from "react-big-calendar";
import withDragAndDrop, { withDragAndDropProps } from "react-big-calendar/lib/addons/dragAndDrop";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import nlBE from "date-fns/locale/nl-BE";
import { messages } from "@/locales/localizerCalendar";

import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import "react-big-calendar/lib/css/react-big-calendar.css";
import EditEventModal from "@/components/calendar/editEvent";
import CustomDisplay from "@/components/calendar/customEvent";
import AddEventModal from "@/components/calendar/addEvent";
import { User } from "@/lib/user";
import { Tour } from "@/lib/tour";
import { formatDate, getALlStudentOnTourFromDate, postStudentOnTour } from "@/lib/student-on-tour";
import { handleError } from "@/lib/error";
import LoadEventsModal from "@/components/calendar/loadEvents";
import { addDays } from "date-fns";

interface MyEvent extends Event {
    tour: Tour;
    students: User[];
    start: Date;
    end: Date;
}

interface Test {
    id: number;
    tour: number;
    student: number;
    date: Date;
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

    const onEventsLoad = ({ start_date, end_date }: { start_date: Date; end_date: Date }) => {
        getALlStudentOnTourFromDate({ startDate: new Date(start_date), endDate: new Date(end_date) }).then(
            (res) => {
                const list: Test[] = res.data;
                const tours = groupByKey(list, "tour");
                for (let a in tours) {
                    const t = parseInt(a);
                    const value = tours[t];
                    value.sort((x: any, y: any) => {
                        if (x.date < y.date) {
                            return -1;
                        }
                        if (x.date > y.date) {
                            return 1;
                        }
                        return 0;
                    });
                    let tour: Tour = props.tours.filter(function (tour: Tour) {
                        return tour.id == t;
                    })[0];
                    const groupedTours: any[][] = [];
                    let currentGroup = [];

                    for (let i = 0; i < value.length; i++) {
                        const tour = value[i];
                        const nextTour = value[i + 1];

                        currentGroup.push(tour);

                        // @ts-ignore
                        if (nextTour && Math.floor(new Date(nextTour.date) - new Date(tour.date)) !== 86400000) {
                            groupedTours.push(currentGroup);
                            currentGroup = [];
                        }
                    }

                    if (currentGroup.length > 0) {
                        groupedTours.push(currentGroup);
                    }
                    for (let g in groupedTours) {
                        let students: User[] = [];
                        for (let o in groupedTours[g]) {
                            students[o] = props.students.filter(function (user: User) {
                                return user.id == groupedTours[g][o].student;
                            })[0];
                        }
                        const start = new Date(groupedTours[g][0].date);
                        let end = new Date(groupedTours[g][groupedTours[g].length - 1].date);
                        if (groupedTours[g][0].date == groupedTours[g][g.length - 1].date) {
                            end = addDays(end, 1);
                            end.setHours(0);
                        }
                        start.setHours(0);
                        onEventAdd({ tour: tour, students: students, start: start, end: end });
                    }
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

    const onEventEdit = ({ tour, students }: { tour: Tour; students: User[] }) => {
        setEvents((currentEvents) => {
            return currentEvents.map((currentEvent) => {
                if (currentEvent === selectedEvent) {
                    return {
                        ...currentEvent,
                        tour: tour,
                        students: students,
                    };
                }
                return currentEvent;
            });
        });
    };

    const onEventAdd = ({ tour, students, start, end }: { tour: Tour; students: User[]; start: Date; end: Date }) => {
        setEvents((currentEvents) => {
            const newEvent: MyEvent = {
                tour: tour,
                students: students,
                start: start,
                end: end,
            };
            return [...currentEvents, newEvent];
        });
    };

    const onEventResize: withDragAndDropProps["onEventResize"] = (data) => {
        const { event, start, end } = data;
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

    const onEventDelete = ({ event }: { event: MyEvent }) => {
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
        for (let e in events) {
            const dates = getDaysArray(events[e].start, events[e].end);
            for (let d of dates) {
                const filtered = events[e].students.reduce((acc: User[], obj: User) => {
                    // Add the object to the array if it doesn't exist
                    if (!acc.some((item) => item.id === obj.id)) {
                        acc.push(obj);
                    }
                    return acc;
                }, []);
                for (let s of filtered) {
                    // TODO when endpoint changes send array of data
                    postStudentOnTour(events[e].tour.id, s.id, formatDate(d)).then(
                        (_) => {},
                        (err) => {
                            const e = handleError(err);
                            setErrorMessages(e);
                        }
                    );
                }
            }
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
                    <button type="button" className="btn-close" onClick={() => setErrorMessages([])} />
                </div>
            )}
            <DnDCalendar
                messages={messages}
                culture={"nl-BE"}
                defaultView="week"
                events={events}
                components={{ event: CustomDisplay }}
                localizer={localizer}
                selectable
                onSelectEvent={onEventSelection}
                style={{ height: "100vh" }}
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
            />
            <LoadEventsModal isOpen={popupIsOpenLoad} onClose={() => setPopupIsOpenLoad(false)} onSave={onEventsLoad} />
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
