import {Calendar, dateFnsLocalizer} from 'react-big-calendar'
import format from 'date-fns/format'
import parse from 'date-fns/parse'
import startOfWeek from 'date-fns/startOfWeek'
import getDay from 'date-fns/getDay'
import nlBE from 'date-fns/locale/nl-BE'
import "react-big-calendar/lib/css/react-big-calendar.css";

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

const MyCalendar = (props: any) => (
    <div>
        <Calendar
            culture={"nl-BE"}
            messages={messages}
            localizer={localizer}
            events={[
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
            ]}
            startAccessor="start"
            endAccessor="end"
            style={{height: 500}}
        />
    </div>
)
export default MyCalendar;