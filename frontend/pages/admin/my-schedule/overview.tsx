import AdminHeader from "@/components/header/adminHeader";
import { withAuthorisation } from "@/components/withAuthorisation";
import PlannedBuildingList from "@/components/student/PlannedBuildingList";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

interface ParsedUrlQuery {}

interface DataScheduleQuery extends ParsedUrlQuery {
    studentOnTourId?: number;
}

function MyTourOverview() {
    const router = useRouter();
    const [studentOnTourId, setStudentOnTourId] = useState<number | null>(null);

    useEffect(() => {
        const query: DataScheduleQuery = router.query as DataScheduleQuery;
        if (query.studentOnTourId) {
            setStudentOnTourId(query.studentOnTourId);
        }
    }, [router.isReady]);

    return (
        <>
            <AdminHeader />
            <PlannedBuildingList redirectTo="/admin/my-schedule/working" studentOnTourId={studentOnTourId} />
        </>
    );
}

export default withAuthorisation(MyTourOverview, ["Admin", "Superstudent"]);
