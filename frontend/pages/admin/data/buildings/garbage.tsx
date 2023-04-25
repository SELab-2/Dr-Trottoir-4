import React, {useEffect, useState} from "react";
import {
    GarbageCollectionInterface,
    garbageTypes,
    getGarbageCollectionFromBuilding,
    getGarbageColor,
} from "@/lib/garbage-collection";
import {Calendar, dateFnsLocalizer, Event} from "react-big-calendar";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import nlBE from "date-fns/locale/nl-BE";
import {messages} from "@/locales/localizerCalendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import AdminHeader from "@/components/header/adminHeader";
import {add, addDays, endOfMonth, startOfMonth, sub} from "date-fns";
import {useRouter} from "next/router";
import {BuildingInterface, getAddress, getAllBuildings} from "@/lib/building";
import GarbageEditModal from "@/components/garbage/GarbageEditModal";
import DuplicateGarbageCollectionModal from "@/components/garbage/duplicateGarbageCollectionModal";
import {Button} from "react-bootstrap";
import SelectedBuildingList from "@/components/garbage/SelectedBuildingList";
import {GarbageCollectionEvent} from "@/types";
import CustomDisplay from "@/components/calendar/customEvent";
import GarbageCollectionEventComponent from "@/components/garbage/GarbageCollectionEventComponent";

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
    // Keeps track of the currently displayed range, initialize it to the current month + some extra days
    const [currentRange, setCurrentRange] = useState<{ start: Date; end: Date }>({
        start: sub(startOfMonth(new Date()), {days: 7}),
        end: add(endOfMonth(new Date()), {days: 7}),
    });

    // Info for the edit modal
    const [showEditModal, setShowEditModal] = useState<boolean>(false);
    const [selectedEvent, setSelectedEvent] = useState<GarbageCollectionEvent | null>(
        null
    );
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    // The duplicate modal
    const [showDuplicateModal, setShowDuplicateModal] = useState<boolean>(false);
    const [showBuildingListModal, setShowBuildingListModal] = useState<boolean>(false);

    const [buildingList, setBuildingList] = useState<BuildingInterface[]>([]);

    useEffect(() => {
        const query: DataBuildingQuery = router.query as DataBuildingQuery;
        // Get all the buildings
        getAllBuildings().then((res) => {
            const d: BuildingInterface[] = res.data;
            setAllBuildings(d);
            // If a query is passed, set the correct selectedBuilding
            if (!query.building) {
                return;
            }
            const matchingBuilding: BuildingInterface | undefined = d.find((b) => b.id === Number(query.building));
            if (!matchingBuilding) {
                return;
            }
            setSelectedBuilding(matchingBuilding);
        }, console.error);
    }, [router.isReady]);

    function addBuildingToList(building: BuildingInterface) {
        setBuildingList(prevState => {
            const exists = prevState.find(b => b.id === building.id);
            const newList: BuildingInterface[] = [...prevState];
            if (exists) {
                return newList;
            }
            newList.push(building);
            return newList;
        });
    }

    function removeBuildingFromList(building: BuildingInterface) {
        setBuildingList(prevState => {
            const i = prevState.findIndex((b) => b.id === building.id);
            const newState = [...prevState];
            if (i > -1) {
                newState.splice(i, 1);
            }
            return newState;
        });
    }

    // When a building is assigned, retrieve the schedule with the current range
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
            return startOfWeek(new Date(), {weekStartsOn: 1}); // A week starts on monday
        },
        getDay,
        locales,
    });

    // Get the garbage collection schedule from a date range
    function getFromRange(range: Date[] | { start: Date; end: Date }) {
        if (!selectedBuilding) {
            setGarbageCollection([]);
            return;
        }
        // If the range is an array, get the first & last element of the array
        let startDate: Date = Array.isArray(range) ? range[0] : range.start;
        let endDate: Date | null = Array.isArray(range) ? range[range.length - 1] : range.end;

        // Set the new range
        setCurrentRange({start: startDate, end: endDate});

        // Retrieve the schedule
        getGarbageCollectionFromBuilding(selectedBuilding.id, {startDate, endDate}).then((res) => {
            const g: GarbageCollectionInterface[] = res.data;
            setGarbageCollection(g);
        }, console.error);
    }

    // closes the edit modal
    function closeEditModal() {
        setShowEditModal(false);
        setSelectedEvent(null);
        setSelectedDate(null);
    }

    // After a successful patch of an event, change the collection list
    function onPatch(g: GarbageCollectionInterface) {
        setGarbageCollection((prevState) => {
            const i = prevState.findIndex((gar) => gar.id === g.id);
            const newState = [...prevState];
            if (i > -1) {
                newState[i] = g;
            }
            return newState;
        });
    }

    // After a successful post of an event, add it to the collections list
    function onPost(g: GarbageCollectionInterface) {
        setGarbageCollection((prevState) => {
            const newState = [...prevState];
            newState.push(g);
            return newState;
        });
    }

    // After a successful delete of an event, remove it from the collections list
    function onDelete(garbageCollectionId: number) {
        setGarbageCollection((prevState) => {
            const i = prevState.findIndex((gar) => gar.id === garbageCollectionId);
            const newState = [...prevState];
            if (i > -1) {
                newState.splice(i, 1);
            }
            return newState;
        });
    }

    // Closes the duplicate modal
    function closeDuplicateModal() {
        setShowDuplicateModal(false);
        getFromRange(currentRange);
    }

    return (
        <>
            <AdminHeader/>
            <DuplicateGarbageCollectionModal
                closeModal={closeDuplicateModal}
                show={showDuplicateModal}
                buildings={allBuildings}
            />
            <GarbageEditModal
                closeModal={closeEditModal}
                onPatch={onPatch}
                onPost={onPost}
                onDelete={onDelete}
                selectedEvent={selectedEvent}
                show={showEditModal}
                clickedDate={selectedDate}
                building={selectedBuilding}
            />
            <SelectedBuildingList buildings={buildingList} closeModal={() => setShowBuildingListModal(false)}
                                  show={showBuildingListModal} removeBuilding={removeBuildingFromList}/>
            <div className="container">
                <div className="row justify-content-start">
                    <div className="col-md-4">
                        <select
                            className="form-select"
                            value={selectedBuilding ? selectedBuilding.id : 0}
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                                const building = allBuildings.find((b) => b.id == parseInt(e.target.value));
                                if (!building) {
                                    return;
                                }
                                setSelectedBuilding(building);
                                addBuildingToList(building);
                            }}
                        >
                            <option disabled value={0}></option>
                            {allBuildings.map((b) => (
                                <option value={b.id} key={b.id}>
                                    {getAddress(b)}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="col-md-4">
                        <Button variant="primary" className="btn-dark" onClick={() => setShowDuplicateModal(true)}>
                            Dupliceer planning
                        </Button>
                    </div>
                    <div className="col-md-4">
                        <Button variant="primary" className="btn-dark" onClick={() => setShowBuildingListModal(true)}>
                            {buildingList.length > 0 ? `${buildingList.length} geselecteerde gebouwen` : "Geen gebouwen geselecteerd"}
                        </Button>
                    </div>
                </div>
            </div>

            <Calendar
                messages={messages}
                culture={"nl-BE"}
                defaultView="month"
                events={garbageCollection.map((g) => {
                    const s: Date = new Date(g.date);
                    let e = addDays(s, 1);
                    s.setHours(0);
                    e.setHours(0);
                    const b = allBuildings.find(b => b.id === g.building)!;
                    const event: GarbageCollectionEvent = {
                        start: s,
                        end: e,
                        garbageType: garbageTypes[g.garbage_type],
                        id: g.id,
                        building: b,
                    };
                    return event;
                })}
                components={{ event: GarbageCollectionEventComponent }}
                localizer={loc}
                eventPropGetter={(event) => {
                    const backgroundColor = getGarbageColor(event.garbageType);
                    return {style: {backgroundColor, color: "black"}};
                }}
                drilldownView={null}
                selectable
                onSelectSlot={(slotInfo) => {
                    if (buildingList.length <= 0) {
                        return;
                    }
                    setSelectedDate(slotInfo.start);
                    setShowEditModal(true);
                }}
                onSelectEvent={(event: GarbageCollectionEvent) => {
                    if (buildingList.length <= 0) {
                        return;
                    }
                    const building = buildingList.find(b => b.id === event.building.id);
                    if (!building) {
                        return;
                    }
                    setSelectedBuilding(building);
                    setSelectedEvent(event);
                    setShowEditModal(true);
                }}
                onRangeChange={getFromRange}
                views={["month", "week"]}
                style={{height: "100vh"}}
                step={60}
                timeslots={1}
            />
        </>
    );
}
