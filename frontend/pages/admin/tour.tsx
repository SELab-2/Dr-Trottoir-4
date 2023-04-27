import React, { useState, useEffect } from "react";

import { getAllTours, Tour } from "@/lib/tour";
import { getAllStudentOnTourFromDate, getAllStudentOnTourFromToday, StudentOnTour } from "@/lib/student-on-tour";
import { getAllUsers, User, userSearchString } from "@/lib/user";
import { BuildingOnTour, getAllBuildingsOnTourWithTourID } from "@/lib/building-on-tour";
import TourAutocomplete from "@/components/autocompleteComponents/tourAutocomplete";
import StudentAutocomplete from "@/components/autocompleteComponents/studentAutocomplete";
import { BuildingInterface } from "@/lib/building";
import { withAuthorisation } from "@/components/withAuthorisation";
import { useRouter } from "next/router";
import AdminHeader from "@/components/header/adminHeader";
import Loading from "@/components/loading";

interface ParsedUrlQuery {}

interface DataAdminTourQuery extends ParsedUrlQuery {
    student?: number;
    tour?: number;
}

function AdminTour() {
    const router = useRouter();
    const [tours, setTours] = useState<Tour[]>([]);
    const [studentsOnTours, setStudentsOnTours] = useState<StudentOnTour[]>([]);
    const [students, setStudents] = useState<User[]>([]);
    const [selectedStudent, setSelectedStudent] = useState<User | null>(null);
    const [selectedTour, setSelectedTour] = useState<Tour | null>(null);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().substring(0, 10));
    const [studentOnTour, setStudentOnTour] = useState<StudentOnTour | null>(null);
    const [buildings, setBuildings] = useState<BuildingInterface[]>([]);
    const [studentId, setStudentId] = useState("");
    const [tourId, setTourId] = useState("");
    const query: DataAdminTourQuery = router.query as DataAdminTourQuery;
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        try {
            getAllTours().then(
                (res) => {
                    const tours: Tour[] = res.data;
                    setTours(tours);
                    let currentTour = tours[0];
                    if (query.tour) {
                        currentTour = tours.find(e => e.id === +[query.tour]) || tours[0];
                    }
                    setSelectedTour(currentTour);
                }
            );

            getAllUsers().then(
                (res) => {
                    const students: User[] = res.data;
                    setStudents(students);
                    let currentStudent = students[0];
                    if (query.student) {
                        currentStudent = students.find(e => e.id === +[query.student]) || students[0];
                    }
                    setSelectedStudent(currentStudent);
                }
            );
        } catch(error) {
            console.error(error);
        }
    }, [router.isReady]);

    useEffect(() => {
        const fetchBuildings = async () => {
            if (selectedTour) {
                const response = await getAllBuildingsOnTourWithTourID(selectedTour.id);
                setBuildings(response.data);
            }
        };
        fetchBuildings();
    }, [selectedTour]);

    useEffect(() => {
        if (selectedStudent && selectedTour) {
        const foundStudentOnTour = studentsOnTours.find(
            (sot) => sot.student === selectedStudent.id && sot.tour === selectedTour.id
        );
        setStudentOnTour(foundStudentOnTour || null);
        setLoading(false);
        }
        
    }, [selectedStudent, selectedTour, studentsOnTours]);

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
        <div>
            <StudentAutocomplete
            value={userSearchString(selectedStudent || students[0])}
            onChange={setSelectedStudent}
            setObjectId={setStudentId}
            required={true}
            />
            <TourAutocomplete
            value={selectedTour}
            onChange={setSelectedTour}
            setObjectId={setTourId}
            required={true}
            />
            <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            />
        </div>

        {studentOnTour && (
            <div style={{ display: "flex" }}>
            <div style={{ width: "20%" }}>
                <h2>Tour Details</h2>
                {/* Display the tour details */}
                <p>Tour Name: {studentOnTour.tour}</p>
                <p>
                Student Name: {studentOnTour.student}
                </p>
                {/* Add any other relevant information */}
                <p>Datum: {selectedDate}</p>
            </div>

            <div style={{ width: "80%" }}>
                <h2>Building Details</h2>
                <table className="table">
                <thead>
                    <tr>
                    <th>Building</th>
                    <th>Status</th>
                    <th>Time of Completion</th>
                    <th>Total Time</th>
                    <th>Remarks (yes/no)</th>
                    <th>All Pictures Are Present (yes/no)</th>
                    </tr>
                </thead>
                <tbody>
                    {buildings.map((building) => {
                    // Populate the table with the building details
                    // Replace the placeholders with actual data from your backend
                    return (
                        <tr key={building.id}>
                        <td>{building.name}</td>
                        <td>Afgewerkt</td>
                        <td>18h55</td>
                        <td>8m23s</td>
                        <td>{building.id ? "yes" : "no"}</td>
                        <td>
                            {building.id ? "yes" : "no"}
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
