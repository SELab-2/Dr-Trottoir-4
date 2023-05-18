import AdminHeader from "@/components/header/adminHeader";
import React, {useEffect, useState} from "react";
import {addDays, differenceInMinutes, startOfWeek, subDays, subMonths} from "date-fns";
import {Card, Col, Container, Form, ListGroup, Row} from "react-bootstrap";
import {datesEqual, formatDate} from "@/lib/date";
import {getWorkedHours} from "@/lib/analysis";
import {getAllTours, Tour} from "@/lib/tour";
import {getAllRegions, RegionInterface} from "@/lib/region";
import {getFullName, getTourUsers, User} from "@/lib/user";
import ErrorMessageAlert from "@/components/errorMessageAlert";
import {getAllStudentOnTourFromDate, StudentOnTour, StudentOnTourStringDate} from "@/lib/student-on-tour";
import {WorkedHours} from "@/types";
import {handleError} from "@/lib/error";
import {withAuthorisation} from "@/components/withAuthorisation";
import Select from "react-select";
import Masonry from '@mui/lab/Masonry';
import Link from "next/link";

function AdminAnalysisWorkingHours() {
    enum sortBy {
        ALPHABETICALLY = "Alphabetisch",
        DURATION = "Gewerkte uren",
    }

    const [errorMessages, setErrorMessages] = useState<string[]>([]);

    const [allTours, setAllTours] = useState<Tour[]>([]);
    const [allRegions, setAllRegions] = useState<RegionInterface[]>([]);
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [studentOnTours, setStudentOnTours] = useState<StudentOnTour[]>([]);
    const [workedHours, setWorkedHours] = useState<WorkedHours[]>([]);

    const [startDate, setStartDate] = useState<Date>(startOfWeek(subMonths(new Date(), 1)));
    const [endDate, setEndDate] = useState<Date>(new Date());

    const [sortType, setSortType] = useState<string>(sortBy.ALPHABETICALLY);
    const [filteredRegion, setFilteredRegion] = useState<RegionInterface | null>(null);

    const sortByKey: { [key: string]: (a: WorkedHours, b: WorkedHours) => number } = {
        ["Gewerkte uren"]: (a: WorkedHours, b: WorkedHours) => b.worked_minutes - a.worked_minutes,
        ["Alphabetisch"]: (a: WorkedHours, b: WorkedHours) => {
            const userA: User | undefined = allUsers.find((u) => u.id === a.student_id);
            if (!userA) {
                return 1;
            }
            const userB: User | undefined = allUsers.find((u) => u.id === b.student_id);
            if (!userB) {
                return -1;
            }
            return getFullName(userA).localeCompare(getFullName(userB));
        },
    };

    useEffect(() => {
        getAllTours().then(
            (res) => {
                const tours: Tour[] = res.data;
                setAllTours(tours);
            },
            () => {
            }
        );

        getAllRegions().then(
            (res) => {
                const regions: RegionInterface[] = res.data;
                setAllRegions(regions);
            },
            () => {
            }
        );

        getTourUsers(true).then(
            (res) => {
                const users: User[] = res.data;
                setAllUsers(users);
            },
            () => {
            }
        );
    }, []);

    useEffect(() => {
        if (allTours.length <= 0 || allUsers.length <= 0) {
            return;
        }
        getWorkedHours(startDate, endDate, filteredRegion ? filteredRegion.id : null).then(
            (res) => {
                const hours: WorkedHours[] = res.data;
                setWorkedHours(hours.sort(sortByKey[sortType]));
            },
            (err) => setErrorMessages(handleError(err))
        );
        getAllStudentOnTourFromDate({startDate, endDate}).then(
            (res) => {
                const sots: StudentOnTourStringDate[] = res.data;
                setStudentOnTours(
                    sots.map((s) => {
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
                    })
                );
            },
            (err) => setErrorMessages(handleError(err))
        );
    }, [startDate, endDate, allTours, allUsers, filteredRegion]);

    useEffect(() => {
        if (allTours.length <= 0 || allUsers.length <= 0) {
            return;
        }
        setWorkedHours((prevState) => {
            return [...prevState].sort(sortByKey[sortType]);
        });
    }, [sortType]);

    function getStudentName(studentId: number): string {
        const user: User | undefined = allUsers.find((u) => u.id === studentId);
        return user ? getFullName(user) : "Onbekend";
    }

    function getTourName(studentOnTour: StudentOnTour): string {
        const tour: Tour | undefined = allTours.find((t) => t.id === studentOnTour.tour);
        if (!tour) {
            return "Onbekend";
        }
        const region: RegionInterface | undefined = allRegions.find((r) => r.id === tour.region);
        if (
            !studentOnTour.completed_tour &&
            !studentOnTour.started_tour &&
            !datesEqual(new Date(), new Date(studentOnTour.date)) &&
            new Date() > new Date(studentOnTour.date)
        ) {
            return `${tour.name} (${region ? region.region : "onbekend"}) - ${studentOnTour.date.toLocaleDateString(
                "en-GB"
            )} (nooit afgewerkt)`;
        }
        if (!studentOnTour.completed_tour && !studentOnTour.started_tour) {
            return `${tour.name} (${region ? region.region : "onbekend"}) - ${studentOnTour.date.toLocaleDateString(
                "en-GB"
            )} (gepland)`;
        }
        if (!studentOnTour.completed_tour || !studentOnTour.started_tour) {
            return `${tour.name} (${region ? region.region : "onbekend"}) - ${studentOnTour.date.toLocaleDateString(
                "en-GB"
            )} (bezig)`;
        }
        const completionTime = new Date(studentOnTour.completed_tour);
        const startingTime = new Date(studentOnTour.started_tour);
        const minutes = Math.abs(differenceInMinutes(completionTime, startingTime));
        return `${tour.name} (${region ? region.region : "onbekend"}) - ${studentOnTour.date.toLocaleDateString(
            "en-GB"
        )} (${toHoursAndMinutes(minutes, false)})`;
    }

    function toHoursAndMinutes(totalMinutes: number, fullString: boolean = true): string {
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        if (hours === 0) {
            return fullString ? `${minutes} minuten` : `${minutes} m`;
        }
        return fullString ? `${hours} uur ${minutes} minuten` : `${hours} u ${minutes} m`;
    }

    const heights = [150, 30, 90, 70, 92, 100, 152, 32, 50, 80];

    return (
        <div className="tablepageContainer">
            <AdminHeader/>
            <div className="tableContainer">
                <Container>
                    <label className="title">Overzicht gewerkte uren</label>
                    <ErrorMessageAlert errorMessages={errorMessages} setErrorMessages={setErrorMessages}/>
                    <Card>
                        <Form className="m-2">
                            <Row>
                                <Form.Group as={Col} sm={12} md={3} lg={3}>
                                    <Form.Label>Start periode:</Form.Label>
                                    <Form.Control
                                        type="date"
                                        value={formatDate(startDate)}
                                        max={formatDate(subDays(endDate, 1))}
                                        onChange={(e) => {
                                            setStartDate(new Date(e.target.value));
                                        }}
                                    />
                                </Form.Group>
                                <Form.Group as={Col} sm={12} md={3} lg={3}>
                                    <Form.Label>Einde periode:</Form.Label>
                                    <Form.Control
                                        type="date"
                                        min={formatDate(addDays(startDate, 1))}
                                        value={formatDate(endDate)}
                                        onChange={(e) => {
                                            setEndDate(new Date(e.target.value));
                                        }}
                                    />
                                </Form.Group>
                                <Form.Group as={Col} sm={12} md={3} lg={3}>
                                    <Form.Label>Sorteer op:</Form.Label>
                                    <Select
                                        value={{value: sortType.toString(), label: sortType.toString()}}
                                        isClearable={false}
                                        isSearchable={false}
                                        options={Object.values(sortBy).map((t) => {
                                            return {
                                                value: t,
                                                label: t,
                                            };
                                        })}
                                        onChange={(s) => {
                                            if (s && s.value) {
                                                setSortType(s.value);
                                            }
                                        }}
                                        menuPortalTarget={document.querySelector("body")}
                                    />
                                </Form.Group>
                                <Form.Group as={Col} sm={12} md={3} lg={3}>
                                    <Form.Label>Filter regio:</Form.Label>
                                    <Select
                                        value={
                                            filteredRegion
                                                ? {value: filteredRegion.id, label: filteredRegion.region}
                                                : {value: -1, label: "Alle regio's"}
                                        }
                                        isClearable={false}
                                        isSearchable={false}
                                        options={[
                                            {value: -1, label: "Alle regio's"},
                                            ...allRegions.map((r) => {
                                                return {
                                                    value: r.id,
                                                    label: r.region,
                                                };
                                            }),
                                        ]}
                                        onChange={(s) => {
                                            if (s && s.value) {
                                                const r: RegionInterface | undefined = allRegions.find(
                                                    (region) => region.id === s.value
                                                );
                                                setFilteredRegion(r ? r : null);
                                            }
                                        }}
                                        menuPortalTarget={document.querySelector("body")}
                                    />
                                </Form.Group>
                            </Row>
                        </Form>
                    </Card>
                    <br/>
                    <Masonry columns={{ xs: 1, sm: 2, md: 3, lg: 4 }} spacing={2}>
                        {workedHours.map((worked) => {
                            const name: string = getStudentName(worked.student_id);
                            const time: string = toHoursAndMinutes(worked.worked_minutes);
                            return (
                                <div key={worked.student_id} className="p-1">
                                    <Card className="card">
                                        <Card.Body>
                                            <label className="subtitle">{name}</label>
                                            <Card.Text className="text-muted mt-1">{time}</Card.Text>
                                            <ListGroup className="list-group-flush">
                                                <ListGroup.Item/>
                                                {worked.student_on_tour_ids.map((s, index) => {
                                                    const sot: StudentOnTour | undefined = studentOnTours.find((st) => st.id === s);
                                                    if (!sot) {
                                                        return <div key={index}/>;
                                                    }
                                                    return (
                                                        <ListGroup.Item key={index}>
                                                            {sot.completed_tour || sot.started_tour ? (
                                                                <Link
                                                                    style={{
                                                                        textDecoration: 'underline',
                                                                        color: 'royalblue'
                                                                    }}
                                                                    href={{
                                                                        pathname: '/admin/analysis/student-on-tour',
                                                                        query: {
                                                                            studentOnTour: sot.id,
                                                                        },
                                                                    }}
                                                                >
                                                                    {getTourName(sot)}
                                                                </Link>
                                                            ) : (
                                                                <p>{getTourName(sot)}</p>
                                                            )}
                                                        </ListGroup.Item>
                                                    );
                                                })}
                                            </ListGroup>
                                        </Card.Body>
                                    </Card>
                                </div>
                            );
                        })}
                    </Masonry>
                </Container>
            </div>
        </div>
    );
}

export default withAuthorisation(AdminAnalysisWorkingHours, ["Admin", "Superstudent"]);
