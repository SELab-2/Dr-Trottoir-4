import {useRouter} from "next/router";
import React, {useEffect, useState} from "react";
import {WorkingView} from "@/components/student/workingView";
import AdminHeader from "@/components/header/adminHeader";
import {withAuthorisation} from "@/components/withAuthorisation";

interface ParsedUrlQuery {}

interface DataBuildingIdQuery extends ParsedUrlQuery {
    studentOnTourId?: number;
}
function Working() {

    const router = useRouter();
    const [studentOnTourId, setStudentOnTourId] = useState<number | null>(null);

    useEffect(() => {
        const query: DataBuildingIdQuery = router.query as DataBuildingIdQuery;
        if (query.studentOnTourId) {
            setStudentOnTourId(query.studentOnTourId);
        }
    }, [router.isReady]);

    return (
        <>
            <AdminHeader/>
            <WorkingView studentOnTourId={studentOnTourId} redirectTo="/admin/my-schedule/overview"/>
        </>
    );
}

export default withAuthorisation(Working, ["Admin", "Superstudent"]);