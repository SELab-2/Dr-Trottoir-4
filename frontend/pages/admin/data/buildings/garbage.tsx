import React, {useEffect, useState} from "react";
import {
    GarbageCollectionInterface,
    garbageTypes,
    getGarbageCollectionFromBuilding,
    getGarbageColor
} from "@/lib/garbage-collection";
import {Calendar, dateFnsLocalizer} from "react-big-calendar";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import nlBE from "date-fns/locale/nl-BE";
import {messages} from "@/locales/localizerCalendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import AdminHeader from "@/components/header/adminHeader";
import {addDays, endOfWeek} from "date-fns";
import {useRouter} from "next/router";
import {BuildingInterface, getAddress, getBuildingInfo} from "@/lib/building";

interface ParsedUrlQuery {}

interface DataBuildingQuery extends ParsedUrlQuery {
    buildingId?: number;
}

export default function GarbageCollectionSchedule() {
    const router = useRouter();
    const [garbageCollection, setGarbageCollection] = useState<GarbageCollectionInterface[]>([]);
    const [building, setBuilding] = useState<BuildingInterface | null>(null);

    useEffect(() => {
        const query: DataBuildingQuery = router.query as DataBuildingQuery;
        if (! query.buildingId) {
            return;
        }
        getBuilding(query.buildingId);
    }, [router.isReady]);

    useEffect(() => {
        if (! building) {
            return;
        }
        getFromRange({start : startOfWeek(new Date(), { weekStartsOn: 1 }), end : endOfWeek(new Date(), { weekStartsOn: 1 })});
    }, [building]);

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

    function getBuilding(id : number) {
        getBuildingInfo(id).then(res => {
            const b : BuildingInterface = res.data;
            setBuilding(b);
        }, console.error);
    }

    function getFromRange(range: (Date[] | {start: Date, end: Date})) {
        if (! building) {
            setGarbageCollection([]);
            return;
        }
        let startDate : Date = Array.isArray(range) ? range[0] : range.start;
        let endDate : Date | null = Array.isArray(range) ? range[range.length - 1] : range.end;
        getGarbageCollectionFromBuilding(building?.id,
            {startDate, endDate}
        ).then(res => {
            const g: GarbageCollectionInterface[] = res.data;
            setGarbageCollection(g);
        }, console.error);
    }

    return (
        <>
            <AdminHeader/>
            {
                building && (
                    <h3 className="m-2">{getAddress(building)}</h3>
                )
            }
            <Calendar
                messages={messages}
                culture={"nl-BE"}
                defaultView="month"
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

