import AdminHeader from "@/components/header/adminHeader";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { getStudentOnTour, StudentOnTour } from "@/lib/student-on-tour";
import { getAnalysisStudentOnTour, getWorkedHours } from "@/lib/analysis";
import { BuildingAnalysis } from "@/types";
import { BuildingInterface, getAddress, getBuildingInfo } from "@/lib/building";
import { Col, Container, ListGroup, ListGroupItem, ProgressBar, Row } from "react-bootstrap";
import { Tooltip } from "@mui/material";
import { getFullName, getUserInfo, User } from "@/lib/user";
import { getTour, Tour } from "@/lib/tour";
import { getRegion, RegionInterface } from "@/lib/region";
import Link from "next/link";
import { formatDate } from "@/lib/date";
import { withAuthorisation } from "@/components/withAuthorisation";

interface StudentOnTourQuery {
    studentOnTour?: number;
}

function AnalysisStudentOnTour() {
    const router = useRouter();
    const [studentOnTour, setStudentOnTour] = useState<StudentOnTour | null>(null);
    const [buildingsAnalysis, setBuildingsAnalysis] = useState<BuildingAnalysis[]>([]);
    const [buildings, setBuildings] = useState<BuildingInterface[]>([]);
    const [student, setStudent] = useState<User | null>(null);
    const [tour, setTour] = useState<Tour | null>(null);
    const [region, setRegion] = useState<RegionInterface | null>(null);

    useEffect(() => {
        const query = router.query as StudentOnTourQuery;
        const studentOnTourId = query.studentOnTour;
        if (!studentOnTourId) {
            return;
        }
        getStudentOnTour(studentOnTourId).then(
            (res) => {
                const sot: StudentOnTour = res.data;
                setStudentOnTour(sot);
                getTourWithTourId(sot.tour);
                getStudent(sot.student);
            },
            () => {}
        );

        getAnalysisStudentOnTour(studentOnTourId).then(
            (res) => {
                const b: BuildingAnalysis[] = res.data;
                setBuildingsAnalysis(b);

                Promise.all(b.map((building) => getBuildingInfo(building.building_id))).then(
                    (res) => {
                        const buildings: BuildingInterface[] = res.map((r) => r.data);
                        setBuildings(buildings);
                    },
                    () => {}
                );
            },
            () => {}
        );
    }, [router.isReady]);

    function getTourWithTourId(tourId: number) {
        if (tourId) {
            getTour(tourId).then(
                (res) => {
                    const t: Tour = res.data;
                    setTour(t);
                    getRegion(t.region).then(
                        (resp) => {
                            const r: RegionInterface = resp.data;
                            setRegion(r);
                        },
                        () => {}
                    );
                },
                () => {}
            );
        }
    }

    function getStudent(userId: number) {
        getUserInfo(userId.toString()).then(
            (res) => {
                const u: User = res.data;
                setStudent(u);
            },
            () => {}
        );
    }

    function convertSecondsToString(seconds: number) {
        if (seconds < 60) {
            return `${seconds} s`;
        }
        let minutes = ~~(seconds / 60);
        let extraSeconds = seconds % 60;
        return `${minutes} m ${extraSeconds > 0 ? `${extraSeconds} s` : ""}`;
    }

    function getTimeIntervalString(arrivalTime: Date, departureTime: Date): string {
        const arrivalHours = arrivalTime.getHours();
        const arrivalMinutes = arrivalTime.getMinutes();

        const departureHours = departureTime.getHours();
        const departureMinutes = departureTime.getMinutes();

        return `${isNaN(arrivalHours) ? "..." : `${arrivalHours.toString().padStart(2, "0")}:${arrivalMinutes.toString().padStart(2, "0")}`} - ${
            isNaN(departureHours)
                ? "..."
                : `${departureHours.toString().padStart(2, "0")}:${departureMinutes.toString().padStart(2, "0")}`
        }`;
    }

    /**
     * Render the correct progressbar
     */
    function getDurationInProgress(expectedDuration: number, actualDuration: number) {
        const minDiff = ~~((actualDuration - expectedDuration) / 60);
        const minString = `${minDiff > 0 ? "+" : ""}${minDiff} m`;
        if (expectedDuration > actualDuration) {
            const per: number = Math.ceil(((expectedDuration - actualDuration) / expectedDuration) * 100);
            if (per > 25) {
                // More than 25 % faster
                return (
                    <div className="text-center">
                        <h5 style={{ color: "green" }}>{minString}</h5>
                        <div className="progress-bar-container">
                            <ProgressBar>
                                <ProgressBar now={50} style={{ backgroundColor: "lightgreen" }} />
                            </ProgressBar>
                        </div>
                    </div>
                );
            }
            const empty: number = 50 - per * 2;
            return (
                <div className="text-center">
                    <h5 style={{ color: "green" }}>{minString}</h5>
                    <div className="progress-bar-container">
                        <ProgressBar max={50}>
                            <ProgressBar className="invisible" now={empty} key={1} />
                            <ProgressBar now={per * 2} key={2} style={{ backgroundColor: "lightgreen" }} />
                        </ProgressBar>
                    </div>
                </div>
            );
        } else if (expectedDuration < actualDuration) {
            const per: number = Math.ceil(((actualDuration - expectedDuration) / actualDuration) * 100);
            if (per > 25) {
                // More than 25 % slower
                return (
                    <div className="text-center">
                        <h5 style={{ color: "indianred" }}>{minString}</h5>
                        <div className="progress-bar-container">
                            <ProgressBar>
                                <ProgressBar className="invisible" now={50} key={1} />
                                <ProgressBar now={50} key={2} style={{ backgroundColor: "indianred" }} />
                            </ProgressBar>
                        </div>
                    </div>
                );
            }
            return (
                <div className="text-center">
                    <h5 style={{ color: "orange" }}>{minString}</h5>
                    <div className="progress-bar-container">
                        <ProgressBar>
                            <ProgressBar className="invisible" now={50} key={1}></ProgressBar>
                            <ProgressBar now={per * 2} key={2} style={{ backgroundColor: "orange" }} />
                        </ProgressBar>
                    </div>
                </div>
            );
        } else {
            // Equal
            return (
                <div className="text-center">
                    <h5 style={{ color: "green" }}>{minString}</h5>
                    <div className="progress-bar-container">
                        <ProgressBar now={100} style={{ backgroundColor: "lightgreen" }} />
                    </div>
                </div>
            );
        }
    }

    return (
        <>
            <AdminHeader />
            <Container fluid="md">
                <div className="m-3">
                    {tour && (
                        <span className="h2 fw-bold">{`Ronde: ${tour.name} ${
                            region ? `(${region.region})` : ""
                        }`}</span>
                    )}
                    {tour &&
                        buildingsAnalysis.length > 0 &&
                        new Date(tour.modified_at) > new Date(buildingsAnalysis[0].arrival_time) && (
                            <p className="text-muted">{`Dit is een oudere versie van de ronde (laatst aangepast: ${new Date(
                                tour.modified_at
                            ).toLocaleString("en-GB")})`}</p>
                        )}
                    {student && studentOnTour && studentOnTour.started_tour && studentOnTour.completed_tour && (
                        <p className="h5">
                            {`${getFullName(student)} op ${new Date(studentOnTour.date).toLocaleDateString("en-GB")} 
                            ${getTimeIntervalString(
                                new Date(studentOnTour.started_tour),
                                new Date(studentOnTour.completed_tour)
                            )}`}
                        </p>
                    )}
                </div>
                <ListGroup className="m-2">
                    {buildingsAnalysis.map((analysis, index) => {
                        const building: BuildingInterface | undefined = buildings.find(
                            (b) => b.id === analysis.building_id
                        );
                        return (
                            <ListGroupItem key={index}>
                                <Container>
                                    <Row>
                                        <Col md={9}>
                                            <div className="fw-bold">{building ? getAddress(building) : ""}</div>
                                            <p>
                                                {getTimeIntervalString(
                                                    new Date(analysis.arrival_time),
                                                    new Date(analysis.departure_time)
                                                )}
                                            </p>
                                        </Col>
                                        <Col md={3}>
                                            <Link
                                                style={{
                                                    textDecoration: "underline",
                                                    color: "royalblue",
                                                }}
                                                href={{
                                                    pathname: "/admin/building/",
                                                    query: {
                                                        id: building ? building.id : -1,
                                                        date: formatDate(new Date(analysis.departure_time)),
                                                    },
                                                }}
                                            >
                                                Bekijk foto's en opmerkingen
                                            </Link>
                                        </Col>
                                    </Row>
                                </Container>
                                <Tooltip
                                    title={
                                        <div>
                                            {`Ingeplande duur: ${convertSecondsToString(
                                                analysis.expected_duration_in_seconds
                                            )}`}
                                            <br />
                                            {`Duur: ${convertSecondsToString(analysis.duration_in_seconds)}`}
                                        </div>
                                    }
                                >
                                    {getDurationInProgress(
                                        analysis.expected_duration_in_seconds,
                                        analysis.duration_in_seconds
                                    )}
                                </Tooltip>
                            </ListGroupItem>
                        );
                    })}
                </ListGroup>
            </Container>
        </>
    );
}

export default withAuthorisation(AnalysisStudentOnTour, ["Admin", "Superstudent"]);
