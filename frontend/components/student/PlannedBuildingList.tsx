import FinishedBuildingModal from "@/components/student/finishedBuildingModal";
import { Button, ListGroup, ListGroupItem } from "react-bootstrap";
import { BuildingInterface, getAddress } from "@/lib/building";
import { datesEqual } from "@/lib/date";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { getStudentOnTour, StudentOnTour, StudentOnTourStringDate } from "@/lib/student-on-tour";
import { getBuildingsOfTour, getTour, Tour } from "@/lib/tour";
import { getRegion, RegionInterface } from "@/lib/region";

export default function PlannedBuildingList({
    studentOnTourId,
    redirectTo,
}: {
    studentOnTourId: number | null;
    redirectTo: string;
}) {
    const router = useRouter();

    const [tour, setTour] = useState<Tour | null>(null);
    const [studentOnTour, setStudentOnTour] = useState<StudentOnTour | null>(null);
    const [region, setRegion] = useState<string>("");
    const [buildings, setBuildings] = useState<BuildingInterface[]>([]);
    const [showFinishedBuildingModal, setShowFinishedBuildingModal] = useState<boolean>(false);
    const [selectedBuilding, setSelectedBuilding] = useState<BuildingInterface | null>(null);

    useEffect(() => {
        if (!studentOnTourId) {
            return;
        }
        getStudentOnTour(studentOnTourId).then((res) => {
            const sots: StudentOnTourStringDate = res.data;

            // Get the tour info
            getTour(sots.tour).then((res) => {
                const t: Tour = res.data;
                setTour(t);

                getRegion(t.region).then((res) => {
                    const r: RegionInterface = res.data;
                    setRegion(r.region);
                }, console.error);
            }, console.error);
            getBuildingsOfTour(sots.tour).then(
                (res) => {
                    const buildings: BuildingInterface[] = res.data;
                    setBuildings(buildings);
                },
                (err) => {
                    console.error(err);
                }
            );
            // Set the studentOnTour state
            setStudentOnTour({
                id: sots.id,
                student: sots.student,
                tour: sots.tour,
                date: new Date(sots.date),
            });
        }, console.error);
    }, [studentOnTourId]);

    async function routeToFirstBuilding() {
        if (buildings.length === 0) {
            return;
        }
        await router.push({
            pathname: redirectTo,
            query: { studentOnTourId: studentOnTour?.id },
        });
    }

    return (
        <>
            <FinishedBuildingModal
                onHide={() => setShowFinishedBuildingModal(false)}
                show={showFinishedBuildingModal}
                building={selectedBuilding}
                setBuilding={setSelectedBuilding}
                studentOnTour={studentOnTour}
            />
            <div className="mt-3 mb-1 ms-2 me-2">
                <span className="h1 fw-bold">{tour ? `Ronde ${tour?.name}` : ""}</span>
                <p className="h5 fw-bold">{region ? `Regio ${region}` : ""}</p>
                <p className="h">{studentOnTour ? studentOnTour.date.toLocaleDateString("en-GB") : ""}</p>
                {buildings.length > 0 && (
                    <>
                        <p>Gebouwen op deze ronde:</p>
                        <ListGroup>
                            {buildings.map((el: BuildingInterface, index: number) => {
                                return (
                                    <ListGroupItem
                                        as="a"
                                        action
                                        key={`${el.id}-${index}`}
                                        onClick={() => {
                                            if (
                                                studentOnTour &&
                                                !datesEqual(new Date(), new Date(studentOnTour?.date)) &&
                                                new Date(studentOnTour?.date) < new Date()
                                            ) {
                                                setSelectedBuilding(el);
                                                setShowFinishedBuildingModal(true);
                                            }
                                        }}
                                    >
                                        <div className="d-flex w-100 justify-content-between">
                                            <h5 className="mb-1">{getAddress(el)}</h5>
                                            <small>{index + 1}</small>
                                        </div>
                                        <p className="mb-1">{el.name}</p>
                                    </ListGroupItem>
                                );
                            })}
                        </ListGroup>
                    </>
                )}
                <div className="mt-1">
                    {(studentOnTour ? datesEqual(new Date(), studentOnTour?.date) : false) && (
                        <Button variant="primary" className="btn-dark" onClick={() => routeToFirstBuilding().then()}>
                            Start deze ronde
                        </Button>
                    )}
                    {studentOnTour &&
                        !datesEqual(new Date(), studentOnTour.date) &&
                        new Date() < studentOnTour.date && (
                            <p>{`U kan deze ronde nog niet starten, kom terug op ${studentOnTour.date.toLocaleDateString(
                                "en-GB"
                            )}`}</p>
                        )}
                    {studentOnTour &&
                        !datesEqual(new Date(), studentOnTour.date) &&
                        new Date() > studentOnTour.date && (
                            <p>{`U hebt deze ronde afgewerkt op ${studentOnTour.date.toLocaleDateString("en-GB")}.`}</p>
                        )}
                </div>
            </div>
        </>
    );
}
