import {FC, useState} from 'react'
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

const MyCalendar: FC = () => {

    interface MyEvent extends Event {
        student: string
    }

    const [events, setEvents] = useState<MyEvent[]>([
        {
            title: 'Antwerpen',
            start: new Date('2023-04-06T10:00:00'),
            end: new Date('2023-04-06T12:00:00'),
            student: 'Emma'
        },
        {
            title: 'Gent',
            start: new Date('2023-04-06T12:00:00'),
            end: new Date('2023-04-06T13:00:00'),
            student: 'Emma',
        },
    ])

    const [popupIsOpen, setPopupIsOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);


    const onEventSelection = (e: Event) => {
        console.log(e, "Event data");
        setSelectedEvent(e);
        setPopupIsOpen(true);
    };

    const handlePopupClose = () => {
        setSelectedEvent(null);
        setPopupIsOpen(false);
    };

    const handleEventSave = ({ title, student }: { title: string, student: string }) => {
        setEvents(currentEvents => {
            return currentEvents.map(currentEvent => {
                if (currentEvent === selectedEvent) {
                    return {
                        ...currentEvent,
                        title: title,
                        student: student
                    };
                }
                return currentEvent;
            });
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


    return (
        <div>
            <DnDCalendar
                messages={messages}
                culture={'nl-BE'}
                defaultView='week'
                events={events}
                components={{ event: CustomDisplay }}
                localizer={localizer}
                onEventDrop={onEventChange}
                onEventResize={onEventChange}
                selectable
                onSelectEvent={onEventSelection}
                resizable
                style={{height: '100vh'}}
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
    )
}

const locales = {
    'nl-BE': nlBE,
}

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
})

const DnDCalendar = withDragAndDrop(Calendar)

export default MyCalendar