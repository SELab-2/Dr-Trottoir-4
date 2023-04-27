import React, { useState, useEffect } from "react";
import { Tour } from "@/lib/tour";
import { StudentOnTour } from "@/lib/student-on-tour";
import { User } from "@/lib/user";
import { BuildingOnTour } from "@/lib/building-on-tour";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { DatePicker, LocalizationProvider } from "@material-ui/lab";
import DateAdapter from "@material-ui/lab/AdapterMoment";
import TourAutocomplete from "@/components/autocompleteComponents/tourAutocomplete";
import StudentAutocomplete from "@/components/autocompleteComponents/studentAutocomplete";
import { BuildingInterface } from "@/lib/building";

function AdminTour() {
    const [allTours, setAllTours] = useState<Tour[]>([]);
    const [students, setAllStudents] = useState<User[]>([]);
    const [buildings, setAllBuildings] = useState<BuildingInterface[]>([]);

    const [selectedTour, setSelectedTour] = useState<Tour | null>(null);
    const [selectedStudent, setSelectedStudent] = useState<User | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [rows, setRows] = useState<any[]>([]);
    const [tourId, setTourId] = useState("");
    const [studentId, setStudentId] = useState("");

    // Columns for the Material React Table
    const columns = [
        { Header: "Building", accessor: "building" },
        { Header: "Status", accessor: "status" },
        { Header: "Timestamp of completion", accessor: "timestamp" },
        { Header: "Total time", accessor: "totalTime" },
        { Header: "Remarks", accessor: "remarks" },
        { Header: "All pictures present", accessor: "allPicturesPresent" },
    ];

    useEffect(() => {
        // Populate rows for the Material React Table based on the selected tour, student, and date
        if (selectedTour && selectedStudent && selectedDate) {
        const buildingRows = buildingsOnTour.map((buildingOnTour) => ({
            building: buildingOnTour.building,
            status: "Finished", // Replace this with actual data
            timestamp: "2023-04-19 12:34:56", // Replace this with actual data
            totalTime: "1h 15m", // Replace this with actual data
            remarks: "Yes", // Replace this with actual data
            allPicturesPresent: "Yes", // Replace this with actual data
        }));
        setRows(buildingRows);
        } else {
        setRows([]);
        }
    }, [selectedTour, selectedStudent, selectedDate, buildingsOnTour]);

    return (
        <table className="table">
                    <thead>
                    <tr>
                        <th>Ronde</th>
                        <th>Student</th>
                        <th>Voortgang</th>
                    </tr>
                    </thead>
                    <tbody>
                    {studentsOnTours.map((studentOnTour) => {
                        const tour = tours.find((t) => t.id === studentOnTour.tour);
                        const user = users.find((u) => u.id === studentOnTour.student);

                        if (!tour || !user) return null;

                        return (
                            <tr key={studentOnTour.id}>
                                <td>{tour.name}</td>
                                <td>{`${user.first_name} ${user.last_name}`}</td>
                                <td>
                                    <Box sx={{width: '100%'}}>
                                        <GreenLinearProgress variant="determinate" value={progressRecord[studentOnTour.id] || 0}/>
                                    </Box>
                                </td>
                                <td>
                                    {remarksRecord[studentOnTour.id] > 0 ? (
                                        <button onClick={() => redirectToRemarksPage(studentOnTour.id)}>
                                            <LiveField 
                                                fetcher={() => fetchRemarks(studentOnTour)}
                                                formatter={getRemarkText}
                                                interval={3000}
                                            />
                                        </button>
                                    ) : (
                                        "Geen opmerkingen"
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                    </tbody>
                </table>
    );
}

export default AdminTour;

