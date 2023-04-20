import AdminHeader from "@/components/header/adminHeader";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { getAllTours, Tour } from "@/lib/tour";
import { getAllUsers, User } from "@/lib/user";
import { withAuthorisation } from "@/components/withAuthorisation";
import Loading from "@/components/loading";
import MyCalendar from "@/components/calendar/calendar";

function AdminDataSchedule() {
    const router = useRouter();
    const [allTours, setAllTours] = useState<Tour[]>([]);
    const [allStudents, setAllStudents] = useState<User[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        getStudents();
        getTours();
        setLoading(false);
    }, [router.isReady]);

    // Get all the active students
    function getStudents() {
        getAllUsers(false).then(
            (res) => {
                const students: User[] = res.data.filter(function (user: User) {
                    return user.role == 4;
                });
                setAllStudents(students);
            },
            (err) => {
                console.error(err);
            }
        );
    }

    // Get all the tours
    function getTours() {
        getAllTours().then(
            (res) => {
                const tours: Tour[] = res.data;
                setAllTours(tours);
            },
            (err) => {
                console.error(err);
            }
        );
    }

    return (
        <>
            <AdminHeader />
            {loading ? (
                <Loading />
            ) : (
                <div>
                    <MyCalendar students={allStudents} tours={allTours} />
                </div>
            )}
        </>
    );
}

export default withAuthorisation(AdminDataSchedule, ["Admin", "SuperStudent"]);
