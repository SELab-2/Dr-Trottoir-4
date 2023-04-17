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

interface MyEvent extends Event {
    tour: Tour
    student: User
    start: Date
    end: Date
    start_time: string
    end_time: string
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


    const onEventsLoad = ({start_date, end_date} : {start_date : Date, end_date : Date}) => {
        console.log(start_date)
        console.log(end_date)
        console.log("Load events")
        getALlStudentOnTourFromDate({startDate : new Date(start_date), endDate : new Date(end_date)}).then(
            (res) => {
                console.log(res.data)
            },
            (err) => {
                console.error(err);
            }
        );

    }

    const onEventSelection = (e: Event) => {
        setSelectedEvent(e);
        setPopupIsOpenEdit(true);
    };

    const onEventEdit = ({tour, student, start_time, end_time}
                             : { tour: Tour, student: User, start_time: string, end_time: string }) => {
        setEvents(currentEvents => {
            return currentEvents.map(currentEvent => {
                if (currentEvent === selectedEvent) {
                    return {
                        ...currentEvent,
                        tour: tour,
                        student: student,
                        start_time: start_time,
                        end_time: end_time
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
                            start_time,
                            end_time
                        }: { tour: Tour, student: User, start: Date, end: Date, start_time: string, end_time: string }) => {
        setEvents(currentEvents => {
            const newEvent: MyEvent = {
                tour: tour,
                student: student,
                start: start,
                end: end,
                start_time: start_time,
                end_time: end_time,
            };
            return [...currentEvents, newEvent];
        });

    }

    const onEventsAdd = (eventData: {
        tour: Tour,
        data: {
            student: User,
            start: Date,
            end: Date
        }[],
        start_time: string,
        end_time: string
    }) => {
        setEvents(currentEvents => {
            const newEvents = eventData.data.map(event => ({
                tour: eventData.tour,
                student: event.student,
                start: event.start,
                end: event.end,
                start_time: eventData.start_time,
                end_time: eventData.end_time,
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
        console.log(events);
        for (let e in events) {
            const dates = getDaysArray(events[e].start, events[e].end);
            for (let d in dates) {
                console.log(events[e].tour.id, events[e].student.id, formatDate(dates[d]));
                postStudentOnTour(events[e].tour.id, events[e].student.id, formatDate(dates[d])).then(
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
        console.log(events);
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
                defaultDate={new Date(2023, 3, 6)}
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