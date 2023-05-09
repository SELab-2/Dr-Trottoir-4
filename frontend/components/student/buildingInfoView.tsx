import { BuildingInterface, getAddress } from "@/lib/building";
import {
    GarbageCollectionInterface,
    garbageTypes,
    getGarbageCollectionFromBuilding,
    getGarbageColor,
} from "@/lib/garbage-collection";
import { BuildingComment, getAllBuildingCommentsByBuildingID } from "@/lib/building-comment";
import React, { useEffect, useState } from "react";
import { BuildingManual, getManualPath, getManualsForBuilding } from "@/lib/building-manual";
import { addDays, subDays } from "date-fns";
import { ListGroup, ListGroupItem } from "react-bootstrap";

/**
 * The info that is displayed when a student is doing a tour
 */
export default function BuildingInfoView({
    building,
    currentIndex,
    amountOfBuildings,
}: {
    building: BuildingInterface | null;
    currentIndex: number;
    amountOfBuildings: number;
}) {
    const [garbageCollections, setGarbageCollections] = useState<{ [p: string]: GarbageCollectionInterface[] }>({});
    const [buildingComments, setBuildingComments] = useState<BuildingComment[]>([]);
    const [manual, setManual] = useState<BuildingManual | null>(null);

    useEffect(() => {
        if (!building) {
            return;
        }
        getGarbageCollection(building.id);
        getBuildingComments(building.id);
        getBuildingManual(building.id);
    }, [building]);

    // Get the garbage collection for a building for today
    function getGarbageCollection(buildingId: number) {
        const startDate = subDays(new Date(), 1);
        const endDate = addDays(new Date(), 1);
        getGarbageCollectionFromBuilding(buildingId, {
            startDate: startDate,
            endDate: endDate,
        })
            .then((res) => {
                const col: GarbageCollectionInterface[] = res.data;
                const grouped: { [p: string]: GarbageCollectionInterface[] } = {};
                grouped[startDate.toISOString().split("T")[0]] = [];
                grouped[new Date().toISOString().split("T")[0]] = [];
                grouped[endDate.toISOString().split("T")[0]] = [];

                col.forEach((g) => {
                    const dateString: string = new Date(g.date).toISOString().split("T")[0];
                    if (grouped[dateString]) {
                        grouped[dateString].push(g);
                    }
                });

                setGarbageCollections(grouped);
            })
            .catch((_) => {});
    }

    // Get the comments of a building
    function getBuildingComments(buildingId: number) {
        getAllBuildingCommentsByBuildingID(buildingId)
            .then((res) => {
                const bc: BuildingComment[] = res.data;
                setBuildingComments(bc);
            })
            .catch((_) => {});
    }

    // Get the manual for a building
    function getBuildingManual(buildingId: number) {
        getManualsForBuilding(buildingId)
            .then((res) => {
                const manuals: BuildingManual[] = res.data;
                if (manuals.length === 0) {
                    return;
                }
                const m: BuildingManual = manuals[0];
                m.file = getManualPath(m.file);
                setManual(m);
            })
            .catch((_) => {});
    }

    return (
        <ListGroup>
            <ListGroupItem>
                <span className="h4 fw-bold">{building ? getAddress(building) : ""}</span>
                <p className="mb-0">{building ? `Gebouw ${currentIndex + 1}/${amountOfBuildings}` : ""}</p>
            </ListGroupItem>
            <ListGroupItem className="m-0 p-0" style={{ display: "flex" }}>
                {Object.keys(garbageCollections)
                    .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
                    .map((key, index) => {
                        const col = garbageCollections[key];
                        const isLast = index + 1 === Object.keys(garbageCollections).length;
                        return (
                            <div key={key} style={{ flex: 1, borderRight: isLast ? "none" : "1px solid #ccc" }}>
                                <p className="text-center m-0 p-0" style={{ borderBottom: "1px solid #ccc" }}>
                                    {new Date(key).toLocaleDateString("en-GB")}
                                </p>
                                {col.length === 0 && (
                                    <p
                                        key={0}
                                        style={{
                                            color: "black",
                                        }}
                                        className="text-center m-0 p-0"
                                    >
                                        Geen ophaling
                                    </p>
                                )}
                                {col.map((gar: GarbageCollectionInterface) => (
                                    <p
                                        key={gar.id}
                                        style={{
                                            backgroundColor: getGarbageColor(garbageTypes[gar.garbage_type]),
                                            color: "black",
                                        }}
                                        className="text-center m-0 p-0"
                                    >
                                        {garbageTypes[gar.garbage_type]
                                            ? garbageTypes[gar.garbage_type]
                                            : gar.garbage_type}
                                    </p>
                                ))}
                            </div>
                        );
                    })}
            </ListGroupItem>
            <ListGroupItem>
                {manual && (
                    <a href={manual.file} download style={{ textDecoration: "underline", color: "royalblue" }}>
                        Handleiding van gebouw
                    </a>
                )}
                {buildingComments.length > 0 && (
                    <>
                        <p className="fw-bold mb-0">Opmerkingen van superstudent/admin:</p>
                        <ul className="mt-0 mb-0">
                            {buildingComments.map((bc: BuildingComment) => (
                                <li key={bc.id}>{bc.comment}</li>
                            ))}
                        </ul>
                    </>
                )}
            </ListGroupItem>
        </ListGroup>
    );
}
