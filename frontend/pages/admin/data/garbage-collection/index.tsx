import React, {useEffect, useState} from "react";
import {
    GarbageCollectionInterface,
    garbageTypes,
    getGarbageCollectionFromBuilding,
    getGarbageColor,
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
import {add, addDays, endOfMonth, startOfMonth, sub} from "date-fns";
import {useRouter} from "next/router";
import {BuildingInterface, getAddress, getAllBuildings} from "@/lib/building";
import GarbageEditModal from "@/components/garbage/GarbageEditModal";
import DuplicateGarbageCollectionModal from "@/components/garbage/duplicateGarbageCollectionModal";
import {Button} from "react-bootstrap";
import SelectedBuildingList from "@/components/garbage/SelectedBuildingList";
import {GarbageCollectionEvent} from "@/types";
import GarbageCollectionEventComponentWithAddress
    from "@/components/garbage/GarbageCollectionEventComponentWithAddress";
import GarbageCollectionEventComponentWithoutAddress
    from "@/components/garbage/GarbageCollectionEventComponentWithoutAddress";
import {getBuildingsOfTour} from "@/lib/tour";
import {withAuthorisation} from "@/components/withAuthorisation";

interface ParsedUrlQuery {
}

interface DataBuildingQuery extends ParsedUrlQuery {
    building?: number;
    tour?: number
}

function GarbageCollectionSchedule() {
    const router = useRouter();
    const [garbageCollection, setGarbageCollection] = useState<GarbageCollectionInterface[]>([]);
    const [allBuildings, setAllBuildings] = useState<BuildingInterface[]>([]);
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
            // If a query is passed, set add building to list
            if (query.building) {
                const matchingBuilding: BuildingInterface | undefined = d.find((b) => b.id === Number(query.building));
                if (!matchingBuilding) {
                    return;
                }
                addBuildingToList(matchingBuilding);
                return;
            }
            if (query.tour) {
                getBuildingsOfTour(query.tour).then(res => {
                    const buildings: BuildingInterface[] = res.data;
                    setBuildingList(buildings);
                    Promise.all(buildings.map(b => getGarbageCollectionFromBuilding(b.id, {
                        startDate: currentRange.start,
                        endDate: currentRange.end
                    }))).then((res) => {
                        const g: any[] = res;
                        const data = g.map(el => el.data).flat();
                        setGarbageCollection(data);
                    }, console.error);
                }, console.error);
            }
        }, console.error);
    }, [router.isReady]);

    // Add a new building to the schedule
    function addBuildingToList(building: BuildingInterface) {
        const exists = buildingList.find(b => b.id === building.id);
        if (exists) {
            return;
        }
        setBuildingList(prevState => {
            const newList: BuildingInterface[] = [...prevState];
            newList.push(building);
            return newList;
        });
        getGarbageCollectionFromBuilding(building.id, {
            startDate: currentRange.start,
            endDate: currentRange.end
        }).then(res => {
            const g: GarbageCollectionInterface[] = res.data;
            setGarbageCollection(prevState => {
                return [...prevState, ...g];
            })
        }, console.error);
    }

    // Remove a building from the schedule
    function removeBuildingFromList(building: BuildingInterface) {
        const i = buildingList.findIndex((b) => b.id === building.id);
        if (i < 0) {
            return;
        }
        setBuildingList(prevState => {
            const i = prevState.findIndex((b) => b.id === building.id);
            const newState = [...prevState];
            newState.splice(i, 1);
            return newState;
        });
        setGarbageCollection(prevState => {
            return prevState.filter(g => g.building != building.id);

        });
    }

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
        if (buildingList.length <= 0) {
            setGarbageCollection([]);
            return;
        }
        // If the range is an array, get the first & last element of the array
        let startDate: Date = Array.isArray(range) ? range[0] : range.start;
        let endDate: Date = Array.isArray(range) ? range[range.length - 1] : range.end;

        // Set the new range
        setCurrentRange({start: startDate, end: endDate});

        // Retrieve the schedule
        Promise.all(buildingList.map(b => getGarbageCollectionFromBuilding(b.id, {startDate, endDate}))).then((res) => {
            const g: any[] = res;
            const data = g.map(el => el.data).flat();
            setGarbageCollection(data);
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
                buildings={buildingList}
            />
            <GarbageEditModal
                closeModal={closeEditModal}
                onPatch={onPatch}
                onPost={onPost}
                onDelete={onDelete}
                selectedEvent={selectedEvent}
                show={showEditModal}
                clickedDate={selectedDate}
                buildings={buildingList}
            />
            <SelectedBuildingList buildings={buildingList} closeModal={() => setShowBuildingListModal(false)}
                                  show={showBuildingListModal} removeBuilding={removeBuildingFromList}/>
            <div className="container">
                <div className="row justify-content-start">
                    <div className="col-md-4">
                        <select
                            className="form-select"
                            value={buildingList.length > 0 ? buildingList[buildingList.length - 1].id : 0}
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                                const building = allBuildings.find((b) => b.id == parseInt(e.target.value));
                                if (!building) {
                                    return;
                                }
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
                components={{event: buildingList.length > 1 ? GarbageCollectionEventComponentWithAddress : GarbageCollectionEventComponentWithoutAddress}}
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

export default withAuthorisation(GarbageCollectionSchedule, ["Admin", "Superstudent"]);
