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
import {addDays, endOfMonth, startOfMonth} from "date-fns";
import {useRouter} from "next/router";
import {BuildingInterface, getAddress, getAllBuildings} from "@/lib/building";
import GarbageEditModal from "@/components/garbage/GarbageEditModal";
import DuplicateGarbageCollectionModal from "@/components/garbage/duplicateGarbageCollectionModal";
import {Button} from "react-bootstrap";

interface ParsedUrlQuery {
}

interface DataBuildingQuery extends ParsedUrlQuery {
    building?: number;
}

export default function GarbageCollectionSchedule() {
    const router = useRouter();
    const [garbageCollection, setGarbageCollection] = useState<GarbageCollectionInterface[]>([]);
    const [allBuildings, setAllBuildings] = useState<BuildingInterface[]>([]);
    const [selectedBuilding, setSelectedBuilding] = useState<BuildingInterface | null>(null);
    const [currentRange, setCurrentRange] = useState<{ start: Date, end: Date }>({
        start: startOfMonth(new Date()),
        end: endOfMonth(new Date())
    });

    const [showEditModal, setShowEditModal] = useState<boolean>(false);
    const [selectedEvent, setSelectedEvent] = useState<{ start: Date, title: string, end: Date, id: number } | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    const [showDuplicateModal, setShowDuplicateModal] = useState<boolean>(false);

    useEffect(() => {
        const query: DataBuildingQuery = router.query as DataBuildingQuery;
        // Get all the buildings
        getAllBuildings().then(res => {
            const d: BuildingInterface[] = res.data;
            setAllBuildings(d);
            // If a query is passed, set the correct selectedBuilding
            if (!query.building) {
                return;
            }
            const matchingBuilding: BuildingInterface | undefined = d.find(b => b.id === Number(query.building));
            if (!matchingBuilding) {
                return;
            }
            setSelectedBuilding(matchingBuilding);
        }, console.error);
    }, [router.isReady]);

    useEffect(() => {
        if (!selectedBuilding) {
            return;
        }
        getFromRange(currentRange);
    }, [selectedBuilding]);

    const locales = {
        "nl-BE": nlBE,
    };

    const loc = dateFnsLocalizer({
        format,
        parse,
        startOfWeek: () => {
            return startOfWeek(new Date(), {weekStartsOn: 1});
        },
        getDay,
        locales,
    });

    function getFromRange(range: (Date[] | { start: Date, end: Date })) {
        if (!selectedBuilding) {
            setGarbageCollection([]);
            return;
        }
        let startDate: Date = Array.isArray(range) ? range[0] : range.start;
        let endDate: Date | null = Array.isArray(range) ? range[range.length - 1] : range.end;

        setCurrentRange({start: startDate, end: endDate});

        getGarbageCollectionFromBuilding(selectedBuilding.id,
            {startDate, endDate}
        ).then(res => {
            const g: GarbageCollectionInterface[] = res.data;
            setGarbageCollection(g);
        }, console.error);
    }

    function closeEditModal() {
        setShowEditModal(false);
        setSelectedEvent(null);
        setSelectedDate(null);
    }

    function onPatch(g: GarbageCollectionInterface) {
        setGarbageCollection(prevState => {
            const i = prevState.findIndex(gar => gar.id === g.id);
            const newState = [...prevState];
            if (i > -1) {
                newState[i] = g;
            }
            return newState;
        });
    }

    function onPost(g: GarbageCollectionInterface) {
        setGarbageCollection(prevState => {
            const newState = [...prevState];
            newState.push(g);
            return newState;
        });
    }

    function onDelete(garbageCollectionId: number) {
        setGarbageCollection(prevState => {
            const i = prevState.findIndex(gar => gar.id === garbageCollectionId);
            const newState = [...prevState];
            if (i > -1) {
                newState.splice(i, 1);
            }
            return newState;
        });
    }

    function closeDuplicateModal() {
        setShowDuplicateModal(false);
        getFromRange(currentRange);
    }

    return (
        <>
            <AdminHeader/>
            <DuplicateGarbageCollectionModal closeModal={closeDuplicateModal} show={showDuplicateModal} buildings={allBuildings}/>
            <GarbageEditModal closeModal={closeEditModal} onPatch={onPatch}
                              onPost={onPost} onDelete={onDelete} selectedEvent={selectedEvent}
                              show={showEditModal} clickedDate={selectedDate} building={selectedBuilding}/>
            <div className="container">
                <div className="row justify-content-start">
                    <div className="col-md-4">
                        <select className="form-select" value={selectedBuilding ? selectedBuilding.id : 0}
                                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                                    const building = allBuildings.find(b => b.id == parseInt(e.target.value));
                                    if (!building) {
                                        return;
                                    }
                                    setSelectedBuilding(building);
                                }}>
                            <option disabled value={0}></option>
                            {
                                allBuildings.map(b => (<option value={b.id} key={b.id}>{getAddress(b)}</option>))
                            }
                        </select>
                    </div>
                    <div className="col-md-4">
                        <Button variant="primary"
                                className="btn-dark" onClick={() => setShowDuplicateModal(true)}>Dupliceer
                            planning</Button>
                    </div>
                </div>
            </div>

            <Calendar
                messages={messages}
                culture={"nl-BE"}
                defaultView="month"
                events={garbageCollection.map(g => {
                    const s: Date = new Date(g.date);
                    let e = addDays(s, 1);
                    s.setHours(0);
                    e.setHours(0);
                    return {
                        start: s,
                        end: e,
                        title: garbageTypes[g.garbage_type],
                        id: g.id,
                        building: g.building
                    };
                })}
                localizer={loc}
                eventPropGetter={(event) => {
                    const backgroundColor = getGarbageColor(event.title);
                    return {style: {backgroundColor, color: "black"}}
                }}
                drilldownView={null}
                selectable
                onSelectSlot={(slotInfo) => {
                    if (!selectedBuilding) {
                        return;
                    }
                    setSelectedDate(slotInfo.start);
                    setShowEditModal(true);
                }}
                onSelectEvent={(event) => {
                    if (!selectedBuilding) {
                        return;
                    }
                    setSelectedEvent(event);
                    setShowEditModal(true);
                }}
                onRangeChange={getFromRange}
                views={['month', 'week']}
                style={{height: "100vh"}}
                step={60}
                timeslots={1}
            />
        </>
    );
}

