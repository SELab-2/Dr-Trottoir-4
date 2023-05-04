import StudentHeader from "@/components/header/studentHeader";
import { withAuthorisation } from "@/components/withAuthorisation";
import PersonalSchedule from "@/components/student/PersonalSchedule";


function StudentDashboard() {

    return (
        <>
            <StudentHeader />
            <PersonalSchedule redirectTo="/student/overview"/>
        </>
    );
}

export default withAuthorisation(StudentDashboard, ["Student"]);
