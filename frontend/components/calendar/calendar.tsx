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

    const onEventChange: withDragAndDropProps['onEventResize'] = data => {
        const {event, start, end} = data;
        setEvents(currentEvents => {
            const updatedEvents = currentEvents.map(currentEvent => {
                if (currentEvent === event) { // or however you uniquely identify the event
                    return {
                        ...currentEvent,
                        start: new Date(start),
                        end: new Date(end),
                    };
                }
                return currentEvent;
            });
            return updatedEvents;
        });
    };


    return (
        <DnDCalendar
            messages={messages}
            culture={'nl-BE'}
            defaultView='week'
            events={events}
            localizer={localizer}
            onEventDrop={onEventChange}
            onEventResize={onEventChange}
            resizable
            style={{height: '100vh'}}
        />
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
//@ts-ignore
const DnDCalendar = withDragAndDrop(Calendar)

export default MyCalendar