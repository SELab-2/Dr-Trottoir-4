import AdminHeader from "@/components/header/adminHeader";
import {useRouter} from "next/router";
import React, {useEffect, useState} from "react";
import {getStudentOnTour, StudentOnTour} from "@/lib/student-on-tour";
import {getAnalysisStudentOnTour} from "@/lib/analysis";
import {BuildingAnalysis} from "@/types";
import {BuildingInterface, getAddress, getBuildingInfo} from "@/lib/building";
import {Badge, Container, ListGroup, ListGroupItem, ProgressBar} from "react-bootstrap";

interface ParsedUrlQuery {
}

interface DataStudentOnTourQuery extends ParsedUrlQuery {
    studentOnTour?: number;
}

export default function AnalysisStudentOnTour() {
    const router = useRouter();
    const [studentOnTour, setStudentOnTour] = useState<StudentOnTour | null>(null);
    const [buildingsAnalysis, setBuildingsAnalysis] = useState<BuildingAnalysis[]>([]);
    const [buildings, setBuildings] = useState<BuildingInterface[]>([]);

    useEffect(() => {
        const query = router.query as DataStudentOnTourQuery;
        const studentOnTourId = query.studentOnTour;
        if (!studentOnTourId) {
            return;
        }
        getStudentOnTour(studentOnTourId).then(res => {
            const sot: StudentOnTour = res.data;
            setStudentOnTour(sot);
        }, () => {
        });

        getAnalysisStudentOnTour(studentOnTourId).then(res => {
            const b: BuildingAnalysis[] = res.data;
            setBuildingsAnalysis(b);

            Promise.all(b.map(building => getBuildingInfo(building.building_id))).then(res => {
                const buildings: BuildingInterface[] = res.map(r => r.data);
                setBuildings(buildings);
            }, () => {
            });
        }, console.error);
    }, [router.isReady]);

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

        return `${arrivalHours.toString().padStart(2, "0")}:${arrivalMinutes.toString().padStart(2, "0")} - 
        ${departureHours.toString().padStart(2, "0")}:${departureMinutes.toString().padStart(2, "0")}`;
    }

    return (
        <>
            <AdminHeader/>

            <Container fluid="md">
                <ListGroup>
                    {
                        buildingsAnalysis.map((analysis, index) => {
                            const building: BuildingInterface | undefined = buildings.find(b => b.id === analysis.building_id);
                            return (
                                <ListGroupItem key={index}>
                                    <div className="ms-2 me-auto">
                                        <div className="fw-bold">{building ? getAddress(building) : ""}</div>
                                        <p>{getTimeIntervalString(new Date(analysis.arrival_time), new Date(analysis.departure_time))}</p>
                                    </div>
                                    <ProgressBar now={20}>
                                        <div className="progress-line"/>
                                    </ProgressBar>
                                    <Badge pill>
                                        <p>{`${convertSecondsToString(analysis.duration_in_seconds)} vs ${convertSecondsToString(analysis.expected_duration_in_seconds)}`}</p>
                                    </Badge>
                                </ListGroupItem>
                            );
                        })
                    }
                </ListGroup>
            </Container>
        </>
    );
}