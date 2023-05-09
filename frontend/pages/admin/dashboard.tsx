import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { getAllTours, Tour } from "@/lib/tour";
import { getAllStudentOnTourFromToday, StudentOnTour } from "@/lib/student-on-tour";
import { getAllUsers, User } from "@/lib/user";
import AdminHeader from "@/components/header/adminHeader";
import { withAuthorisation } from "@/components/withAuthorisation";
import Loading from "@/components/loading";
import LinearProgress from "@mui/material/LinearProgress";
import Box from "@mui/material/Box";
import { styled } from "@mui/system";
import LiveField from "@/components/liveField";
import { BuildingOnTour, getAllBuildingsOnTourWithTourID } from "@/lib/building-on-tour";
import {
    getRemarksAtBuildingOfSpecificBuilding,
    RemarkAtBuildingInterface,
    translateRemartAtBuildingType,
} from "@/lib/remark-at-building";

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
    const [remarksRecord, setRemarksRecord] = useState<Record<string, number>>({});
    const [progressRecord, setProgressRecord] = useState<Record<string, number>>({});

    const getRemarkText = (numberOfRemarks: number): string => {
        let extension = "";
        if (numberOfRemarks > 1) {
            extension = "en";
        }

        return `${numberOfRemarks} opmerking${extension}`;
    };

    const fetchRemarks = async (studentOnTour: StudentOnTour): Promise<number> => {
        // Fetch remarks based on studentOnTourId
        // Return an array of remarks
        // TODO change this to query the remarks of a specific student_on_tour
        // once it is possible
        let remarksCount = 0;
        await getAllBuildingsOnTourWithTourID(studentOnTour.tour).then(
            async (buildingRes) => {
                const buildingsOnTour: BuildingOnTour[] = buildingRes.data;
                for (const buildingOnTour of buildingsOnTour) {
                    await getRemarksAtBuildingOfSpecificBuilding(buildingOnTour.building).then((remarkRes) => {
                        // don't actually care about the remark, just the count
                        const remarks: RemarkAtBuildingInterface[] = remarkRes.data;
                        for (const remark of remarks) {
                            if (translateRemartAtBuildingType(remark.type) === "Opmerking") {
                                remarksCount++;
                            }
                        }
                    });
                }
            },
            (err) => {
                console.error(err);
            }
        );
        return remarksCount;
    };

    const fetchProgress = async (studentOnTourId: number): Promise<number> => {
        // Fetch progress
        // TODO update this after the progress can be queried
        return studentOnTourId * 5;
    };

    const redirectToRemarksPage = async (studentOnTourId: number) => {
        // Redirect to the specific tour page
        await router.push({
            pathname: `tour/`,
            query: {
                studentOnTour: studentOnTourId,
            },
        });
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                //TODO I set the date to 2015 so all tours will show up for development purposes. this will
                //obviously have to be changed down the late to only show today's tours
                const startDate = new Date(2015, 0, 1);
                const endDate = new Date();
                const tourResponse = await getAllTours();
                const studentOnTourResponse = await getAllStudentOnTourFromToday();
                const allUsersResponse = await getAllUsers();

                setTours(tourResponse.data);
                setStudentsOnTours(studentOnTourResponse.data);
                setUsers(allUsersResponse.data);
            } catch (error) {
                console.error(error);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        setLoading(false);
        const fetchData = async () => {
            const newRemarks: Record<string, number> = {};
            const newProgress: Record<string, number> = {};
            for (const studentOnTour of studentsOnTours) {
                const remarks = await fetchRemarks(studentOnTour);
                const progress = await fetchProgress(studentOnTour.id);

                newRemarks[studentOnTour.id] = remarks;
                newProgress[studentOnTour.id] = progress;
            }
            setRemarksRecord(newRemarks);
            setProgressRecord(newProgress);
        };

        fetchData();
    }, [tours, studentsOnTours, users]);

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
            {studentsOnTours.length > 0 ? (
                <>
                    <h2>Rondes van vandaag</h2>
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
                                            <Box sx={{ width: "100%" }}>
                                                <GreenLinearProgress
                                                    variant="determinate"
                                                    value={progressRecord[studentOnTour.id] || 0}
                                                />
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
                </>
            ) : (
                <h2>Geen rondes vandaag</h2>
            )}
        </div>
    );
}

export default withAuthorisation(AdminDashboard, ["Admin", "Superstudent"]);
