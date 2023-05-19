import React, { useEffect, useRef, useState } from "react";
import {
    duplicateGarbageCollectionSchedule,
    GarbageCollectionInterface,
    garbageTypes,
    getAllGarbageCollectionChanges,
    getGarbageCollectionFromBuilding,
    getGarbageColor,
} from "@/lib/garbage-collection";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import nlBE from "date-fns/locale/nl-BE";
import { messages } from "@/locales/localizerCalendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import AdminHeader from "@/components/header/adminHeader";
import { add, addDays, endOfMonth, startOfMonth, sub } from "date-fns";
import { useRouter } from "next/router";
import { BuildingInterface, getAllBuildings } from "@/lib/building";
import GarbageEditModal from "@/components/garbage/GarbageEditModal";
import { Col, Row } from "react-bootstrap";
import DuplicateScheduleModal from "@/components/calendar/duplicateScheduleModal";
import SelectedBuildingList from "@/components/garbage/SelectedBuildingList";
import { GarbageCollectionEvent, GarbageCollectionWebSocketInterface } from "@/types";
import GarbageCollectionEventComponentWithAddress from "@/components/garbage/GarbageCollectionEventComponentWithAddress";
import { getBuildingsOfTour } from "@/lib/tour";
import { withAuthorisation } from "@/components/withAuthorisation";
import BuildingAutocomplete from "@/components/autocompleteComponents/buildingAutocomplete";
import TourAutocomplete from "@/components/autocompleteComponents/tourAutocomplete";
import ErrorMessageAlert from "@/components/errorMessageAlert";
import BulkMoveGarbageModal from "@/components/garbage/BulkMoveGarbageModal";
import { AxiosResponse } from "axios";
import { formatDate } from "@/lib/date";
import { handleError } from "@/lib/error";

interface ParsedUrlQuery {}

interface DataBuildingQuery extends ParsedUrlQuery {
    building?: number;
    tour?: number;
    region?: number;
}

function GarbageCollectionSchedule() {
    const router = useRouter();
    const [garbageCollection, setGarbageCollection] = useState<GarbageCollectionInterface[]>([]);
    const [allBuildings, setAllBuildings] = useState<BuildingInterface[]>([]);
    const [tourList, setTourList] = useState<{ [tourId: number]: BuildingInterface[] }>({});
    // Keeps track of the currently displayed range, initialize it to the current month + some extra days
    const [currentRange, setCurrentRange] = useState<{ start: Date; end: Date }>({
        start: sub(startOfMonth(new Date()), { days: 7 }),
        end: add(endOfMonth(new Date()), { days: 7 }),
    });
    const [searchedBuilding, setSearchedBuilding] = useState<number>(0);
    const [searchedTour, setSearchedTour] = useState<number>(0);

    // Info for the edit modal
    const [showEditModal, setShowEditModal] = useState<boolean>(false);
    const [selectedEvent, setSelectedEvent] = useState<GarbageCollectionEvent | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    // The duplicate modal
    const [showDuplicateModal, setShowDuplicateModal] = useState<boolean>(false);

    // The building list modal
    const [showBuildingListModal, setShowBuildingListModal] = useState<boolean>(false);

    // The bulk operation modal
    const [showBulkMoveModal, setShowBulkMoveModal] = useState<boolean>(false);

    const [buildingList, setBuildingList] = useState<BuildingInterface[]>([]);
    const [errorMessages, setErrorMessages] = useState<string[]>([]);

    const garbageCollectionRef = useRef(garbageCollection);
    const buildingListRef = useRef(buildingList);
    const rangeRef = useRef(currentRange);

    useEffect(() => {
        garbageCollectionRef.current = garbageCollection;
    }, [garbageCollection]);

    useEffect(() => {
        buildingListRef.current = buildingList;
    }, [buildingList]);

    useEffect(() => {
        const query: DataBuildingQuery = router.query as DataBuildingQuery;
        // Get all the buildings
        getAllBuildings().then(
            (res) => {
                const d: BuildingInterface[] = res.data;
                setAllBuildings(d);
                // If a query is passed, set add building to list
                if (query.building) {
                    const matchingBuilding: BuildingInterface | undefined = d.find(
                        (b) => b.id === Number(query.building)
                    );
                    if (!matchingBuilding) {
                        return;
                    }
                    addBuildingsToList([matchingBuilding]);
                    return;
                }
                if (query.tour) {
                    addBuildingsOfTourToList(query.tour);
                }
                if (query.region) {
                    addBuildingsOfRegion(d, query.region);
                }
            },
            (err) => setErrorMessages(handleError(err))
        );
    }, [router.isReady]);

    useEffect(() => {
        setUpWebsocket();
    }, [allBuildings]);

    function setUpWebsocket() {
        getAllGarbageCollectionChanges().addEventListener("message", (event) => {
            const data: GarbageCollectionWebSocketInterface = JSON.parse(event.data);
            const g: GarbageCollectionInterface = data.garbage_collection;
            if (rangeRef.current.start <= new Date(g.date) && new Date(g.date) <= rangeRef.current.end) {
                if (!buildingListRef.current.some((b) => b.id === g.building)) {
                    return;
                }
                if (data.type === "deleted") {
                    onDelete(g.id);
                } else {
                    const obj: GarbageCollectionInterface | undefined = garbageCollectionRef.current.find(
                        (col) => col.id === Number(g.id)
                    );
                    if (obj) {
                        onPatch({ ...g, date: formatDate(new Date(g.date)) });
                    } else {
                        onPost([{ ...g, date: formatDate(new Date(g.date)) }]);
                    }
                }
            }
        });
    }

    // Add the searched building to the list
    useEffect(() => {
        if (searchedBuilding > 0 && allBuildings.length > 0) {
            const building: BuildingInterface | undefined = allBuildings.find((b) => searchedBuilding === b.id);
            if (building) {
                addBuildingsToList([building]);
            }
        }
    }, [searchedBuilding]);

    // Add the buildings of a searched tour to the list
    useEffect(() => {
        if (searchedTour > 0) {
            addBuildingsOfTourToList(searchedTour);
        }
    }, [searchedTour]);

    // Adds the garbage schedule for all the buildings in a region
    function addBuildingsOfRegion(buildings: BuildingInterface[], regionId: number) {
        const buildingsInRegion: BuildingInterface[] = buildings.filter((b) => +b.region === +regionId);
        setBuildingList((prevState) => {
            return [...prevState, ...buildingsInRegion];
        });
        Promise.all(
            buildingsInRegion.map((b) =>
                getGarbageCollectionFromBuilding(b.id, {
                    startDate: currentRange.start,
                    endDate: currentRange.end,
                })
            )
        ).then(
            (res) => {
                const g: any[] = res;
                const data = g.map((el) => el.data).flat();
                setGarbageCollection((prevState) => {
                    return [...prevState, ...data];
                });
            },
            (err) => setErrorMessages(handleError(err))
        );
    }

    // Adds the garbage schedule for all the buildings of a given tour
    function addBuildingsOfTourToList(tourId: number) {
        getBuildingsOfTour(tourId).then(
            (res) => {
                const buildings: BuildingInterface[] = res.data;
                setTourList((prevState) => {
                    const newState = { ...prevState };
                    newState[tourId] = buildings;
                    return newState;
                });
                addBuildingsToList(buildings);
            },
            (err) => setErrorMessages(handleError(err))
        );
    }

    function addBuildingsToList(buildings: BuildingInterface[]) {
        // Get the buildings of the tour that are not already in the list
        const filteredBuildings: BuildingInterface[] = buildings.filter(
            (b) => buildingList.findIndex((bl) => bl.id === b.id) === -1
        );
        setBuildingList((prevState) => {
            return [...prevState, ...filteredBuildings];
        });
        // Get the garbage collection for all the buildings
        Promise.all(
            filteredBuildings.map((b) =>
                getGarbageCollectionFromBuilding(b.id, {
                    startDate: currentRange.start,
                    endDate: currentRange.end,
                })
            )
        ).then(
            (res) => {
                const g: any[] = res;
                const data = g.map((el) => el.data).flat();
                setGarbageCollection((prevState) => {
                    return [...prevState, ...data];
                });
            },
            (err) => setErrorMessages(handleError(err))
        );
    }

    // Remove a building from the schedule
    function removeBuildingFromList(building: BuildingInterface) {
        const i = buildingList.findIndex((b) => b.id === building.id);
        if (i < 0) {
            return;
        }
        setBuildingList((prevState) => {
            const i = prevState.findIndex((b) => b.id === building.id);
            const newState = [...prevState];
            newState.splice(i, 1);
            return newState;
        });
        setGarbageCollection((prevState) => {
            return prevState.filter((g) => g.building != building.id);
        });
        // Check if a building was in a tour
        setTourList((prevState) => {
            const newState: { [p: number]: BuildingInterface[] } = { ...prevState };
            const entries = Object.entries(newState);
            for (const [tourId, buildings] of entries) {
                if (buildings.some((b) => b.id === building.id)) {
                    delete newState[+tourId];
                }
            }
            return newState;
        });
    }

    // Remove a tour from the garbage collection
    function removeTourBuildings(tourId: number) {
        // Check if a building was in a tour
        setTourList((prevState) => {
            const newState: { [p: number]: BuildingInterface[] } = { ...prevState };
            delete newState[tourId];
            return newState;
        });
        getBuildingsOfTour(tourId).then(
            (res) => {
                const tourBuildings: BuildingInterface[] = res.data;

                setBuildingList((prevState) => {
                    const newState: BuildingInterface[] = [...prevState];
                    return newState.filter((b) => !tourBuildings.some((tb) => tb.id === b.id));
                });

                setGarbageCollection((prevState) => {
                    const newState: GarbageCollectionInterface[] = [...prevState];
                    return newState.filter((g) => !tourBuildings.some((b) => g.building === b.id));
                });
            },
            (err) => setErrorMessages(handleError(err))
        );
    }

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
        setCurrentRange({ start: startDate, end: endDate });

        // Retrieve the schedule
        Promise.all(buildingList.map((b) => getGarbageCollectionFromBuilding(b.id, { startDate, endDate }))).then(
            (res) => {
                const g: any[] = res;
                const data = g.map((el) => el.data).flat();
                setGarbageCollection(data);
            },
            (err) => setErrorMessages(handleError(err))
        );
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
    function onPost(g: GarbageCollectionInterface[]) {
        setGarbageCollection((prevState) => {
            return [...prevState, ...g.filter((col) => !prevState.some((gar) => gar.id === col.id))];
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

    async function duplicateSchedule(
        startDate: string,
        endDate: string,
        copyToDate: string
    ): Promise<AxiosResponse<any, any>> {
        return await duplicateGarbageCollectionSchedule(
            startDate,
            endDate,
            copyToDate,
            buildingList.map((b) => b.id)
        );
    }

    // Closes the duplicate modal
    function closeDuplicateModal() {
        setShowDuplicateModal(false);
        getFromRange(currentRange);
    }

    function closeBulkOperationModal() {
        setShowBulkMoveModal(false);
        getFromRange(currentRange);
    }

    function removeAllBuildings() {
        setGarbageCollection([]);
        setBuildingList([]);
        setTourList({});
    }

    const loc = dateFnsLocalizer({
        format,
        parse,
        startOfWeek: () => {
            return startOfWeek(new Date(), { weekStartsOn: 1 }); // A week starts on monday
        },
        getDay,
        locales: {
            "nl-BE": nlBE,
        },
    });

    // @ts-ignore
    return (
        <div className="tablepageContainer">
            <AdminHeader />
            <div className="tableContainer">
                <ErrorMessageAlert setErrorMessages={setErrorMessages} errorMessages={errorMessages} />
                <DuplicateScheduleModal
                    closeModal={closeDuplicateModal}
                    show={showDuplicateModal}
                    onSubmit={duplicateSchedule}
                    weekStartsOn={1}
                    title="Dupliceer vuilophaling schema voor geselecteerde gebouwen"
                />
                <BulkMoveGarbageModal
                    buildings={buildingList}
                    closeModal={closeBulkOperationModal}
                    show={showBulkMoveModal}
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
                <SelectedBuildingList
                    buildings={buildingList}
                    closeModal={() => setShowBuildingListModal(false)}
                    show={showBuildingListModal}
                    removeBuilding={removeBuildingFromList}
                    removeTour={removeTourBuildings}
                    selectedTours={tourList}
                    removeAllBuildings={removeAllBuildings}
                />
                <div>
                    <Row style={{ display: "flex", alignItems: "center", padding: "10px" }}>
                        <Col md={6} style={{ display: "flex", alignItems: "center" }}>
                            <div className="padding" style={{ display: "flex", alignItems: "center" }}>
                                <button
                                    className="button"
                                    style={{ marginRight: "10px" }}
                                    onClick={() => setShowDuplicateModal(true)}
                                >
                                    Dupliceer planning
                                </button>
                                <button
                                    className="button"
                                    style={{ marginRight: "10px" }}
                                    onClick={() => setShowBulkMoveModal(true)}
                                >
                                    Verplaats ophaling
                                </button>
                                <button
                                    className="button"
                                    style={{ marginRight: "10px" }}
                                    onClick={() => setShowBuildingListModal(true)}
                                >
                                    {buildingList.length > 0
                                        ? `${buildingList.length} geselecteerde gebouwen`
                                        : "Geen gebouwen geselecteerd"}
                                </button>
                            </div>
                        </Col>
                        <Col md={6} style={{ alignItems: "center" }}>
                            <Row>
                                <Col md={5}>
                                    <div style={{ display: "flex" }}>
                                        <BuildingAutocomplete
                                            initialId={0}
                                            setObjectId={setSearchedBuilding}
                                            required={false}
                                        />
                                    </div>
                                </Col>
                                <Col md={5}>
                                    <div>
                                        <TourAutocomplete initialId={0} setObjectId={setSearchedTour} />
                                    </div>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                </div>
                <Calendar
                    messages={messages}
                    culture={"nl-BE"}
                    defaultView="month"
                    views={["month", "week"]}
                    events={garbageCollection.map((g) => {
                        const s: Date = new Date(g.date);
                        let e = addDays(s, 1);
                        s.setHours(0);
                        e.setHours(0);
                        const b = allBuildings.find((b) => b.id === g.building)!;
                        const event: GarbageCollectionEvent = {
                            start: s,
                            end: e,
                            garbageType: garbageTypes[g.garbage_type],
                            id: g.id,
                            building: b,
                        };
                        return event;
                    })}
                    components={{
                        //@ts-ignore
                        event: GarbageCollectionEventComponentWithAddress,
                    }}
                    localizer={loc}
                    eventPropGetter={(e) => {
                        const event: GarbageCollectionEvent = e as GarbageCollectionEvent;
                        const backgroundColor = getGarbageColor(event.garbageType);
                        return { style: { backgroundColor, color: "black" } };
                    }}
                    drilldownView="week"
                    selectable
                    onSelectSlot={(slotInfo) => {
                        if (buildingList.length <= 0) {
                            return;
                        }
                        setSelectedDate(slotInfo.start);
                        setShowEditModal(true);
                    }}
                    onSelectEvent={(e) => {
                        const event: GarbageCollectionEvent = e as GarbageCollectionEvent;
                        if (buildingList.length <= 0) {
                            return;
                        }
                        const building = buildingList.find((b) => b.id === event.building.id);
                        if (!building) {
                            return;
                        }
                        setSelectedEvent(event);
                        setShowEditModal(true);
                    }}
                    onRangeChange={getFromRange}
                    style={{ height: "100vh" }}
                    step={60}
                    timeslots={1}
                />
            </div>
        </div>
    );
}

export default withAuthorisation(GarbageCollectionSchedule, ["Admin", "Superstudent"]);
