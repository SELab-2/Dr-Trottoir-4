import PersonalSchedule from "@/components/student/PersonalSchedule";
import AdminHeader from "@/components/header/adminHeader";
import {withAuthorisation} from "@/components/withAuthorisation";

interface ParsedUrlQuery {
}

function MySchedule() {
    return (
        <>
            <AdminHeader />
            <PersonalSchedule redirectTo="/admin/my-schedule/overview"/>
        </>
    );
}

export default withAuthorisation(MySchedule, ["Admin", "Superstudent"]);