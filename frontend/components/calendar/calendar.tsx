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

    const onEventResize: withDragAndDropProps['onEventResize'] = data => {
        const {start, end} = data

        setEvents(currentEvents => {
            const firstEvent = {
                start: new Date(start),
                end: new Date(end),
            }
            return [...currentEvents, firstEvent]
        })
    }

    const onEventDrop: withDragAndDropProps['onEventDrop'] = data => {
        console.log(data)
    }

    return (
        <DnDCalendar
            messages={messages}
            culture={'nl-BE'}
            defaultView='week'
            events={events}
            localizer={localizer}
            onEventDrop={onEventDrop}
            onEventResize={onEventResize}
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