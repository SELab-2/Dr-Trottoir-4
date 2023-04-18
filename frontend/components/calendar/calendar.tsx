import React, {FC, useState} from 'react'
import {Calendar, dateFnsLocalizer, Event} from 'react-big-calendar'
import withDragAndDrop, {withDragAndDropProps} from 'react-big-calendar/lib/addons/dragAndDrop'
import format from 'date-fns/format'
import parse from 'date-fns/parse'
import startOfWeek from 'date-fns/startOfWeek'
import getDay from 'date-fns/getDay'
import nlBE from 'date-fns/locale/nl-BE'
import {messages} from '@/locales/localizerCalendar'

import 'react-big-calendar/lib/addons/dragAndDrop/styles.css'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import EditEventModal from "@/components/calendar/editEvent";
import CustomDisplay from "@/components/calendar/customEvent";
import AddEventModal from "@/components/calendar/addEvent";
import {User} from "@/lib/user";
import {Tour} from "@/lib/tour";
import {formatDate, getALlStudentOnTourFromDate, postStudentOnTour} from "@/lib/student-on-tour";
import {handleError} from "@/lib/error";
import LoadEventsModal from "@/components/calendar/loadSchedule";
import {addDays} from "date-fns";

interface MyEvent extends Event {
    tour: Tour
    students: User[]
    start: Date
    end: Date
}

interface Test {
    id: number,
    tour: number,
    student: number,
    date: Date,
}

interface Props {
    students: User[]
    tours: Tour[]
}

const MyCalendar: FC<Props> = (props) => {
    const [popupIsOpenEdit, setPopupIsOpenEdit] = useState(false);
    const [popupIsOpenAdd, setPopupIsOpenAdd] = useState(false);
    const [popupIsOpenLoad, setPopupIsOpenLoad] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
    const [events, setEvents] = useState<MyEvent[]>([])


    const onEventsLoad = ({start_date, end_date}: { start_date: Date, end_date: Date }) => {
        getALlStudentOnTourFromDate({startDate: new Date(start_date), endDate: new Date(end_date)}).then(
            (res) => {
                const list: Test[] = res.data
                let new_events: MyEvent[] = []
                for (let e in list) {
                    let tour: Tour = props.tours.filter(function (tour: Tour) {
                        return tour.id == list[e].tour
                    })[0];
                    let student: User = props.students.filter(function (user: User) {
                        return user.id == list[e].student
                    })[0];
                    let new_start = new Date(list[e].date)
                    new_start.setHours(0)
                    let new_end = addDays(new Date(list[e].date), 1)
                    new_end.setHours(0)
                    new_events[e] = {tour: tour, students: [student], start: new_start, end: new_end}
                }
                const tours = groupByKey(list, 'tour');
                console.log(tours)
                let test_events: MyEvent[] = []
                for (let t in tours) {
                    let students: User[] = []
                    for (let s in tours[t]) {
                        students[s] = props.students.filter(function (user: User) {
                            return user.id == tours[t][s].student;
                        })[0]
                    }
                    let tour: Tour = props.tours.filter(function (tour: Tour) {
                        return tour.id == t
                    })[0];
                    const dates = tours[t].reduce((acc, curr) => {
                        const currDate = new Date(curr.date);

                        // If the current date is consecutive with the previous date,
                        // add it to the current group. Otherwise, start a new group.
                        if (acc.currentGroup.length === 0 || currDate.getTime() === acc.previousDate.getTime() + 86400000) {
                            acc.currentGroup.push(currDate);
                        } else {
                            // If the current group has more than one date, add its earliest
                            // and latest dates to the results object.
                            if (acc.currentGroup.length > 1) {
                                const earliestDate = acc.currentGroup[0];
                                const latestDate = acc.currentGroup[acc.currentGroup.length - 1];
                                acc.results.push({earliestDate, latestDate});
                            }
                            acc.currentGroup = [currDate];
                        }

                        // Update the previous date to the current date.
                        acc.previousDate = currDate;

                        // Update the earliest and latest dates based on the current date.
                        acc.earliest = acc.earliest ? (currDate < acc.earliest ? currDate : acc.earliest) : currDate;
                        acc.latest = acc.latest ? (currDate > acc.latest ? currDate : acc.latest) : currDate;

                        return acc;
                    }, {earliest: null, latest: null, previousDate: null, currentGroup: [], results: []});

                    // If the last group has more than one date, add its earliest and latest dates to the results object.
                    if (dates.currentGroup.length > 1) {
                        const earliestDate = dates.currentGroup[0];
                        const latestDate = dates.currentGroup[dates.currentGroup.length - 1];
                        dates.results.push({earliestDate, latestDate});
                    }
                    console.log(dates)
                    const new_start = new Date(dates.earliest)
                    const new_end = new Date(dates.latest)
                    new_start.setHours(0)
                    //new_end.setHours(0)
                    test_events[t] = {tour: tour, students: students, start: new_start, end: new_end}
                    console.log(test_events[t])
                }
                console.log(test_events)
                onEventsAdd(test_events);
            },
            (err) => {
                console.error(err);
            }
        );

    }

    function groupByKey(array: any[], key: string) {
        return array.reduce((result, currentValue) => {
            const groupKey = currentValue[key];
            (result[groupKey] = result[groupKey] || []).push(currentValue);
            return result;
        }, {});
    }


    const onEventSelection = (e: Event) => {
        console.log(e)
        setSelectedEvent(e);
        setPopupIsOpenEdit(true);
    };

    const onEventEdit = ({tour, student}
                             : { tour: Tour, student: User }) => {
        setEvents(currentEvents => {
            return currentEvents.map(currentEvent => {
                if (currentEvent === selectedEvent) {
                    return {
                        ...currentEvent,
                        tour: tour,
                        student: student
                    };
                }
                return currentEvent;
            });
        });
    }

    const onEventAdd = ({
                            tour,
                            student,
                            start,
                            end,
                        }: { tour: Tour, student: User, start: Date, end: Date }) => {
        setEvents(currentEvents => {
            const newEvent: MyEvent = {
                tour: tour,
                students: [student],
                start: start,
                end: end
            };
            return [...currentEvents, newEvent];
        });
    }

    const onEventsAdd = (eventData: MyEvent[]
    ) => {
        setEvents(currentEvents => {
            const newEvents = eventData.map(event => ({
                tour: event.tour,
                students: event.students,
                start: event.start,
                end: event.end,
            }));
            return [...currentEvents, ...newEvents];
        });
    }


    const onEventResize: withDragAndDropProps['onEventResize'] = data => {
        const {event, start, end} = data;
        setEvents(currentEvents => {
            return currentEvents.map(currentEvent => {
                if (currentEvent === event) {
                    return {
                        ...currentEvent,
                        start: new Date(start),
                        end: new Date(end),
                    };
                }
                return currentEvent;
            });
        });
    };

    const onEventDelete = ({event}: { event: MyEvent }) => {
        setEvents(currentEvents => {
            return currentEvents.filter(currentEvent => {
                return currentEvent !== event;
            });
        });
    }

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
            for (let d in dates) {
                postStudentOnTour(events[e].tour.id, events[e].students[0].id, formatDate(dates[d])).then(
                    (_) => {
                        //TODO
                        console.log("success")
                    },
                    (err) => {
                        const e = handleError(err);
                        //setErrorMessages(e); // TODO add error message to page
                    }
                );
            }
        }
    };


    return (
        <>
            <button className="btn btn-primary mb-3" onClick={() => setPopupIsOpenAdd(true)}>Voeg ronde toe</button>
            <button className="btn btn-primary mb-3" onClick={() => setPopupIsOpenLoad(true)}>Kies vorige planning
            </button>
            <button className="btn btn-primary mb-3" onClick={handleScheduleSave}>Sla planning op</button>
            <DnDCalendar
                messages={messages}
                culture={'nl-BE'}
                defaultView='week'
                events={events}
                components={{event: CustomDisplay}}
                localizer={localizer}
                selectable
                onSelectEvent={onEventSelection}
                style={{height: '100vh'}}
                step={60}
                timeslots={1}
                onEventDrop={onEventResize}
                onEventResize={onEventResize}
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
            <LoadEventsModal
                isOpen={popupIsOpenLoad}
                onClose={() => setPopupIsOpenLoad(false)}
                onSave={onEventsLoad}
            />
        </>
    );

}

const locales = {
    'nl-BE': nlBE,
}

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