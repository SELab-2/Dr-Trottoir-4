import {BuildingInterface, getAddress} from "@/lib/building";
import {GarbageCollectionInterface, garbageTypes, getGarbageColor} from "@/lib/garbage-collection";
import {BuildingComment} from "@/lib/building-comment";
import React from "react";
import {BuildingManual} from "@/lib/building-manual";

export default function BuildingInfoView(
    {
        building,
        currentIndex,
        amountOfBuildings,
        garbageCollections,
        manual,
        buildingComments
    }: {
        building: BuildingInterface | null,
        currentIndex: number,
        amountOfBuildings: number,
        garbageCollections: { [p: string]: GarbageCollectionInterface[] },
        manual: BuildingManual | null,
        buildingComments: BuildingComment[]
    }
) {

    return (
        <div className="list-group">
            <div className="list-group-item">
                <span className="font-weight-bold h5">{building ? getAddress(building) : ""}</span>
                <p>{building ? `Gebouw ${currentIndex + 1}/${amountOfBuildings}` : ""}</p>
            </div>
            <div className="list-group-item m-0 p-0" style={{display: "flex"}}>
                {
                    Object.keys(garbageCollections)
                        .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
                        .map((key, index) => {
                            const col = garbageCollections[key];
                            const isLast = index + 1 === Object.keys(garbageCollections).length
                            return (
                                <div key={key} style={{flex: 1, borderRight: isLast ? "none" : "1px solid #ccc"}}>
                                    <p className="text-center m-0 p-0"
                                       style={{borderBottom: "1px solid #ccc"}}>{new Date(key).toLocaleDateString("en-GB")}</p>
                                    {
                                        col.map((gar: GarbageCollectionInterface) => (
                                            <p key={gar.id} style={{
                                                backgroundColor: getGarbageColor(garbageTypes[gar.garbage_type]),
                                                color: "black"
                                            }} className="text-center m-0 p-0">
                                                {garbageTypes[gar.garbage_type]
                                                    ? garbageTypes[gar.garbage_type]
                                                    : gar.garbage_type}
                                            </p>
                                        ))
                                    }
                                </div>
                            );
                        })

                }
            </div>
            <div className="list-group-item">
                {
                    manual &&
                    <a href={manual.file} download style={{textDecoration: "underline", color: "royalblue"}}>
                        Handleiding van gebouw
                    </a>
                }
                {
                    buildingComments.length > 0 &&
                    <>
                        <p className="fw-bold mb-0">Opmerkingen bij dit gebouw:</p>
                        <ul className="mt-0">
                            {buildingComments.map((bc: BuildingComment) => (
                                <li key={bc.id}>
                                    {bc.comment}
                                </li>
                            ))}
                        </ul>
                    </>
                }
            </div>
        </div>
    );

}