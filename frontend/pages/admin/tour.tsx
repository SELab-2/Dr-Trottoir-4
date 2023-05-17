import React, { useState, useEffect } from "react";
import "react-datepicker/dist/react-datepicker.css";
import ReactDatePicker from "react-datepicker";
import { getAllTours, getTour, Tour } from "@/lib/tour";
import {
    getStudentOnTourIndividualProgressWS,
    getStudentOnTourIndividualRemarkWS,
    getToursOfStudent,
    StudentOnTour,
} from "@/lib/student-on-tour";
import { getAllUsers, getStudents, User, userSearchString } from "@/lib/user";
import { BuildingOnTour, getAllBuildingsOnTourWithTourID } from "@/lib/building-on-tour";
import StudentAutocomplete from "@/components/autocompleteComponents/studentAutocomplete";
import { BuildingInterface, getAddress, getBuildingInfo } from "@/lib/building";
import { withAuthorisation } from "@/components/withAuthorisation";
import { useRouter } from "next/router";
import AdminHeader from "@/components/header/adminHeader";
import Loading from "@/components/loading";
import StudentOnTourAutocomplete from "@/components/autocompleteComponents/studentOnTourAutocomplete";
import { BuildingAnalysis } from "@/types";
import { getAnalysisStudentOnTour } from "@/lib/analysis";
import {
    getAllRemarksOfStudentOnTour,
    getRemarksOfStudentOnTourAtBuilding,
    RemarkAtBuilding,
    RemarkAtBuildingInterface,
} from "@/lib/remark-at-building";

interface ParsedUrlQuery {}

interface DataAdminTourQuery extends ParsedUrlQuery {
    student?: number;
    tour?: number;
}

interface ProgressWebSocketResponse {
    current_building_index: number;
}

function AdminTour() {
    const router = useRouter();
    const [allToursOfStudent, setAllToursOfStudent] = useState<StudentOnTour[]>([]);
    const [allBuildingsOnTour, setAllBuildingsOnTour] = useState<BuildingOnTour[]>([]);
    const [allBuildings, setAllBuildings] = useState<BuildingInterface[]>([]);
    const [selectedStudentId, setSelectedStudentId] = useState<number>(0);
    const [selectedStudentName, setSelectedStudentName] = useState<string>("");
    const [selectedTourId, setSelectedTourId] = useState<number>(0);
    const [selectedTourName, setSelectedTourName] = useState<string>("");
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [validDates, setValidDates] = useState<Date[]>([]);
    const [analysis, setAnalysis] = useState<BuildingAnalysis[]>([]);
    const [remarksRecord, setRemarksRecord] = useState<Record<number, string[]>>({});
    const [currentBuildingIndex, setCurrentBuildingIndex] = useState(0);
    const [refreshKey, setRefreshKey] = useState(0);

    const query: DataAdminTourQuery = router.query as DataAdminTourQuery;
    const [loading, setLoading] = useState(true);

    const updateValidDates = (sots: StudentOnTour[], tourId: number) => {
        const validDatesArray = sots.filter((sot) => sot.tour === tourId).map((sot) => new Date(sot.date));
        setValidDates(validDatesArray);

        const startedTours = sots.filter((sot) => sot.started_tour !== null);

        const latestStartedTour = startedTours.reduce((latest, current) => {
            const currentStartDate = new Date(current.date);
            const latestStartDate = latest ? new Date(latest.date) : null;

            if (!latestStartDate || currentStartDate > latestStartDate) {
                return current;
            } else {
                return latest;
            }
        }, null as StudentOnTour | null);

        if (latestStartedTour) {
            setSelectedDate(new Date(latestStartedTour.date));
        } else {
            setSelectedDate(validDatesArray[0]);
        }
    };

    const getStudentOnTour = (sots: StudentOnTour[], tourId: number, date: Date) => {
        const sot = sots.find(
            (sot) =>
                sot.tour === tourId &&
                new Date(sot.date).toISOString().split("T")[0] === new Date(date).toISOString().split("T")[0]
        );
        return sot ? { sot, current_building_index: sot.current_building_index } : null;
    };

    const getBuildingIndex = (buildingId: number) => {
        const buildingOnTour = allBuildingsOnTour.find(
            (buildingOnTour: BuildingOnTour) => buildingOnTour.building === buildingId
        );
        return buildingOnTour ? buildingOnTour.index : 0;
    };

    const getBuildingStatus = (buildingId: number) => {
        const sotObject = getStudentOnTour(allToursOfStudent, selectedTourId, selectedDate);

        let returnText = "Nog niet gedaan";
        if (sotObject) {
            if (sotObject.sot.started_tour) {
                const buildingIndex = getBuildingIndex(buildingId);
                if (currentBuildingIndex > buildingIndex) {
                    returnText = "Afgewerkt";
                } else if (currentBuildingIndex === buildingIndex) {
                    returnText = "Bezig";
                }
            }
        }
        return returnText;
    };

    const getBuildingAnalysis = (buildingId: number) => {
        return analysis.find((a) => a.building_id === buildingId) || null;
    };

    const getDepartureTimeString = (buildingId: number) => {
        let returnString = "";
        const ba: BuildingAnalysis | null = getBuildingAnalysis(buildingId);
        if (ba && ba.departure_time) {
            const date = new Date(ba.departure_time);
            const hours = date.getHours();
            const minutes = date.getMinutes();
            let prefix = minutes < 10 ? "0" : "";

            returnString = hours + ":" + prefix + minutes;
        }
        return returnString;
    };

    const secondsToTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return minutes + "m" + (remainingSeconds < 10 ? "0" : "") + remainingSeconds + "s";
    };

    const getSpentTimeColor = (expected: number, actual: number) => {
        const ratio = actual / expected;
        if (ratio > 1.25) {
            return "red";
        } else if (ratio > 1) {
            return "orange";
        } else {
            return "green";
        }
    };

    const goToBuildingPage = (buildingId: number) => {
        router.push({
            pathname: "/admin/building",
            query: {
                id: buildingId,
                date: selectedDate.toISOString().split("T")[0],
            },
        });
    };

    const goToAnalysisPage = () => {
        const sotObject = getStudentOnTour(allToursOfStudent, selectedTourId, selectedDate);
        if (sotObject) {
            router.push({
                pathname: "/admin/analysis/student-on-tour",
                query: { studentOnTour: sotObject.sot.id },
            });
        } else {
            router.push({
                pathname: "/admin/analysis/worked-hours",
            });
        }
    };

    const setupWebsocketsForStudentOnTour = (studentOnTourId: number) => {
        const wsProgress = getStudentOnTourIndividualProgressWS(studentOnTourId);
        const wsRemarks = getStudentOnTourIndividualRemarkWS(studentOnTourId);

        wsProgress.addEventListener("message", (event) => {
            const data: ProgressWebSocketResponse = JSON.parse(event.data);
            setRefreshKey((prevKey) => prevKey + 1); // retrigger useEffects
            setCurrentBuildingIndex(data.current_building_index);
        });

        wsRemarks.addEventListener("message", (event) => {
            console.log(JSON.parse(event.data));
            const data: RemarkAtBuildingInterface = JSON.parse(event.data);
            const remark = data.remark || null;
            if (remark) {
                setRemarksRecord((prevState) => {
                    const existingRemarks = prevState[data.building] || [];
                    return {
                        ...prevState,
                        [data.building]: existingRemarks.concat(remark),
                    };
                });
            }
        });

        return { wsProgress, wsRemarks };
    };

    // First, fetch all students when the router is ready.
    // Set the selected student ID based on the router query or default to the first student.
    useEffect(() => {
        try {
            getStudents().then((res) => {
                const students: User[] = res.data;
                students.filter((e) => e.role === 4);
                let currentStudent = students[0];
                if (query.student) {
                    currentStudent = students.find((e) => e.id === +[query.student]) || students[0];
                }
                setSelectedStudentId(currentStudent.id);
                setSelectedStudentName(userSearchString(currentStudent));
            });
        } catch (error) {
            console.error(error);
        }
    }, [router.isReady]);

    // When selected student ID changes, fetch all tours of that student.
    // Set the selected tour ID based on the router query or default to the first tour.
    // Also change the validDates
    useEffect(() => {
        if (!selectedStudentId) return;

        getToursOfStudent(selectedStudentId).then((res) => {
            const sots: StudentOnTour[] = res.data;
            setAllToursOfStudent(sots);
            let currentSot = sots[0];
            if (query.tour) {
                currentSot = sots.find((e) => e.tour === +[query.tour]) || sots[0];
            }
            setSelectedTourId(currentSot.tour);

            updateValidDates(sots, currentSot.tour);
        });
    }, [selectedStudentId, refreshKey]);

    // When selected tour ID changes, fetch details of the tour and update selected tour.
    // Also fetch all buildings on that tour.
    // Also change the validDates
    useEffect(() => {
        if (!selectedTourId) return;

        getTour(selectedTourId)
            .then((res) => {
                const tour: Tour = res.data;
                setSelectedTourName(tour.name);
            })
            .catch(console.error);

        getAllBuildingsOnTourWithTourID(selectedTourId)
            .then((res) => {
                setAllBuildingsOnTour(res.data);
            })
            .catch(console.error);

        updateValidDates(allToursOfStudent, selectedTourId);
    }, [selectedTourId]);

    // When the list of buildings on tour changes, fetch all building details.
    useEffect(() => {
        if (!allBuildingsOnTour.length) return;

        Promise.all(allBuildingsOnTour.map((buildingOnTour) => getBuildingInfo(buildingOnTour.building)))
            .then((responses) => {
                setAllBuildings(responses.map((response) => response.data));
            })
            .catch(console.error);

        const sotObject = getStudentOnTour(allToursOfStudent, selectedTourId, selectedDate);
        if (sotObject) {
            Promise.all(
                allBuildingsOnTour.map((buildingOnTour) =>
                    getRemarksOfStudentOnTourAtBuilding(buildingOnTour.building, sotObject.sot.id, "OP")
                )
            )
                .then((responses) => {
                    let tempRemarksRecord: Record<number, string[]> = {};
                    responses.forEach((res, index) => {
                        tempRemarksRecord[allBuildingsOnTour[index].building] = res.data.map(
                            (remark: RemarkAtBuildingInterface) => remark.remark
                        );
                    });
                    setRemarksRecord(tempRemarksRecord);
                })
                .catch(console.error);
        }
    }, [allBuildingsOnTour]);

    // Get new analysis upon change of the student, tour or date
    useEffect(() => {
        const sotObject = getStudentOnTour(allToursOfStudent, selectedTourId, selectedDate);
        if (sotObject) {
            setCurrentBuildingIndex(sotObject.current_building_index);
            getAnalysisStudentOnTour(sotObject.sot.id)
                .then((res) => {
                    const b: BuildingAnalysis[] = res.data;
                    setAnalysis(b);
                })
                .catch(console.error);

            const { wsProgress, wsRemarks } = setupWebsocketsForStudentOnTour(sotObject.sot.id);

            setLoading(false);

            return () => {
                wsProgress.close();
                wsRemarks.close();
            };
        }

        setLoading(false);
    }, [selectedStudentId, selectedTourId, selectedDate]);

    if (loading) {
        return (
            <>
                <AdminHeader />
                <Loading />
            </>
        );
    }

    return (
        <div>
            <AdminHeader />
            <div style={{ display: "flex", marginTop: "10px", marginBottom: "50px", marginLeft: "10px" }}>
                <div style={{ flex: 1 }}>
                    <StudentAutocomplete
                        initialId={selectedStudentId}
                        setObjectId={setSelectedStudentId}
                        required={false}
                    />
                </div>
                <div style={{ flex: 1 }}>
                    <StudentOnTourAutocomplete
                        initialId={selectedTourId}
                        setObjectId={setSelectedTourId}
                        required={false}
                        studentId={selectedStudentId}
                    />
                </div>
                <div style={{ flex: 1 }}>
                    <label htmlFor="datepicker">Selecteer datum</label>
                    <ReactDatePicker
                        selected={selectedDate}
                        onChange={(date: Date) => setSelectedDate(date)}
                        highlightDates={validDates} // highlight valid dates
                        filterDate={(date: Date) =>
                            validDates.map((d) => d.toLocaleDateString()).includes(date.toLocaleDateString())
                        }
                    />
                </div>
            </div>
            {selectedStudentId && (
                <div style={{ display: "flex", marginLeft: "10px" }}>
                    <div style={{ width: "20%" }}>
                        <h2>{selectedTourName}</h2>
                        <b>Verantwoordelijke:</b>
                        <p>{selectedStudentName}</p>
                        <b>Datum:</b>
                        <p>{selectedDate.toLocaleDateString()}</p>
                    </div>

                    <div style={{ width: "80%" }}>
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Gebouw</th>
                                    <th>Adres</th>
                                    <th>Status</th>
                                    <th>Tijdstip afwerking</th>
                                    <th>Tijdsduur</th>
                                    <th>Opmerkingen</th>
                                </tr>
                            </thead>
                            <tbody>
                                {allBuildings.map((building) => {
                                    const ba = getBuildingAnalysis(building.id);
                                    const durationInSeconds = ba ? ba.duration_in_seconds : 0;
                                    const expectedDurationInSeconds = ba ? ba.expected_duration_in_seconds : 0;
                                    const timeColor = getSpentTimeColor(expectedDurationInSeconds, durationInSeconds);
                                    return (
                                        <tr key={building.id}>
                                            <td
                                                style={{ textDecoration: "underline", cursor: "pointer" }}
                                                onClick={() => goToBuildingPage(building.id)}
                                            >
                                                {building.name
                                                    ? building.name
                                                    : `Gebouw ${getBuildingIndex(building.id)}`}
                                            </td>
                                            <td>{getAddress(building)}</td>
                                            <td>{getBuildingStatus(building.id)}</td>
                                            <td>{getDepartureTimeString(building.id)}</td>
                                            <td
                                                style={{
                                                    textDecoration: "underline",
                                                    cursor: "pointer",
                                                    color: timeColor,
                                                }}
                                                onClick={goToAnalysisPage}
                                            >
                                                {getBuildingStatus(building.id) === "Afgewerkt"
                                                    ? secondsToTime(durationInSeconds)
                                                    : ""}
                                            </td>
                                            <td
                                                style={{ textDecoration: "underline", cursor: "pointer" }}
                                                onClick={() => goToBuildingPage(building.id)}
                                                title={
                                                    remarksRecord[building.id]
                                                        ? remarksRecord[building.id].join("\n")
                                                        : ""
                                                }
                                            >
                                                {remarksRecord[building.id] ? remarksRecord[building.id].length : 0}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}

export default withAuthorisation(AdminTour, ["Admin", "Superstudent"]);
