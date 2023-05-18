import FinishedBuildingModal from "@/components/student/finishedBuildingModal";
import {Button, ListGroup, ListGroupItem} from "react-bootstrap";
import {BuildingInterface, getAddress} from "@/lib/building";
import {datesEqual} from "@/lib/date";
import React, {useEffect, useState} from "react";
import {useRouter} from "next/router";
import {getStudentOnTour, startStudentOnTour, StudentOnTour, StudentOnTourStringDate} from "@/lib/student-on-tour";
import {getBuildingsOfTour, getTour, Tour} from "@/lib/tour";
import {getRegion, RegionInterface} from "@/lib/region";
import {handleError} from "@/lib/error";
import ErrorMessageAlert from "@/components/errorMessageAlert";

export default function PlannedBuildingList({
                                                studentOnTourId,
                                                redirectTo,
                                            }: {
    studentOnTourId: number | null;
    redirectTo: string;
}) {
    const router = useRouter();

    const [errorMessages, setErrorMessages] = useState<string[]>([]);

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
        getStudentOnTour(studentOnTourId)
            .then((res) => {
                const sots: StudentOnTourStringDate = res.data;

                // Get the tour info
                getTour(sots.tour)
                    .then((res) => {
                        const t: Tour = res.data;
                        setTour(t);

                        getRegion(t.region)
                            .then((res) => {
                                const r: RegionInterface = res.data;
                                setRegion(r.region);
                            })
                            .catch((err) => setErrorMessages(handleError(err)));
                    })
                    .catch((err) => setErrorMessages(handleError(err)));
                getBuildingsOfTour(sots.tour).then(
                    (res) => {
                        const buildings: BuildingInterface[] = res.data;
                        setBuildings(buildings);
                    },
                    (err) => setErrorMessages(handleError(err))
                );
                // Set the studentOnTour state
                setStudentOnTour({
                    id: sots.id,
                    student: sots.student,
                    tour: sots.tour,
                    date: new Date(sots.date),
                    max_building_index: sots.max_building_index,
                    current_building_index: sots.current_building_index,
                    started_tour: sots.started_tour,
                    completed_tour: sots.completed_tour,
                });
            })
            .catch((err) => setErrorMessages(handleError(err)));
    }, [studentOnTourId]);

    async function routeToFirstBuilding() {
        if (buildings.length === 0 || !studentOnTourId || !studentOnTour) {
            return;
        }
        if (!studentOnTour.started_tour) {
            startStudentOnTour(studentOnTourId)
                .then(async (_) => {
                    await router.push({
                        pathname: redirectTo,
                        query: {studentOnTourId: studentOnTour?.id},
                    });
                })
                .catch((err) => setErrorMessages(handleError(err)));
            return;
        } else {
            await router.push({
                pathname: redirectTo,
                query: {studentOnTourId: studentOnTour.id},
            });
        }
    }

    function getStartButtonText() {
        if (!studentOnTour) {
            return "";
        }
        if (studentOnTour.started_tour && !studentOnTour.completed_tour) {
            return "Doe verder met deze ronde";
        }
        return "Start deze ronde";
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
            <div>
                <ErrorMessageAlert setErrorMessages={setErrorMessages} errorMessages={errorMessages}/>
                <label style={{
                    fontWeight: 'bolder',
                    fontSize: '24px',
                    marginLeft: 10
                }}>{tour ? `Ronde ${tour?.name}` : ""}</label>
                <br/>
                <label style={{
                    fontWeight: 'bold',
                    fontSize: '20px',
                    marginLeft: 10
                }}>{region ? `Regio ${region}` : ""}</label>
                <br/>
                <label style={{
                    fontSize: '16px',
                    marginLeft: 10
                }}>{studentOnTour ? studentOnTour.date.toLocaleDateString("en-GB") : ""}</label>
                {buildings.length > 0 && (
                    <>
                        <p className="normal_text" style={{fontWeight: 'bold'}}>Gebouwen op deze ronde:</p>
                        <ListGroup>
                            {buildings.map((el: BuildingInterface, index: number) => {
                                return (
                                    <ListGroupItem
                                        as="a"
                                        action
                                        key={`${el.id}-${index}`}
                                        onClick={() => {
                                            if (studentOnTour && studentOnTour.completed_tour) {
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
                <div>
                    {(studentOnTour ? datesEqual(new Date(), studentOnTour.date) : false) &&
                    !studentOnTour?.completed_tour && (
                        <div className="padding"
                             style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                            <Button
                                className="wide_button"
                                onClick={() => routeToFirstBuilding().then()}
                            >
                                {getStartButtonText()}
                            </Button>
                        </div>

                    )}
                    {studentOnTour &&
                    !datesEqual(new Date(), studentOnTour.date) &&
                    new Date() < studentOnTour.date && (
                        <p>{`U kan deze ronde nog niet starten, kom terug op ${studentOnTour.date.toLocaleDateString(
                            "en-GB"
                        )}`}</p>
                    )}
                    {studentOnTour &&
                    ((!datesEqual(new Date(), studentOnTour.date) && new Date() > studentOnTour.date) ||
                        studentOnTour.completed_tour) && (
                        <p>{`U hebt deze ronde afgewerkt op ${studentOnTour.date.toLocaleDateString("en-GB")}.`}</p>
                    )}
                </div>
            </div>
        </>
    );
}
