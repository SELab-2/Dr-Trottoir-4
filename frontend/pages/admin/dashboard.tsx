import React, {useEffect, useState} from 'react';
import {useRouter} from 'next/router';
import {getAllTours, Tour} from '@/lib/tour';
import {getAllStudentOnTourFromDate, getProgress, StudentOnTour} from '@/lib/student-on-tour';
import {getAllUsers, getUserRole, User} from '@/lib/user';
import AdminHeader from "@/components/header/adminHeader";
import {withAuthorisation} from "@/components/withAuthorisation";
import Loading from "@/components/loading";
import LinearProgress from '@mui/material/LinearProgress';
import Box from '@mui/material/Box';
import {styled} from '@mui/system';
import LiveField from '@/components/liveField';

const GreenLinearProgress = styled(LinearProgress)(() => ({
    height: '20px',
    backgroundColor: '#c8e6c9', // Light green background color
    '& .MuiLinearProgress-bar': {
        backgroundColor: '#4caf50', // Main green progress bar color
    },
}));

function AdminDashboard() {
    const router = useRouter();
    const [tours, setTours] = useState<Tour[]>([]);
    const [studentOnTours, setStudentOnTours] = useState<StudentOnTour[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [remarksCount, setRemarksCount] = useState<Record<string, number>>({});
    const [counter, setCounter] = useState(0);

    const fetchCounter = () => Promise.resolve(counter);

    const fetchRemarks = async (studentOnTourId: number) => {
        // Fetch remarks based on studentOnTourId
        // Return an array of remarks
    };

    const fetchAllRemarks = async () => {
        // // Fetch all remarks for each studentOnTour and store the count in remarksCount
        // const newRemarksCount = {};
        // for (const studentOnTour of studentOnTours) {
        //     const remarks = await fetchRemarks(studentOnTour.id);
        //     newRemarksCount[studentOnTour.id] = remarks.length;
        // }
        // setRemarksCount(newRemarksCount);
    };

    const redirectToRemarksPage = (studentOnTourId: number) => {
        // // Redirect to a new page with the studentOnTourId as a parameter
        // router.push(`/remarks/${studentOnTourId}`);
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                //TODO I set the date to 2015 so all tours will show up for development purposes. this will
                //obviously have to be changed down the late to only show today's tours
                const startDate = new Date(2015, 0, 1);
                const endDate = new Date();
                const tourResponse = await getAllTours();
                const studentOnTourResponse = await getAllStudentOnTourFromDate({startDate, endDate});
                const allUsersResponse = await getAllUsers();

                setTours(tourResponse.data);
                setStudentOnTours(studentOnTourResponse.data);
                setUsers(allUsersResponse.data);

                setLoading(false);
                if (studentOnTours.length > 0) {
                    await fetchAllRemarks();
                }
            } catch (error) {
                console.error(error);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <>
                <AdminHeader/>
                <Loading/>
            </>
        );
    }
//TODO right now the progress bar always shows a fixed value of 50%
    return (
        <div>
            <AdminHeader/>
            <h2>Rondes van vandaag</h2>
            <div>
                <h1>Counter: <LiveField fetcher={fetchCounter} formatter={(count) => count.toString()} /></h1>
                <button onClick={() => setCounter(counter + 1)}>Increment</button>
            </div>
            <table className="table">
                <thead>
                <tr>
                    <th>Ronde</th>
                    <th>Student</th>
                    <th>Voortgang</th>
                </tr>
                </thead>
                <tbody>
                {studentOnTours.map((studentOnTour) => {
                    const tour = tours.find((t) => t.id === studentOnTour.tour);
                    const user = users.find((u) => u.id === studentOnTour.student);

                    if (!tour || !user) return null;

                    return (
                        <tr key={studentOnTour.id}>
                            <td>{tour.name}</td>
                            <td>{`${user.first_name} ${user.last_name}`}</td>
                            <td>
                                <Box sx={{width: '100%'}}>
                                    <GreenLinearProgress variant="determinate" value={50}/>
                                </Box>
                            </td>
                            <td>
                                {remarksCount[studentOnTour.id] > 0 ? (
                                    <button onClick={() => redirectToRemarksPage(studentOnTour.id)}>
                                        Bekijk opmerkingen
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
        </div>

    );
}

export default withAuthorisation(AdminDashboard, ["Admin", "Superstudent"]);
