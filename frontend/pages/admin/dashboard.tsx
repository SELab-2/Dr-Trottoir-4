import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { getAllTours, Tour } from "@/lib/tour";
import {
    getAllStudentOnTourFromToday,
    getStudentOnTourAllProgressWS,
    getStudentOnTourIndividualProgressWS,
    getStudentOnTourIndividualRemarkWS,
    getStudentOnTourProgress,
    StudentOnTour,
} from "@/lib/student-on-tour";
import { getAllUsers, User } from "@/lib/user";
import AdminHeader from "@/components/header/adminHeader";
import { withAuthorisation } from "@/components/withAuthorisation";
import Loading from "@/components/loading";
import LinearProgress from "@mui/material/LinearProgress";
import { styled } from "@mui/system";
import { getAllRemarksOfStudentOnTour } from "@/lib/remark-at-building";
import Box from "@mui/material/Box";
import CheckIcon from "@mui/icons-material/Check";
import { handleError } from "@/lib/error";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorMessageAlert from "@/components/errorMessageAlert";
import { Divider, Tooltip } from "@mui/material";
import { Card, Container, Table } from "react-bootstrap";

interface IndividualProgressWebSocketsResponse {
    current_building_index: number;
}

interface ProgressResponse {
    current_building_index: number;
    max_building_index?: number;
}

interface AllWebSocketsResponse {
    state: string;
    student_on_tour_id: number;
}

const GreenLinearProgress = styled(LinearProgress)(() => ({
    height: "20px",
    backgroundColor: "#c8e6c9", // Light green background color
    "& .MuiLinearProgress-bar": {
        backgroundColor: "#4caf50", // Main green progress bar color
    },
}));

function AdminDashboard() {
    const router = useRouter();
    const [tours, setTours] = useState<Tour[]>([]);
    const [studentsOnTours, setStudentsOnTours] = useState<StudentOnTour[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [remarksRecord, setRemarksRecord] = useState<Record<number, number>>({});
    const [startedStudentOnTourIds, setStartedStudentOnTourIds] = useState<number[]>([]);
    const [startedStudentOnTours, setStartedStudentOnTours] = useState<StudentOnTour[]>([]);
    const [notYetStartedStudentOnTours, setNotYetStartedStudentOnTours] = useState<StudentOnTour[]>([]);
    const [completedStudentOnTours, setCompletedStudentsOnTours] = useState<StudentOnTour[]>([]);

    const [currentBuildingIndex, setCurrentBuildingIndex] = useState<Record<string, number>>({});
    const [maxBuildingIndex, setMaxBuildingIndex] = useState<Record<string, number>>({});

    const [completionRecord, setCompletionRecord] = useState<Record<number, boolean>>({});

    const [errorMessages, setErrorMessages] = useState<string[]>([]);

    const getRemarkText = (numberOfRemarks: number): string => {
        if (numberOfRemarks === 0) {
            return "Geen opmerkingen";
        }

        let extension = "";
        if (numberOfRemarks > 1) {
            extension = "en";
        }

        return `${numberOfRemarks} opmerking${extension}`;
    };

    const getProgress = (studentOnTourId: number) => {
        const maxIndex = maxBuildingIndex[studentOnTourId];

        if (!maxIndex) {
            return 0;
        }

        const currentIndex = currentBuildingIndex[studentOnTourId];

        return (currentIndex / maxIndex) * 100;
    };

    const setupWebSocketForAllStudentOnTours = () => {
        const ws = getStudentOnTourAllProgressWS();

        ws.addEventListener("message", (event) => {
            const data: AllWebSocketsResponse = JSON.parse(event.data);
            if (data.state === "started") {
                setStartedStudentOnTourIds((prevState) => [...prevState, data.student_on_tour_id]);
            }

            if (data.state === "completed") {
                setCompletionRecord((prevState) => {
                    return {
                        ...prevState,
                        [data.student_on_tour_id]: true,
                    };
                });
            }
        });

        return ws;
    };

    const setupWebSocketForIndividualStudentOnTour = (studentOnTourId: number) => {
        const wsProgress = getStudentOnTourIndividualProgressWS(studentOnTourId);
        const wsRemarks = getStudentOnTourIndividualRemarkWS(studentOnTourId);

        wsProgress.addEventListener("message", (event) => {
            const data: IndividualProgressWebSocketsResponse = JSON.parse(event.data);
            setCurrentBuildingIndex((prevState) => ({
                ...prevState,
                [studentOnTourId]: data.current_building_index,
            }));
            if (!maxBuildingIndex[studentOnTourId]) {
                getStudentOnTourProgress(studentOnTourId).then(
                    (res) => {
                        const data: ProgressResponse = res.data;
                        setMaxBuildingIndex((prevState) => ({
                            ...prevState,
                            [studentOnTourId]: data.max_building_index,
                        }));
                    },
                    (err) => setErrorMessages(handleError(err))
                );
            }
        });

        wsRemarks.addEventListener("message", (event) => {
            // don't care about the actual remark
            setRemarksRecord((prevState) => ({
                ...prevState,
                [studentOnTourId]: (prevState[studentOnTourId] || 0) + 1,
            }));
        });

        return { wsProgress, wsRemarks };
    };

    const setInitialData = async (studentOnTourId: number) => {
        await fetchRemarks(studentOnTourId).then(
            (remarksCount: number) => {
                setRemarksRecord((prevState) => ({
                    ...prevState,
                    [studentOnTourId]: remarksCount,
                }));
            },
            (err) => setErrorMessages(handleError(err))
        );

        await getStudentOnTourProgress(studentOnTourId).then(
            (res) => {
                const data: ProgressResponse = res.data;
                setMaxBuildingIndex((prevState) => ({
                    ...prevState,
                    [studentOnTourId]: data.max_building_index,
                }));

                setCurrentBuildingIndex((prevState) => ({
                    ...prevState,
                    [studentOnTourId]: data.current_building_index,
                }));
            },
            (err) => setErrorMessages(handleError(err))
        );
    };

    const fetchRemarks = async (studentOnTourId: number): Promise<number> => {
        let remarks = await getAllRemarksOfStudentOnTour(studentOnTourId, "OP");
        let remarksCount = remarks.data.length;

        return remarksCount;
    };

    const redirectToRemarksPage = async (studentOnTour: StudentOnTour) => {
        // Redirect to the specific tour page
        await router.push({
            pathname: `tour/`,
            query: {
                student: studentOnTour.student,
                tour: studentOnTour.tour,
            },
        });
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const tourResponse = await getAllTours();
                const studentOnTourResponse = await getAllStudentOnTourFromToday();
                const allUsersResponse = await getAllUsers();

                setTours(tourResponse.data);
                setStudentsOnTours(studentOnTourResponse.data);

                setUsers(allUsersResponse.data);
            } catch (error) {
                setErrorMessages(handleError(error));
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        if (!studentsOnTours.length) return;
        const webSocketConnections: WebSocket[] = [];
        const newRemarks: Record<string, number> = {};
        let completionStatus: Record<number, boolean> = {};

        studentsOnTours.forEach(async (studentOnTour) => {
            await setInitialData(studentOnTour.id);
            const { wsProgress, wsRemarks } = setupWebSocketForIndividualStudentOnTour(studentOnTour.id);
            webSocketConnections.push(wsProgress);
            webSocketConnections.push(wsRemarks);
            if (studentOnTour.started_tour) {
                setStartedStudentOnTourIds((prevState) => [...prevState, studentOnTour.id]);
            }

            completionStatus[studentOnTour.id] = studentOnTour.completed_tour !== null;
        });

        setCompletionRecord(completionStatus);

        const wsAll = setupWebSocketForAllStudentOnTours();

        setRemarksRecord(newRemarks);

        return () => {
            webSocketConnections.forEach((ws) => ws.close());
            wsAll.close();
        };
    }, [tours, studentsOnTours, users]);

    useEffect(() => {
        for (const sot of studentsOnTours) {
            if (completionRecord[sot.id] || sot.completed_tour) {
                if (!completedStudentOnTours.some((completedSot) => completedSot.id === sot.id)) {
                    setCompletedStudentsOnTours((prevState) => [...prevState, sot]);
                }
                setStartedStudentOnTours((prevState) => prevState.filter((startedSot) => startedSot.id !== sot.id));
            } else if (startedStudentOnTourIds.includes(sot.id)) {
                if (!startedStudentOnTours.some((startedSot) => startedSot.id === sot.id)) {
                    setStartedStudentOnTours((prevState) => [...prevState, sot]);
                }
                setNotYetStartedStudentOnTours((prevState) =>
                    prevState.filter((notStartedSot) => notStartedSot.id !== sot.id)
                );
            } else {
                if (!notYetStartedStudentOnTours.some((notStartedSot) => notStartedSot.id === sot.id)) {
                    setNotYetStartedStudentOnTours((prevState) => [...prevState, sot]);
                }
            }
        }
    }, [startedStudentOnTourIds, studentsOnTours, completionRecord]);

    if (studentsOnTours.length === 0) {
        return (
            <div>
                <AdminHeader />
                <Container>
                    <Card>
                        <p className="title">Er zijn vandaag geen studenten ingepland</p>
                    </Card>
                </Container>
            </div>
        );
    }

    return (
        <div className="tablePageContainer">
            <AdminHeader />
            {loading ? (
                <Loading />
            ) : (
                <div className="tableContainer">
                    <Container>
                        <Card className="shadow" style={{ paddingLeft: "20px", paddingRight: "20px" }}>
                            <ErrorMessageAlert setErrorMessages={setErrorMessages} errorMessages={errorMessages} />
                            {studentsOnTours.length > 0 ? (
                                <>
                                    <p className="title">Rondes van vandaag</p>
                                    <Divider />
                                    {completedStudentOnTours.length > 0 ? (
                                        <>
                                            <label className="subtitle">Voltooid</label>
                                            <Table responsive className="table">
                                                <thead>
                                                    <tr>
                                                        <th>Ronde</th>
                                                        <th>Student</th>
                                                        <th>Voortgang</th>
                                                        <th>Opmerkingen</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {completedStudentOnTours.map((studentOnTour) => {
                                                        const tour = tours.find((t) => t.id === studentOnTour.tour);
                                                        const user = users.find((u) => u.id === studentOnTour.student);

                                                        if (!tour || !user) return null;

                                                        return (
                                                            <tr
                                                                key={studentOnTour.id}
                                                                style={{ cursor: "pointer" }}
                                                                onClick={() => redirectToRemarksPage(studentOnTour)}
                                                            >
                                                                <td style={{ textDecoration: "underline" }}>
                                                                    {tour.name}
                                                                </td>
                                                                <td>{`${user.first_name} ${user.last_name}`}</td>
                                                                <td>
                                                                    <Tooltip title={`Klaar met alle gebouwen.`}>
                                                                        <Box
                                                                            sx={{ width: "100%", position: "relative" }}
                                                                        >
                                                                            <GreenLinearProgress
                                                                                variant="determinate"
                                                                                value={100}
                                                                            />
                                                                            <CheckIcon
                                                                                style={{
                                                                                    position: "absolute",
                                                                                    top: "50%",
                                                                                    left: "50%",
                                                                                    transform: "translate(-50%, -50%)",
                                                                                    color: "white",
                                                                                }}
                                                                            />
                                                                        </Box>
                                                                    </Tooltip>
                                                                </td>

                                                                <td>
                                                                    {getRemarkText(remarksRecord[studentOnTour.id])}
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </Table>
                                        </>
                                    ) : (
                                        <></>
                                    )}
                                    {startedStudentOnTours.length > 0 ? (
                                        <>
                                            <label className="subtitle">Bezig</label>
                                            <Table className="table">
                                                <thead>
                                                    <tr>
                                                        <th>Ronde</th>
                                                        <th>Student</th>
                                                        <th>Voortgang</th>
                                                        <th>Opmerkingen</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {startedStudentOnTours.map((studentOnTour) => {
                                                        const tour = tours.find((t) => t.id === studentOnTour.tour);
                                                        const user = users.find((u) => u.id === studentOnTour.student);

                                                        if (!tour || !user) return null;

                                                        return (
                                                            <tr
                                                                key={studentOnTour.id}
                                                                style={{ cursor: "pointer" }}
                                                                onClick={() => redirectToRemarksPage(studentOnTour)}
                                                            >
                                                                <td style={{ textDecoration: "underline" }}>
                                                                    {tour.name}
                                                                </td>
                                                                <td>{`${user.first_name} ${user.last_name}`}</td>
                                                                <td>
                                                                    <Tooltip
                                                                        title={`Momenteel bezig met gebouw ${
                                                                            currentBuildingIndex[studentOnTour.id] || 0
                                                                        } van de ${
                                                                            maxBuildingIndex[studentOnTour.id] || 0
                                                                        }.`}
                                                                    >
                                                                        <Box sx={{ width: "100%" }}>
                                                                            <GreenLinearProgress
                                                                                variant="determinate"
                                                                                value={getProgress(studentOnTour.id)}
                                                                            />
                                                                        </Box>
                                                                    </Tooltip>
                                                                </td>

                                                                <td>
                                                                    {getRemarkText(remarksRecord[studentOnTour.id])}
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </Table>
                                        </>
                                    ) : (
                                        <></>
                                    )}
                                    {notYetStartedStudentOnTours.length > 0 ? (
                                        <>
                                            <label className="subtitle">Nog niet gestarte rondes</label>
                                            <Table className="table">
                                                <thead>
                                                    <tr>
                                                        <th>Ronde</th>
                                                        <th>Student</th>
                                                        <th>Voortgang</th>
                                                        <th>Opmerkingen</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {notYetStartedStudentOnTours.map((studentOnTour) => {
                                                        const tour = tours.find((t) => t.id === studentOnTour.tour);
                                                        const user = users.find((u) => u.id === studentOnTour.student);

                                                        if (!tour || !user) return null;

                                                        return (
                                                            <tr key={studentOnTour.id}>
                                                                <td>{tour.name}</td>
                                                                <td>{`${user.first_name} ${user.last_name}`}</td>
                                                                <td>
                                                                    <Tooltip title={`Nog niet begonnen.`}>
                                                                        <Box sx={{ width: "100%" }}>
                                                                            <GreenLinearProgress
                                                                                variant="determinate"
                                                                                value={0}
                                                                            />
                                                                        </Box>
                                                                    </Tooltip>
                                                                </td>

                                                                <td>
                                                                    {getRemarkText(remarksRecord[studentOnTour.id])}
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </Table>
                                        </>
                                    ) : (
                                        <></>
                                    )}
                                </>
                            ) : (
                                <p className="title">Geen rondes vandaag</p>
                            )}
                        </Card>
                    </Container>
                </div>
            )}
        </div>
    );
}

export default withAuthorisation(AdminDashboard, ["Admin", "Superstudent"]);
