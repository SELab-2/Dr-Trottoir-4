import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import StudentHeader from "@/components/header/studentHeader";
import { withAuthorisation } from "@/components/withAuthorisation";
import {WorkingView} from "@/components/student/workingView";

interface ParsedUrlQuery {}

interface DataBuildingIdQuery extends ParsedUrlQuery {
    studentOnTourId?: number;
}

/**
 * This page receives a studentOnTourId & buildingId, otherwise nothing is displayed
 */
function StudentWorking() {
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
            <StudentHeader />
            <WorkingView studentOnTourId={studentOnTourId} redirectTo="/student/overview"/>
        </>
    );
}

export default withAuthorisation(StudentWorking, ["Student"]);
