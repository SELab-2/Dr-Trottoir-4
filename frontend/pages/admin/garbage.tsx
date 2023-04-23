import React, {useEffect, useState} from "react";
import {GarbageCollectionInterface, garbageTypes, getGarbageCollectionFromBuilding} from "@/lib/garbage-collection";
import {BuildingInterface} from "@/lib/building";
import {Calendar, dateFnsLocalizer, DateRange, View} from "react-big-calendar";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import nlBE from "date-fns/locale/nl-BE";
import {messages} from "@/locales/localizerCalendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import AdminHeader from "@/components/header/adminHeader";
import {addDays, addHours, endOfWeek} from "date-fns";

export default function GarbageCollectionSchedule() {

    const [garbageCollection, setGarbageCollection] = useState<GarbageCollectionInterface[]>([]);

    useEffect(() => {
        getFromRange({start : startOfWeek(new Date(), { weekStartsOn: 1 }), end : endOfWeek(new Date(), { weekStartsOn: 1 })});
    }, []);

    const locales = {
        "nl-BE": nlBE,
    };

    const loc = dateFnsLocalizer({
        format,
        parse,
        startOfWeek: () => {
            return startOfWeek(new Date(), { weekStartsOn: 1 });
        },
        getDay,
        locales,
    });

    function getFromRange(range: (Date[] | {start: Date, end: Date})) {
        let startDate : Date = Array.isArray(range) ? range[0] : range.start;
        let endDate : Date | null = Array.isArray(range) ? range[range.length - 1] : range.end;
        getGarbageCollectionFromBuilding(2,
            {startDate, endDate}
        ).then(res => {
            const g: GarbageCollectionInterface[] = res.data;
            setGarbageCollection(g);
        }, console.error);
    }

    function getGarbageColor(garbageType : string) {
        const garbageColors: Record<string, string> = {
            "GFT": "green",
            "Glas": "gainsboro",
            "Grof vuil": "sienna",
            "Kerstbomen": "seagreen",
            "Papier": "goldenrod",
            "PMD": "dodgerblue",
            "Restafval": "dimgrey",
        };
        return garbageColors[garbageType] ? garbageColors[garbageType] : "blue";
    }

    return (
        <>
            <AdminHeader/>
            <Calendar
                messages={messages}
                culture={"nl-BE"}
                defaultView="week"
                events={garbageCollection.map(g => {
                    const s : Date = new Date(g.date);
                    let e = addDays(s, 1);
                    s.setHours(0);
                    e.setHours(0);
                    return {
                        start : s,
                        end : e,
                        title : garbageTypes[g.garbage_type]
                    };
                })}
                localizer={loc}
                eventPropGetter={(event) => {
                    const backgroundColor = getGarbageColor(event.title);
                    return { style: { backgroundColor, color:"black" } }
                }}
                selectable
                onSelectEvent={() => console.log("hallo")}
                onRangeChange={getFromRange}
                views={['month', 'week']}
                style={{ height: "100vh" }}
                step={60}
                timeslots={1}
            />
        </>
    );
}

