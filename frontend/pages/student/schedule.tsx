import StudentHeader from "@/components/header/studentHeader";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { getBuildingsOfTour, getTour, Tour } from "@/lib/tour";
import { datesEqual, getStudentOnTour, StudentOnTour, StudentOnTourStringDate } from "@/lib/student-on-tour";
import { getRegion, RegionInterface } from "@/lib/region";
import { BuildingInterface, getAddress } from "@/lib/building";
import { Button } from "react-bootstrap";
import { withAuthorisation } from "@/components/withAuthorisation";

interface ParsedUrlQuery {}

interface DataScheduleQuery extends ParsedUrlQuery {
    regionId?: number;
    studentOnTourId?: number;
}

function StudentSchedule() {
    const router = useRouter();
    const [tour, setTour] = useState<Tour | null>(null);
    const [studentOnTour, setStudentOnTour] = useState<StudentOnTour | null>(null);
    const [region, setRegion] = useState<string>("");
    const [buildings, setBuildings] = useState<BuildingInterface[]>([]);

    useEffect(() => {
        const query: DataScheduleQuery = router.query as DataScheduleQuery;
        if (query.studentOnTourId) {
            getStudentOnTour(query.studentOnTourId).then((res) => {
                const sots: StudentOnTourStringDate = res.data;

                // Get the tour info
                getTour(sots.tour).then((res) => {
                    const t: Tour = res.data;
                    setTour(t);
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
        }
        // Get the region of the tour
        if (query.regionId) {
            getRegion(query.regionId).then((res) => {
                const r: RegionInterface = res.data;
                setRegion(r.region);
            }, console.error);
        }
    }, [router.isReady]);

    async function routeToFirstBuilding() {
        if (buildings.length === 0) {
            return;
        }
        const firstBuilding: BuildingInterface = buildings[0];
        await router.push({
            pathname: `/student/building`,
            query: {buildingId: firstBuilding.id, studentOnTourId: studentOnTour?.id},
        }, "/student/building");
    }

    return (
        <>
            <StudentHeader />
            <div className="mt-3 mb-1 ms-2 me-2">
                <span className="h1 fw-bold">{tour ? `Ronde ${tour?.name}` : ""}</span>
                <p className="h5 fw-bold">{region ? `Regio ${region}` : ""}</p>
                <p className="h">{studentOnTour ? studentOnTour.date.toLocaleDateString("en-GB") : ""}</p>
                {buildings.length > 0 && (
                    <>
                        <p>Gebouwen op deze ronde:</p>
                        <div className="list-group">
                            {buildings.map((el: BuildingInterface, index: number) => {
                                return (
                                    <a className="list-group-item list-group-item-action" key={`${el.id}-${index}`}>
                                        <div className="d-flex w-100 justify-content-between">
                                            <h5 className="mb-1">{getAddress(el)}</h5>
                                            <small>{index + 1}</small>
                                        </div>
                                        <p className="mb-1">{el.name}</p>
                                    </a>
                                );
                            })}
                        </div>
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

export default withAuthorisation(StudentSchedule, ["Student"]);
