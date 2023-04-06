import StudentHeader from "@/components/header/studentHeader";
import { withAuthorisation } from "@/components/withAuthorisation";
import {useEffect, useState} from "react";
import getStudentOnTour, {formatDate} from "@/lib/student-on-tour";
import {getCurrentUser, User} from "@/lib/user";

function StudentDashboard() {

    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const d = formatDate(new Date(Date.now()));
        console.log(d);

        getCurrentUser().then(res => {
            const u : User = res.data;
            setUser(u);
            console.log(u);
        }, console.error);
    }, []);

    useEffect(() => {
        if (! user) {
            return;
        }
        getStudentOnTour(user.id, {startDate: new Date(Date.now()), endDate: new Date(Date.now())}).then(res => {
            console.log(res.data);
        }, console.error);
    }, [user]);

    return (
        <>
            <StudentHeader />
            <p>
                https://www.figma.com/proto/9yLULhNn8b8SlsWlOnRSpm/SeLab2-mockup?node-id=32-29&scaling=contain&page-id=0%3A1&starting-point-node-id=118%3A1486
            </p>
        </>
    );
}

export default withAuthorisation(StudentDashboard, ["Student"]);
