import React, {FC, useState} from 'react'
import {Calendar, dateFnsLocalizer, Event} from 'react-big-calendar'
import withDragAndDrop, {withDragAndDropProps} from 'react-big-calendar/lib/addons/dragAndDrop'
import format from 'date-fns/format'
import parse from 'date-fns/parse'
import startOfWeek from 'date-fns/startOfWeek'
import getDay from 'date-fns/getDay'
import nlBE from 'date-fns/locale/nl-BE'

import 'react-big-calendar/lib/addons/dragAndDrop/styles.css'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import EditEventModal from "@/components/calendar/editEvent";
import CustomDisplay from "@/components/calendar/customEvent";
import AddEventModal from "@/components/calendar/addEvent";

const messages = {
    allDay: 'Hele dag',
    previous: 'Vorige',
    next: 'Volgende',
    today: 'Vandaag',
    month: 'Maand',
    week: 'Week',
    day: 'Dag',
    agenda: 'Agenda',
    date: 'Datum',
    time: 'Tijd',
    event: 'Evenement',
}

interface MyEvent extends Event {
    student: string
    start: Date
    end: Date
    start_time: string
    end_time: string
}


const MyCalendar: FC = () => {
    const [popupIsOpen, setPopupIsOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
    const [popupIsOpenAdd, setPopupIsOpenAdd] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [events, setEvents] = useState<MyEvent[]>([
        {
            title: 'Antwerpen',
            start: new Date(2023, 3, 6),
            end: new Date(2023, 3, 6),
            student: 'Test1',
            start_time: "17:00",
            end_time: "20:00",
        },
        {
            title: 'Antwerpen',
            start: new Date(2023, 3, 6),
            end: new Date(2023, 3, 6),
            student: 'Test2',
            start_time: "17:00",
            end_time: "20:00",
        },
        {
            title: 'Antwerpen',
            start: new Date(2023, 3, 6),
            end: new Date(2023, 3, 6),
            student: 'Test3',
            start_time: "17:00",
            end_time: "20:00",
        }
    ])


    const onEventSelection = (e: Event) => {
        console.log(e, "Event data");
        setSelectedEvent(e);
        setPopupIsOpen(true);
    };

    const handlePopupClose = () => {
        setSelectedEvent(null);
        setPopupIsOpen(false);
    };

    const handleEventSave = ({title, student, start_time, end_time}
                                 : { title: string, student: string, start_time: string, end_time: string }) => {
        setEvents(currentEvents => {
            return currentEvents.map(currentEvent => {
                if (currentEvent === selectedEvent) {
                    return {
                        ...currentEvent,
                        title: title,
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
                            title,
                            student,
                            start,
                            end,
                            start_time,
                            end_time
                        }: { title: string, student: string, start: Date, end: Date, start_time: string, end_time: string }) => {
        setEvents(currentEvents => {
            const newEvent: MyEvent = {
                title: title,
                student: student,
                start: start,
                end: end,
                start_time: start_time,
                end_time: end_time,
            };
            console.log(newEvent)
            return [...currentEvents, newEvent];
        });

    }


    const onEventChange: withDragAndDropProps['onEventResize'] = data => {
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


    const handleSubmit = () => {
        setPopupIsOpenAdd(true);
    };

    const handlePopupCloseAdd = () => {
        setPopupIsOpenAdd(false);
    };


    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };


    return (
        <div className="container-fluid">
            <div className="row">
                <div className={`col-md-2 ${sidebarOpen ? "" : "d-none"} bg-light sidebar`}>
                    <div className="sidebar-sticky">
                        <ul className="nav flex-column">
                            <li className="nav-item">
                                <button className="btn btn-primary btn-block mb-2">Button 1</button>
                            </li>
                            <li className="nav-item">
                                <button className="btn btn-primary btn-block mb-2">Button 2</button>
                            </li>
                            <li className="nav-item">
                                <button className="btn btn-primary btn-block mb-2">Button 3</button>
                            </li>
                        </ul>
                    </div>
                </div>
                <div className={`col-md-10 ${sidebarOpen ? "" : "col-md-12"}`}>
                    <button className="btn btn-primary mb-3" onClick={toggleSidebar}>
                        {sidebarOpen ? "Hide sidebar" : "Show sidebar"}
                    </button>
                    <button className="btn btn-primary mb-3" onClick={handleSubmit}>Voeg ronde toe</button>
                    <AddEventModal
                        isOpen={popupIsOpenAdd}
                        onClose={handlePopupCloseAdd}
                        onSave={onEventAdd}
                    />
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
                        onEventDrop={onEventChange}
                        onEventResize={onEventChange}
                        resizable
                        defaultDate={new Date(2023, 3, 6)}
                    />
                    {selectedEvent && (
                        <EditEventModal
                            event={selectedEvent}
                            isOpen={popupIsOpen}
                            onClose={handlePopupClose}
                            onSave={handleEventSave}
                        />
                    )}
                </div>
            </div>
        </div>
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
})


const DnDCalendar = withDragAndDrop(Calendar)

export default MyCalendar