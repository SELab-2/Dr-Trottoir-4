import React, { useState, useEffect } from "react";
import "react-datepicker/dist/react-datepicker.css";
import ReactDatePicker from "react-datepicker";
import { getAllTours, getTour, Tour } from "@/lib/tour";
import {
getToursOfStudent,
StudentOnTour,
} from "@/lib/student-on-tour";
import { getAllUsers, getStudents, User, userSearchString } from "@/lib/user";
import {
BuildingOnTour,
getAllBuildingsOnTourWithTourID,
} from "@/lib/building-on-tour";
import StudentAutocomplete from "@/components/autocompleteComponents/studentAutocomplete";
import { BuildingInterface, getAddress, getBuildingInfo } from "@/lib/building";
import { withAuthorisation } from "@/components/withAuthorisation";
import { useRouter } from "next/router";
import AdminHeader from "@/components/header/adminHeader";
import Loading from "@/components/loading";
import StudentOnTourAutocomplete from "@/components/autocompleteComponents/studentOnTourAutocomplete";
import { BuildingAnalysis } from "@/types";
import { getAnalysisStudentOnTour } from "@/lib/analysis";

interface ParsedUrlQuery {}

interface DataAdminTourQuery extends ParsedUrlQuery {
    student?: number;
    tour?: number;
}

function AdminTour() {
    const router = useRouter();
    const [allToursOfStudent, setAllToursOfStudent] = useState<StudentOnTour[]>([]);
    const [allStudents, setAllStudents] = useState<User[]>([]);
    const [allBuildingsOnTour, setAllBuildingsOnTour] = useState<BuildingOnTour[]>([]);
    const [allBuildings, setAllBuildings] = useState<BuildingInterface[]>([]);
    const [selectedStudentId, setSelectedStudentId] = useState<number>(0);
    const [selectedStudentName, setSelectedStudentName] = useState<string>("");
    const [selectedTour, setSelectedTour] = useState<Tour | null>(null);
    const [selectedTourId, setSelectedTourId] = useState<number>(0);
    const [selectedTourName, setSelectedTourName] = useState<string>("");
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [validDates, setValidDates] = useState<Date[]>([]);
    const [selectedStudentOnTour, setSelectedStudentOnTour] = useState<StudentOnTour | null>(null);
    const [analysis, setAnalysis] = useState<BuildingAnalysis[]>([]);

    const query: DataAdminTourQuery = router.query as DataAdminTourQuery;
    const [loading, setLoading] = useState(true);

    const updateValidDates = (sots: StudentOnTour[], tourId: number) => {
        const validDatesArray = sots.filter((sot) => sot.tour === tourId).map((sot) => new Date(sot.date));
        setValidDates(validDatesArray);

        const startedTours = sots.filter(sot => sot.started_tour !== null);

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
    }

    const getStudentOnTour = (sots: StudentOnTour[], tourId: number, date: Date) => {
        const sot = sots.find((sot) => sot.tour === tourId && new Date(sot.date).toISOString().split('T')[0] === new Date(date).toISOString().split('T')[0]);
        return (sot) ? sot : null;
    }

    const getBuildingIndex = (buildingId: number) => {
        const buildingOnTour = allBuildingsOnTour.find((buildingOnTour: BuildingOnTour) => buildingOnTour.building === buildingId);
        return (buildingOnTour) ? buildingOnTour.index : 0;
    }

    const getBuildingStatus = (buildingId: number) => {
        const sot: StudentOnTour | null = getStudentOnTour(allToursOfStudent, selectedTourId, selectedDate);

        let returnText = "Nog niet gedaan";
        if (sot) {
            if (sot.started_tour) {
                const buildingIndex = getBuildingIndex(buildingId);
                if (sot.current_building_index > buildingIndex) {
                    returnText = "Afgewerkt";
                } else if (sot.current_building_index === buildingIndex){
                    returnText = "Bezig";
                }
            }
        }
        return returnText;
    }

    // First, fetch all students when the router is ready.
    // Set the selected student ID based on the router query or default to the first student.
    useEffect(() => {
        try {
        getStudents().then((res) => {
            const students: User[] = res.data;
            students.filter((e) => e.role === 4);
            setAllStudents(students);
            let currentStudent = students[0];
            if (query.student) {
            currentStudent =
                students.find((e) => e.id === +[query.student]) || students[0];
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
            //setSelectedStudentOnTour(currentSot);

            updateValidDates(sots, currentSot.tour);
        });
    }, [selectedStudentId]);


    // When selected tour ID changes, fetch details of the tour and update selected tour.
    // Also fetch all buildings on that tour.
    // Also change the validDates
    useEffect(() => {
        if (!selectedTourId) return;

        getTour(selectedTourId).then((res) => {
        const tour: Tour = res.data;
        setSelectedTour(tour);
        setSelectedTourName(tour.name);
        }).catch(console.error);

        getAllBuildingsOnTourWithTourID(selectedTourId).then((res) => {
            setAllBuildingsOnTour(res.data);
        }).catch(console.error);

        updateValidDates(allToursOfStudent, selectedTourId);
    }, [selectedTourId]);


    // When the list of buildings on tour changes, fetch all building details.
    useEffect(() => {
        if (!allBuildingsOnTour.length) return;

        Promise.all(allBuildingsOnTour.map((buildingOnTour) => getBuildingInfo(buildingOnTour.building)))
        .then((responses) => {
            setAllBuildings(responses.map(response =>response.data));
        }).catch(console.error);
    }, [allBuildingsOnTour]);


    useEffect(() => {
        const sot = getStudentOnTour(allToursOfStudent, selectedTourId, selectedDate);
        if (sot) {
            getAnalysisStudentOnTour(sot.id).then((res) => {
                const b: BuildingAnalysis[] = res.data;
                setAnalysis(b);
            })
        }
        
        setLoading(false);

    }, [selectedStudentId, selectedTourId, selectedDate]);

    // For debuggin purposes
    // useEffect(() => {
    //     console.log(`selectedStudentId: ${selectedStudentId}`);
    //     console.log(`selectedTourId: ${selectedTourId}`);
    //     console.log(`selectedDate: ${selectedDate}`);
    //     console.log("selectedStudentOnTour:");
    //     console.log(selectedStudentOnTour);
    //     console.log("allToursOfStudent:");
    //     console.log(allToursOfStudent);
    // }, [selectedTourId, selectedStudentId, selectedDate, selectedStudentOnTour, allToursOfStudent]);

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
        <div>
            <StudentAutocomplete
            initialId={selectedStudentId}
            setObjectId={setSelectedStudentId}
            required={true}
            />
            <StudentOnTourAutocomplete
            initialId={selectedTourId}
            setObjectId={setSelectedTourId}
            required={true}
            studentId={selectedStudentId}
            />
            <ReactDatePicker
            selected={selectedDate}
            onChange={(date: Date) => setSelectedDate(date)}
            highlightDates={validDates} // highlight valid dates
            filterDate={(date: Date) => validDates.map(d => d.toLocaleDateString()).includes(date.toLocaleDateString())}
            />
        </div>
        {selectedStudentId && (
            <div style={{ display: "flex" }}>
            <div style={{ width: "20%" }}>
                <h2>Tour Details</h2>
                {/* Display the tour details */}
                <p>Tour Name: {selectedTourName}</p>
                <p>Student Name: {selectedStudentName}</p>
                {/* Add any other relevant information */}
            </div>

            <div style={{ width: "80%" }}>
                <h2>Building Details</h2>
                <table className="table">
                <thead>
                    <tr>
                    <th>Gebouw</th>
                    <th>Adres</th>
                    <th>Status</th>
                    <th>Tijdstip afwerking</th>
                    <th>Tijdsduur</th>
                    <th>Opmerkingen</th>
                    <th>Alle foto's aanwezig</th>
                    </tr>
                </thead>
                <tbody>
                    {allBuildings.map((building) => {
                    // Populate the table with the building details
                    // Replace the placeholders with actual data from your backend
                    return (
                        <tr key={building.id}>
                        <td>{building.name}</td>
                        <td>{getAddress(building)}</td>
                        <td>{getBuildingStatus(building.id)}</td>
                        <td>18h55</td>
                        <td>8m23s</td>
                        <td>{building.id ? "yes" : "no"}</td>
                        <td>{building.id ? "yes" : "no"}</td>
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
