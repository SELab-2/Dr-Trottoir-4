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

    const [events, setEvents] = useState<Event[]>([
        {
            title: 'Verjaardag',
            start: new Date(2023, 3, 6, 12, 0),
            end: new Date(2023, 3, 6, 13, 0),
        },
        {
            title: 'Vergadering',
            start: new Date(2023, 3, 8, 9, 0),
            end: new Date(2023, 3, 8, 11, 0),
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

    const handleEventSave = (title : string) => {
        setEvents(currentEvents => {
            return currentEvents.map(currentEvent => {
                if (currentEvent === selectedEvent) {
                    return {
                        ...currentEvent,
                        title: title
                    };
                }
                return currentEvent;
            });
        });
    }


    /*const onEventCreate: withDragAndDropProps['onSelectSlot'] = (data: any) => {
        const title = prompt('Enter event title')
        if (title) { // If the user entered a title
            const newEvent: Event = {
                title,
                start: data.start,
                end: data.end,
            }
            setEvents(currentEvents => [...currentEvents, newEvent])
        }
    }*/


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
                localizer={localizer}
                onEventDrop={onEventChange}
                onEventResize={onEventChange}
                selectable
                //onSelectSlot={onEventCreate}
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