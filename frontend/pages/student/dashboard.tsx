import StudentHeader from "@/components/header/studentHeader";
import { withAuthorisation } from "@/components/withAuthorisation";
import PersonalSchedule from "@/components/student/PersonalSchedule";

function StudentDashboard() {
    return (
        <div className="tablepageContainer">
            <StudentHeader />
            <div className="tableContainer">
                <PersonalSchedule redirectTo="/student/overview" />
            </div>
        </div>
    );
}

export default withAuthorisation(StudentDashboard, ["Student"]);
