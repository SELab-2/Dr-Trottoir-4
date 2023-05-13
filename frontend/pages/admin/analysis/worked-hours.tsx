import AdminHeader from "@/components/header/adminHeader";
import React, {useEffect, useState} from "react";
import {differenceInMinutes, endOfWeek, startOfWeek, subMonths} from "date-fns";
import {Card, Col, Container, Form, ListGroup, Row} from "react-bootstrap";
import {formatDate} from "@/lib/date";
import {getWorkedHours} from "@/lib/analysis";
import {getAllTours, Tour} from "@/lib/tour";
import {getAllRegions, RegionInterface} from "@/lib/region";
import {getTourUsers, User} from "@/lib/user";
import ErrorMessageAlert from "@/components/errorMessageAlert";
import {getAllStudentOnTourFromDate, StudentOnTour, StudentOnTourStringDate} from "@/lib/student-on-tour";
import {WorkedHours} from "@/types";
import {handleError} from "@/lib/error";
import Link from "next/link";

export default function AdminAnalysisWorkingHours() {

    const [errorMessages, setErrorMessages] = useState<string[]>([])

    const [allTours, setAllTours] = useState<Tour[]>([]);
    const [allRegions, setAllRegions] = useState<RegionInterface[]>([]);
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [studentOnTours, setStudentOnTours] = useState<StudentOnTour[]>([]);
    const [workedHours, setWorkedHours] = useState<WorkedHours[]>([]);

    const [startDate, setStartDate] = useState<Date>(startOfWeek(subMonths(new Date(), 1)));
    const [endDate, setEndDate] = useState<Date>(endOfWeek(new Date()));

    useEffect(() => {
        getAllTours().then(res => {
            const tours: Tour[] = res.data;
            setAllTours(tours);
        }, () => {
        });

        getAllRegions().then(res => {
            const regions: RegionInterface[] = res.data;
            setAllRegions(regions);
        }, () => {
        });

        getTourUsers(true).then(res => {
            const users: User[] = res.data;
            setAllUsers(users);
        }, () => {
        });
    }, []);

    useEffect(() => {
        if (allTours.length <= 0) {
            return;
        }
        if (endDate < startDate) {
            setErrorMessages(["Einde van periode moet na start komen."]);
            return;
        }
        getWorkedHours(startDate, endDate).then(res => {
            const hours: WorkedHours[] = res.data;
            setWorkedHours(hours.sort((a, b) => b.worked_minutes - a.worked_minutes));
        }, err => setErrorMessages(handleError(err)));
        getAllStudentOnTourFromDate({startDate, endDate}).then(res => {
            const sots: StudentOnTourStringDate[] = res.data;
            setStudentOnTours(sots.filter(s => s.completed_tour && s.started_tour).map(s => {
                return {
                    id: s.id,
                    student: s.student,
                    tour: s.tour,
                    date: new Date(s.date),
                    completed_tour: s.completed_tour,
                    started_tour: s.started_tour,
                    current_building_index: s.current_building_index,
                    max_building_index: s.max_building_index,
                };
            }));
        }, err => setErrorMessages(handleError(err)));
    }, [startDate, endDate, allTours]);


    function getStudentName(studentId: number): string {
        const user: User | undefined = allUsers.find(u => u.id === studentId);
        return user ? `${user.first_name} ${user.last_name}` : "Onbekend";
    }

    function getTourName(studentOnTour: StudentOnTour): string {
        const tour: Tour | undefined = allTours.find(t => t.id === studentOnTour.tour);
        if (!tour) {
            return "Onbekend";
        }
        const region: RegionInterface | undefined = allRegions.find(r => r.id === tour.region);
        if (!studentOnTour.completed_tour || !studentOnTour.started_tour) {
            return `${tour.name} (${region ? region.region : "onbekend"}) - ${studentOnTour.date.toLocaleDateString("en-GB")}`;
        }
        const completionTime = new Date(studentOnTour.completed_tour);
        const startingTime = new Date(studentOnTour.started_tour);
        const minutes = Math.abs(differenceInMinutes(completionTime, startingTime));
        return `${tour.name} (${region ? region.region : "onbekend"}) - ${studentOnTour.date.toLocaleDateString("en-GB")} (${toHoursAndMinutes(minutes, false)})`;
    }

    function toHoursAndMinutes(totalMinutes: number, fullString: boolean = true): string {
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        if (hours === 0) {
            return fullString ? `${minutes} minuten` : `${minutes} m`;
        }
        return fullString ? `${hours} uur ${minutes} minuten` : `${hours} u ${minutes} m`;
    }

    return (
        <Container fluid className="p-0 overflow-hidden">
            <AdminHeader/>
            <span className="h3 fw-bold">Overzicht gewerkte uren</span>
            <ErrorMessageAlert errorMessages={errorMessages} setErrorMessages={setErrorMessages}/>
            <Form className="m-2">
                <Row>
                    <Form.Group as={Col} sm={12} md={3} lg={3}>
                        <Form.Label>Start periode:</Form.Label>
                        <Form.Control
                            type="date"
                            value={formatDate(startDate)}
                            onChange={e => {
                                setStartDate(new Date(e.target.value));
                            }}
                        />
                    </Form.Group>
                    <Form.Group as={Col} sm={12} md={3} lg={3}>
                        <Form.Label>Einde periode:</Form.Label>
                        <Form.Control
                            type="date"
                            value={formatDate(endDate)}
                            onChange={e => {
                                setEndDate(new Date(e.target.value));
                            }}
                        />
                    </Form.Group>
                </Row>
            </Form>
            <Row className="m-2">
                {
                    workedHours.map(worked => {
                        const name: string = getStudentName(worked.student_id);
                        const time: string = toHoursAndMinutes(worked.worked_minutes);
                        return (
                            <Col key={worked.student_id} xs={12} md={4} lg={3} className="p-1">
                                <Card>
                                    <Card.Body>
                                        <span className="h3 fw-bold">{name}</span>
                                        <Card.Text className="text-muted mt-1">{time}</Card.Text>
                                        <ListGroup className="list-group-flush">
                                            <ListGroup.Item/>
                                            {
                                                worked.student_on_tour_ids.map(s => {
                                                    const sot: StudentOnTour | undefined = studentOnTours.find(st => st.id === s);
                                                    if (!sot) {
                                                        return (<></>);
                                                    }
                                                    return <ListGroup.Item key={s}><Link style={{
                                                        textDecoration: "underline",
                                                        color: "royalblue"
                                                    }} href={{
                                                        pathname: "/admin/analysis/student-on-tour",
                                                        query: {
                                                            studentOnTour: sot.id,
                                                        },
                                                    }}>{getTourName(sot)}</Link></ListGroup.Item>
                                                })
                                            }
                                        </ListGroup>
                                    </Card.Body>
                                </Card>
                            </Col>
                        );
                    })
                }
            </Row>
        </Container>
    );
}
