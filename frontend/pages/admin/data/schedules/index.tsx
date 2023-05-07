import AdminHeader from "@/components/header/adminHeader";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { getAllTours, Tour } from "@/lib/tour";
import { getAllUsers, getTourUsers, getTourUsersFromRegion, User } from "@/lib/user";
import { withAuthorisation } from "@/components/withAuthorisation";
import Loading from "@/components/loading";
import MyCalendar from "@/components/calendar/calendar";

function AdminDataSchedule() {
    const router = useRouter();
    const [allTours, setAllTours] = useState<Tour[]>([]);
    const [allTourUsers, setAllTourUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        getTourAllUsers();
        getTours();
        setLoading(false);
    }, [router.isReady]);

    // Get all the active students
    function getTourAllUsers() {
        getTourUsersFromRegion(null, false).then(
            (res) => {
                setAllTourUsers(res.data);
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
                    <MyCalendar tourUsers={allTourUsers} tours={allTours} />
                </div>
            )}
        </>
    );
}

export default withAuthorisation(AdminDataSchedule, ["Admin", "SuperStudent"]);
